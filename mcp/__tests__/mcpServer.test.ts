import { execSync, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';

/**
 * End-to-end tests for the MCP server.
 *
 * These tests build the real bundle (`npm run build:mcp`) and drive it over
 * stdio with raw JSON-RPC, exactly like an MCP client (Claude Desktop,
 * Claude Code, Cursor, ...) would. No MCP SDK is needed on the test side.
 */

const projectRoot = path.resolve(__dirname, '../..');
const serverPath = path.join(projectRoot, 'bin', 'mcp-server.js');

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: number;
  result?: {
    serverInfo?: { name: string; version: string };
    tools?: { name: string; inputSchema?: { properties?: Record<string, unknown> } }[];
    content?: { type: string; text: string }[];
    isError?: boolean;
  };
  error?: { code: number; message: string };
}

class McpTestClient {
  private server: ChildProcessWithoutNullStreams;
  private buffer = '';
  private nextId = 1;
  private pending = new Map<number, (response: JsonRpcResponse) => void>();

  constructor() {
    this.server = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.server.stdout.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      let newlineIndex;
      while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, newlineIndex).trim();
        this.buffer = this.buffer.slice(newlineIndex + 1);
        if (line === '') {
          continue;
        }
        const message = JSON.parse(line) as JsonRpcResponse;
        if (message.id !== undefined && this.pending.has(message.id)) {
          this.pending.get(message.id)!(message);
          this.pending.delete(message.id);
        }
      }
    });
  }

  request(method: string, params: object): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(
        () => reject(new Error(`Timed out waiting for response to ${method}`)),
        10000
      );
      this.pending.set(id, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
      this.server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  notify(method: string): void {
    this.server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n');
  }

  async initialize(): Promise<JsonRpcResponse> {
    const response = await this.request('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'jest', version: '0.0.0' },
    });
    this.notify('notifications/initialized');
    return response;
  }

  callTool(name: string, args: object): Promise<JsonRpcResponse> {
    return this.request('tools/call', { name, arguments: args });
  }

  stop(): void {
    this.server.kill();
  }
}

describe('MCP server', () => {
  let client: McpTestClient;

  beforeAll(async () => {
    execSync('npm run build:mcp', { cwd: projectRoot, stdio: 'pipe' });
    client = new McpTestClient();
    await client.initialize();
  }, 60000);

  afterAll(() => {
    client.stop();
  });

  it('reports its server info on initialize', async () => {
    // A second client, so we assert on the initialize response itself.
    const freshClient = new McpTestClient();
    try {
      const response = await freshClient.initialize();
      expect(response.result?.serverInfo?.name).toBe('xml-yaml-json-converter');
    } finally {
      freshClient.stop();
    }
  });

  it('exposes the convert_format tool with data/from/to inputs', async () => {
    const response = await client.request('tools/list', {});
    const tool = response.result?.tools?.find((t) => t.name === 'convert_format');
    expect(tool).toBeDefined();
    expect(Object.keys(tool!.inputSchema?.properties ?? {}).sort()).toEqual([
      'data',
      'from',
      'to',
    ]);
  });

  it('converts JSON to YAML', async () => {
    const response = await client.callTool('convert_format', {
      data: '{"name":"John","age":30}',
      from: 'json',
      to: 'yaml',
    });
    expect(response.result?.isError).toBeUndefined();
    expect(response.result?.content?.[0]?.text).toBe('name: John\nage: 30\n');
  });

  it('converts XML to JSON', async () => {
    const response = await client.callTool('convert_format', {
      data: '<person><name>John</name></person>',
      from: 'xml',
      to: 'json',
    });
    expect(response.result?.isError).toBeUndefined();
    expect(response.result?.content?.[0]?.text).toBe('{"person":{"name":"John"}}');
  });

  it('returns a tool error for invalid input data', async () => {
    const response = await client.callTool('convert_format', {
      data: '{ not json',
      from: 'json',
      to: 'yaml',
    });
    expect(response.result?.isError).toBe(true);
    expect(response.result?.content?.[0]?.text).toContain('Conversion failed');
  });

  it('rejects unsupported formats via schema validation', async () => {
    const response = await client.callTool('convert_format', {
      data: '{}',
      from: 'toml',
      to: 'yaml',
    });
    // The SDK surfaces schema violations either as a JSON-RPC error or a tool error.
    const failed = response.error !== undefined || response.result?.isError === true;
    expect(failed).toBe(true);
  });
});
