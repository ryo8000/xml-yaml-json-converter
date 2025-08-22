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
