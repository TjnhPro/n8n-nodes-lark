## Why
Partners need to work with the Lark Base module (Apps, Tables, Views, Records, and Fields) directly inside the existing `LarkApi` node. Today there is no Base-specific property group or service, so builders cannot target these resources or initialize a dedicated service layer for Base endpoints. The next immediate ask is to unblock Base App management (create, copy, inspect, rename) so workflows can bootstrap and maintain Bases programmatically.

## What Changes
- Add a `Base` property group under the Lark features inside `LarkApi` so builders can choose App, Table, View, Record, and Field level interactions, starting with App operations.
- Introduce `LarkBaseService` that extends `BaseService` and centralizes shared behaviors plus concrete App endpoint helpers (`createApp`, `copyApp`, `getApp`, `updateAppName`).
- Document the Base App scenarios in the `lark-api-node` and `base-service` specs so downstream contributors can implement the UI and service consistently using the provided endpoints, headers, bodies, and path parameters.

## Impact
- Node UI expands with a Base group that will surface multiple future operations, beginning with App actions and their required inputs.
- Services layer gains a dedicated `LarkBaseService` hosting App endpoint calls with the shared tenant token rules.
- No breaking changes to other groups, but downstream implementation MUST honor the new specs before wiring future endpoints.
