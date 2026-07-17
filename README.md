# 🌀 XML / YAML / JSON Converter

This project provides a serverless API that enables conversion between XML, YAML and JSON data formats. It is built using AWS Lambda and API Gateway, with infrastructure managed via Terraform.

---

## 🌐 Live Demo

Try it right in your browser — no install, no sign-up, nothing uploaded. The conversion runs **entirely client-side**:

**https://ryo8000.github.io/xml-yaml-json-converter/**

The demo bundles the exact same `convert()` function that powers the API, so it never drifts from the API's behavior.

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

This regenerates `docs/demo.js` locally for previewing (it's gitignored, not committed). On every push to `main`, [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) rebuilds the bundle and deploys `docs/` to GitHub Pages, so the demo can never drift out of sync with `web/demo.ts`. To enable this, set the repository's **GitHub Pages** source to **GitHub Actions** (Settings → Pages → Build and deployment).

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
