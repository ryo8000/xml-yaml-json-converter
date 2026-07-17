import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { convert } from '../src/formatConverter';

/**
 * MCP (Model Context Protocol) server for the XML / YAML / JSON converter.
 *
 * This entry point reuses the exact same `convert` function that powers the
 * serverless API, so the MCP tool can never drift from the API's behavior.
 * It is bundled into a standalone executable with esbuild (see
 * `npm run build:mcp`) and communicates over stdio, which is how MCP clients
 * such as Claude Desktop, Claude Code and Cursor launch local servers.
 */

const formatSchema = z.enum(['json', 'xml', 'yaml']);

const server = new McpServer({
  name: 'xml-yaml-json-converter',
  version: '1.0.0',
});

server.registerTool(
  'convert_format',
  {
    title: 'Convert between XML, YAML and JSON',
    description:
      'Converts structured data between XML, YAML and JSON formats. ' +
      'Use this for deterministic, lossless conversion of documents of any size — ' +
      'especially when hand-converting would be error-prone or waste tokens. ' +
      'Returns the converted document as text.',
    inputSchema: {
      data: z.string().describe('The document to convert, as a string.'),
      from: formatSchema.describe('Format of the input document.'),
      to: formatSchema.describe('Format to convert the document to.'),
    },
  },
  async ({ data, from, to }) => {
    try {
      return {
        content: [{ type: 'text', text: convert(data, from, to) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Conversion failed: ${(error as Error).message ?? String(error)}`,
          },
        ],
      };
    }
  }
);

const main = async (): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is reserved for the MCP protocol; log startup info to stderr.
  console.error('xml-yaml-json-converter MCP server running on stdio');
};

main().catch((error) => {
  console.error('Fatal error while starting MCP server:', error);
  process.exit(1);
});
