# Job Board Backend (NestJS + MongoDB)

A clean, production-ready REST API for a mini Job Board.  
Companies (admin) can post jobs; anyone can view jobs and submit applications.

- **Framework:** NestJS (Node.js / Express)
- **Database:** MongoDB (Mongoose)
- **Auth:** Basic Auth for admin-only job creation
- **Validation:** `class-validator` + Nest pipes
- **Config:** `@nestjs/config` + Joi schema validation
- **Security:** Helmet, compression, CORS
- **Port:** `8080` (configurable via `PORT`)
- **Healthcheck:** `GET /api/healthz`

---

## ✨ Features

- Jobs
    - `GET /api/jobs` — list jobs (search, pagination)
    - `GET /api/jobs/:id` — job details
    - `POST /api/jobs` — create job (**admin only** via Basic Auth)
- Applications
    - `POST /api/applications` — submit an application (name, email, CV link or cover text)
- Healthcheck
    - `GET /api/healthz` — lightweight liveness endpoint
- Strong validation, errors, and clean DTO responses
- Multiple environments: **development**, **staging**, **production**

---

## 📁 Project Structure

```
src/
  applications/
    applications.controller.ts
    applications.module.ts
    applications.service.ts
    dto/
      create-application.dto.ts
    schemas/
      application.schema.ts
  jobs/
    dto/
      create-job.dto.ts
      query-jobs.dto.ts
    jobs.controller.ts
    jobs.module.ts
    jobs.service.ts
    schemas/
      job.schema.ts
  common/
    guards/
      basic-auth.guard.ts
    pipes/
      objectid.pipe.ts
  health/
    health.controller.ts
    health.module.ts
  app.module.ts
  main.ts
```

---

## 🔧 Requirements

- Node.js 18+ (tested on 18, 20)
- MongoDB (local or Atlas)
- Git (for CI/CD)

---

## 🔧 Configuration

All runtime secrets are stored in `.env` files which are **not committed** to git.

### Using the templates
1. Download **config-templates.zip** (or see `config/` in the repo).
2. Unzip and copy one template to the project root:
  - `.env.development.example` → rename to `.env.development`
  - `.env.staging.example` → rename to `.env.staging`
  - `.env.production.example` → rename to `.env.production`
3. Fill in real values:
  - `MONGODB_URI` (use `mongodb://` or `mongodb+srv://` and **URL-encode** special characters in the password)
  - `ADMIN_USER` / `ADMIN_PASS` (for Basic Auth on POST /jobs)
  - Optional: `SWAGGER_*`, `CORS_ORIGIN`
4. Local run:
   ```bash
   npm run start:dev

## 🧪 Quick Start (Local)


1) **Install deps**
```bash
npm ci
```

2) **Create env files at repo root**
- `.env.development`
- `.env.staging`
- `.env.production`

Example **`.env.development`**:
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/jobboard_dev
ADMIN_USER=devAdmin
ADMIN_PASS=devPass
```

3) **Run (development)**
> Works on Windows/Mac/Linux using `cross-env` + `dotenv-cli`.
```bash
npm run start:dev
# API: http://localhost:8080/api
```

---

## 📦 Environment Configuration

This project uses `@nestjs/config` with Joi validation.  
**Required variables**:

- `MONGODB_URI` (supports `mongodb://` and `mongodb+srv://`)
- `ADMIN_USER`
- `ADMIN_PASS`
- `PORT` (default 8080)
- `NODE_ENV` in { `development`, `staging`, `production` }

Example **`.env.production`**:
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobboard
ADMIN_USER=realAdmin
ADMIN_PASS=superSecret
```

> In cloud hosts (Railway/Render/Vercel/Container), set these **as environment variables** in the dashboard.

---

## 🏗️ NPM Scripts

```json
{
  "scripts": {
    "start": "node dist/main.js",
    "start:dev": "cross-env NODE_ENV=development dotenv -e .env.development -- nest start --watch",
    "start:staging": "cross-env NODE_ENV=staging dotenv -e .env.staging -- node dist/main.js",
    "start:prod": "cross-env NODE_ENV=production dotenv -e .env.production -- node dist/main.js",

    "build": "nest build",
    "lint": "eslint \"src/**/*.ts\"",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch"
  }
}
```

> On Windows, `cross-env` avoids the “NODE_ENV is not recognized” error.

---

## 🔒 Authentication

Admin-only endpoint `POST /api/jobs` uses **Basic Auth**.

- Header: `Authorization: Basic <base64(username:password)>`
- Example:
  ```bash
  # admin:supersecret (base64)
  Authorization: Basic YWRtaW46c3VwZXJzZWNyZXQ=
  ```

Credentials are read from `ADMIN_USER` and `ADMIN_PASS`.

---

## 🧭 API Endpoints & Examples

Base URL (local): `http://localhost:8080/api`

### Health
```bash
curl http://localhost:8080/api/healthz
```

### Jobs — List (with search/pagination)
```bash
curl "http://localhost:8080/api/jobs?search=react&offset=0&limit=10"
```

### Jobs — Get One
```bash
curl http://localhost:8080/api/jobs/<jobId>
```

### Jobs — Create (Admin only)
```bash
curl -X POST http://localhost:8080/api/jobs   -H "Content-Type: application/json"   -H "Authorization: Basic $(printf 'devAdmin:devPass' | base64)"   -d '{
    "title": "Backend Engineer",
    "company": "Globex",
    "location": "Remote",
    "description": "NestJS, MongoDB, AWS"
  }'
```

### Applications — Submit
```bash
curl -X POST http://localhost:8080/api/applications   -H "Content-Type: application/json"   -d '{
    "jobId": "<jobId>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "cvLink": "https://example.com/cv/jane.pdf"
  }'
```
> Either `cvLink` or `coverText` is required.

---

## 🐳 Docker

**Dockerfile** is multi-stage, non-root, and exposes port **8080**.

Build & run:
```bash
docker build -t jobboard-backend:prod .
docker run -p 8080:8080   -e NODE_ENV=production   -e PORT=8080   -e MONGODB_URI="mongodb+srv://user:pass@cluster/db"   -e ADMIN_USER="realAdmin"   -e ADMIN_PASS="superSecret"   jobboard-backend:prod
```

### Docker Compose

`docker-compose.yml` (uses `.env.production`):
```yaml
services:
  jobboard-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jobboard-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
      PORT: "8080"
```

Run:
```bash
docker compose up --build -d
docker compose logs -f
docker compose down
```

---

## ☁️ Deployment

### Railway / Render (Node service)
- **Build:** `npm ci && npm run build`
- **Start:** `node dist/main.js`
- **Env vars:** `MONGODB_URI`, `ADMIN_USER`, `ADMIN_PASS`, `PORT=8080`, `NODE_ENV=production`
- Ensure outbound TLS works (Atlas requires proper CA certs; Dockerfile already installs them).

---

## 🤖 CI (GitHub Actions)

Basic CI (lint, test, build) runs on pushes to `main` and PRs.

Example workflow (`.github/workflows/ci.yml`):
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npx tsc -noEmit
      - run: npm test -- --passWithNoTests
      - run: npm run build
```

> Optional: add a Docker publish job to `ghcr.io` on successful builds of `main`.

---

## 📚 Design Notes

- **Validation:** DTOs + `ValidationPipe` (whitelist, transform, forbid non-whitelisted).
- **Error Handling:** Proper 400/401/404 codes; minimal leakage of internals.
- **Security:** Helmet + compression + permissive CORS (adjust origins as needed).
- **Mongoose:** `timestamps: true`; services return DTOs/lean objects (not raw docs) to avoid `Document<…>` type leaks.
- **Auth:** Lightweight Basic Auth via header; credentials stored in env.

---

## 🧰 Troubleshooting

- **`Config validation error: "MONGODB_URI" is required…`**
    - Ensure `.env.<env>` exists at root and script sets `NODE_ENV`.
    - Use `cross-env` + `dotenv-cli` scripts (already in `package.json`).

- **Windows: `NODE_ENV is not recognized`**
    - Use provided scripts (`cross-env`) or PowerShell:
      ```powershell
      $env:NODE_ENV="development"; nest start --watch
      ```

- **Docker: compose warns “variable is not set”**
    - Prefer `env_file: .env.production` instead of `${VAR}` interpolation in `environment:`.

- **MongoDB Atlas SRV URI**
    - Ensure TLS certs in runtime image (Dockerfile installs `ca-certificates`).

---

## ✅ Commit Style (suggested)

Use Conventional Commits:
- `feat(jobs): add create job endpoint`
- `fix(config): ensure env loads on Windows`
- `chore(docker): update Dockerfile to use port 8080`
- `docs(readme): add usage examples`

---

## 📝 License

MIT (or your choice)

---

## 🙌 Credits

Built with ❤️ using NestJS, Mongoose, and a sprinkle of good DevOps defaults.
