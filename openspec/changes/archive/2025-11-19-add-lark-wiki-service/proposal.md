## Why
- We now have an authentication node that outputs `tenant_access_token`, but no reusable HTTP client to attach it, forcing every integration to hand-roll headers and base URLs.
- The product roadmap includes Wiki automation; delivering a typed Wiki "Create node" API requires a service layer that consistently signs requests with the tenant token.
- The Wiki "space node" creation flow (https://open.larksuite.com/document/server-docs/docs/wiki-v2/space-node/create) demands path parameters, JSON payloads, and tenant-scoped authentication that should be codified before coding.

## What Changes
- Add a `BaseService` abstraction that stores the Lark base URL (`https://open.larksuite.com`) and automatically injects the `tenant_access_token` as a `Bearer` header for every request.
- Add a `WikiService` that extends `BaseService`, implements a `createNode(spaceId, payload)` helper targeting `POST /open-apis/wiki/v2/spaces/:space_id/nodes`, and is callable from an eventual n8n Wiki node.
- Document the required request/response handling, including path parameter substitution, supported body fields per the official API, and error bubbling rules.

## Impact
- Introduces new shared services but does not change existing node behavior.
- Requires new specs/tasks so future n8n nodes (e.g., Wiki Create) consume the shared BaseService instead of duplicating HTTP wiring.
- No immediate UI exposure; proposal focuses on service contracts and their integration points for upcoming nodes.
