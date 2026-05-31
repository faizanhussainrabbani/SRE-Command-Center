---
title: API Specification Contracts
description: REST and websocket contract artifacts for SRE Command Center dashboard integrations
author: SRE Command Center Team
ms.date: 2026-05-31
ms.topic: reference
keywords:
  - openapi
  - asyncapi
  - websocket
  - contracts
estimated_reading_time: 4
---

## Overview

The SRE Command Center contract artifacts publish both REST and realtime interfaces used by frontend packages.

* OpenAPI source: [openapi.yaml](openapi.yaml)
* Async websocket companion: [asyncapi-incidents.yaml](asyncapi-incidents.yaml)

## REST Contract

The OpenAPI contract defines Node API endpoints under /api, including:

* Incident list, detail, and timeline
* Phase status and accuracy summary
* Structured validation error responses for invalid path/query inputs

Use this contract as the source of truth for generated API clients.

## Realtime Contract

The websocket stream contract documents the dashboard realtime endpoint:

* Endpoint: /api/ws/incidents
* Messages: initial_state and incident_update
* Reconciliation fields: sequence and resyncToken

Use the AsyncAPI contract for frontend reconnect and reconciliation acceptance tests.

## Contract Workflow

Regenerate contract consumers after OpenAPI changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

When websocket payload schemas or semantics change:

1. Update [openapi.yaml](openapi.yaml) extension metadata under x-websocket-contracts.
2. Update [asyncapi-incidents.yaml](asyncapi-incidents.yaml).
3. Re-run downstream dashboard acceptance tests.
