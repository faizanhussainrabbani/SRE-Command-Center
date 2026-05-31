---
title: Operator Dashboard
description: Production operator dashboard package that consumes only Node API and websocket contracts
author: SRE Command Center Team
ms.date: 2026-05-31
ms.topic: how-to
keywords:
  - operator dashboard
  - realtime
  - websocket
  - node api
estimated_reading_time: 5
---

## Purpose

The operator dashboard package is the production runtime for incident operations. It is contract-bound to Node backend endpoints and does not import SRE agent runtime internals.

The mockup sandbox remains available for design-only iteration.

## Environment Variables

Set these variables before starting the dashboard in local or proxied environments.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| VITE_NODE_API_ORIGIN | No | http://localhost:8081 | Absolute Node API origin used for REST requests. Leave unset to use same-origin /api paths. |
| VITE_NODE_WS_ORIGIN | No | http://localhost:8081 | Absolute origin used to build websocket URL for /api/ws/incidents. Leave unset to use window origin. |

## Local Run

Run the API server and dashboard in separate terminals from the repository root.

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/operator-dashboard run dev
```

## Proxied Run

When a reverse proxy terminates TLS or serves the dashboard and API from different origins, provide explicit origins:

```bash
VITE_NODE_API_ORIGIN="https://command-center.internal"
VITE_NODE_WS_ORIGIN="https://command-center.internal"
pnpm --filter @workspace/operator-dashboard run dev
```

The dashboard transforms the websocket origin to ws:// or wss:// automatically and appends /api/ws/incidents.

## Reconnect Lifecycle

The dashboard websocket client reconnects with capped exponential backoff:

* Initial delay: 500ms
* Maximum delay: 5000ms
* Stale indicator shown when no events arrive within max(5000, pollIntervalMs * 4)
* Automatic resynchronization via /api/v1/incidents when sequence gaps or token regressions are detected

Run targeted realtime suites:

```bash
pnpm --filter @workspace/operator-dashboard test -- realtime
pnpm --filter @workspace/operator-dashboard test -- e2e realtime
```
