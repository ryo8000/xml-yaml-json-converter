# 🌀 XML / YAML / JSON Converter

This project provides a serverless API that enables conversion between XML, YAML and JSON data formats. It is built using AWS Lambda and API Gateway, with infrastructure managed via Terraform.

---

## 📦 Tech Stack

* **Language:** TypeScript (Node.js)
* **Conversion Libraries:**
  * [`fast-xml-parser`](https://github.com/NaturalIntelligence/fast-xml-parser)
  * [`js-yaml`](https://github.com/nodeca/js-yaml)
* **Infrastructure:** AWS Lambda, API Gateway (REST API), Terraform

---

## 📋 API Usage

### Endpoint

```
POST /convert?from={source_format}&to={target_format}
```

### Parameters

- `from`: Source format (json, xml, yaml)
- `to`: Target format (json, xml, yaml)

### Example Request

```bash
curl -X POST "https://api-gateway-url/dev/convert?from=json&to=yaml" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30}'
```

### Example Response

```yaml
name: John
age: 30
```

---

## 🤖 MCP Server

The converter is also available as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server, so AI tools such as Claude Desktop, Claude Code and Cursor can convert documents deterministically instead of rewriting them by hand.

Build the standalone server executable:

```bash
npm install
npm run build:mcp
```

This bundles everything (including the same `convert()` function that powers the API) into `bin/mcp-server.js` — no runtime dependencies required.

### Claude Code

```bash
claude mcp add xml-yaml-json-converter -- node /absolute/path/to/xml-yaml-json-converter/bin/mcp-server.js
```

### Claude Desktop

Add the following to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "xml-yaml-json-converter": {
      "command": "node",
      "args": ["/absolute/path/to/xml-yaml-json-converter/bin/mcp-server.js"]
    }
  }
}
```

### Tool

The server exposes a single tool:

| Tool | Parameters | Description |
| --- | --- | --- |
| `convert_format` | `data` (string), `from` (`json` \| `xml` \| `yaml`), `to` (`json` \| `xml` \| `yaml`) | Converts `data` from the `from` format to the `to` format and returns the result as text. |

---

## 🛠 Development

### Prerequisites

- Node.js 22+
- npm
- AWS CLI (for deployment)
- Terraform (for infrastructure)

### Installation

```bash
npm install
```

### Test

```bash
npm test
```

### Browser Demo

The demo page in [`docs/`](./docs) is a static site that runs the converter fully client-side. Its logic is bundled from `web/demo.ts` with [esbuild](https://esbuild.github.io/):

```bash
npm run build:demo
```

This regenerates `docs/demo.js`. To publish it, enable **GitHub Pages** for the repository with the source set to the `docs/` folder on the default branch.

---

## 🚀 Deployment

### Deploy Infrastructure

```bash
./deploy.sh
```

### Destroy Infrastructure

```bash
./destroy.sh
```

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
