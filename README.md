---
title: SRE Command Center
description: Full-stack command center for SRE incident visibility, real-time updates, and API contract driven workflows
author: Faizan Hussain
ms.date: 2026-05-31
ms.topic: overview
keywords:
  - sre
  - incident management
  - command center
  - express
  - react
  - drizzle
  - openapi
estimated_reading_time: 12
---

## Overview

SRE Command Center is a pnpm monorepo for building and operating an incident-focused platform with a typed backend API, generated client contracts, and a React-based operator UI sandbox.

The project is designed to support incident operations end to end:

* Track incident status and timeline data.
* Stream near real-time incident updates over WebSocket.
* Expose contract-first REST endpoints from an OpenAPI specification.
* Keep backend, frontend, and validation schemas aligned through code generation.

## Who This Is For

This repository is useful if you are:

* Building internal SRE tooling for incident response workflows.
* Prototyping operational dashboards with realistic data contracts.
* Developing APIs and frontend clients in a shared TypeScript monorepo.
* Prioritizing contract safety and generated types across services.

## Core Capabilities

* Incident list and detail APIs.
* Incident timeline APIs.
* Phase status and accuracy summary dashboard APIs.
* Health endpoint for uptime checks.
* WebSocket stream for incident snapshots and updates.
* Shared schema libraries consumed by API and clients.

## Tech Stack

### Platform and Tooling

* Node.js 24+
* TypeScript 5.9
* pnpm workspaces

### Backend

* Express 5 for HTTP APIs
* ws for WebSocket streaming
* Pino and pino-http for structured logging
* Drizzle ORM for PostgreSQL access

### Data and Contracts

* PostgreSQL database
* OpenAPI 3.1 as API source of truth
* Orval for code generation
* Zod schemas for runtime-safe parsing and contract validation

### Frontend Sandbox

* React 19
* Vite 7
* Tailwind CSS 4
* Radix UI component primitives

## Monorepo Layout

| Path                     | Purpose |
|--------------------------|---------|
| artifacts/api-server     | Express API server and WebSocket runtime |
| artifacts/mockup-sandbox | React UI sandbox for command center mockups |
| lib/api-spec             | OpenAPI spec and Orval config |
| lib/api-client-react     | Generated API client and React-friendly fetch wrappers |
| lib/api-zod              | Generated Zod contract package |
| lib/db                   | Drizzle schema and DB access layer |
| scripts                  | Workspace utility scripts |

## Prerequisites

Install the following before running the project:

* Node.js 24 or newer
* pnpm 9 or newer
* PostgreSQL instance reachable from your machine

Check your versions:

```bash
node -v
pnpm -v
```

## Installation

Clone and install dependencies from the repository root:

```bash
git clone https://github.com/faizanhussainrabbani/SRE-Command-Center.git
cd SRE-Command-Center
pnpm install
```

The workspace enforces pnpm usage and blocks npm and yarn for consistency.

## Configuration

The API requires environment variables at runtime.

| Variable                      | Required | Example                         | Description |
|-------------------------------|----------|---------------------------------|-------------|
| PORT                          | Yes      | 5000                            | HTTP port for the API server |
| DATABASE_URL                  | Yes      | postgresql://user:pass@localhost:5432/sre_cc | PostgreSQL connection string |
| CORS_ORIGIN                   | No       | http://localhost:5173           | Comma-separated allowlist for CORS |
| INCIDENTS_WS_POLL_INTERVAL_MS | No       | 750                             | Poll interval for WebSocket update checks |

For local development, export variables in your shell:

```bash
export PORT=5000
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sre_command_center"
export CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

## Running the Project

### 1. Start the API Server

From the repository root:

```bash
pnpm --filter @workspace/api-server run dev
```

The API mounts routes under `/api`.

### 2. Start the Frontend Sandbox

In a second terminal:

```bash
pnpm --filter @workspace/mockup-sandbox run dev
```

Vite runs the UI sandbox for mockup and dashboard iteration.

### 3. Start the Operator Dashboard

In a third terminal:

```bash
pnpm --filter @workspace/operator-dashboard run dev
```

This package is the production runtime path for incident operations and remains contract-bound to Node endpoints.

### 4. Open the App

* Frontend sandbox: <http://localhost:5173>
* Operator dashboard: <http://localhost:5174>
* API base path: <http://localhost:5000/api>
* Swagger UI: <http://localhost:5000/docs>

## API and Real-Time Endpoints

Key HTTP endpoints:

* `GET /api/healthz`
* `GET /api/v1/incidents`
* `GET /api/v1/incidents/{id}`
* `GET /api/v1/incidents/{id}/timeline`
* `GET /api/v1/phases/status`
* `GET /api/v1/accuracy/summary`

OpenAPI document and docs UI:

* `/openapi.yaml`
* `/docs`

WebSocket endpoint:

* `/api/ws/incidents`

Expected WebSocket message types:

* `initial_state`
* `incident_update`

## Development Workflows

### Sandbox vs Operator Dashboard

Use the sandbox and operator dashboard for different purposes:

* `@workspace/mockup-sandbox`: design previews and rapid visual exploration
* `@workspace/operator-dashboard`: production workflow implementation with Node API-only boundaries

### Type Checking

Run full workspace type checks:

```bash
pnpm run typecheck
```

### Build All Packages

```bash
pnpm run build
```

### Regenerate Contracts from OpenAPI

When you update `lib/api-spec/openapi.yaml`, regenerate clients and schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Database Schema Push

Apply schema changes in development:

```bash
pnpm --filter @workspace/db run push
```

Force push when needed for local resets:

```bash
pnpm --filter @workspace/db run push-force
```

## Quick Verification

Once API is running, verify health:

```bash
curl http://localhost:5000/api/healthz
```

List incidents:

```bash
curl "http://localhost:5000/api/v1/incidents?limit=10&offset=0"
```

## Architecture Notes

* Contract-first design keeps backend and consumers aligned through generated code.
* API routes and WebSocket payloads share typed schemas for consistency.
* Database access is centralized through the Drizzle package to keep schema ownership clear.
* The UI sandbox is isolated from backend internals and consumes generated contracts.

## Troubleshooting

### Error: PORT environment variable is required

Set `PORT` before starting the API server.

### Error: DATABASE_URL must be set

Set `DATABASE_URL` and verify PostgreSQL connectivity.

### CORS requests blocked

Set `CORS_ORIGIN` to include your frontend origin.

### Generated client types are stale

Run code generation from the API spec package:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Current Maturity

This repository currently combines production-style backend patterns with active UI sandbox development. It is suitable for local development, prototyping, and iterative hardening toward full operational readiness.

## License

MIT
