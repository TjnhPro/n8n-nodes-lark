## ADDED Requirements

### Requirement: WikiService extends BaseService for Wiki APIs
`WikiService` MUST reuse BaseService so every Wiki call inherits the authenticated base configuration.

#### Scenario: WikiService shares authorization
- **GIVEN** a tenant access token passed to WikiService
- **WHEN** it performs a request
- **THEN** the request uses the same `Authorization: Bearer <tenant_access_token>` header as BaseService.

### Requirement: Support creating Wiki space nodes
WikiService MUST provide a `createNode(spaceId, payload)` method that calls the official Wiki API to create a node inside a space.

#### Scenario: Calls create node endpoint
- **GIVEN** a `spaceId` and a valid JSON payload per https://open.larksuite.com/document/server-docs/docs/wiki-v2/space-node/create
- **WHEN** `createNode` runs
- **THEN** it sends a `POST` request to `/open-apis/wiki/v2/spaces/:space_id/nodes`
- **AND** it substitutes `:space_id` with the provided identifier.

#### Scenario: Returns raw API response
- **GIVEN** the Lark API responds with JSON describing the newly created node
- **WHEN** WikiService receives the response
- **THEN** it returns the raw response body without reshaping so nodes can adapt to schema changes.

#### Scenario: Surfaces API failures
- **GIVEN** the Lark API returns a non-zero `code` or non-2xx status
- **WHEN** WikiService processes the response
- **THEN** it throws an error including the API’s `code`/`msg` so n8n users know why the creation failed.

### Requirement: Retrieve wiki node information
WikiService MUST expose a helper to fetch wiki node metadata using the token-based endpoint.

#### Scenario: Calls get node endpoint
- **GIVEN** a `node_token`
- **WHEN** the helper executes
- **THEN** it makes a `GET` request to `/open-apis/wiki/v2/spaces/get_node` with query parameter `token=<node_token>` and the standard Authorization header
- **AND** it returns the raw API response body.

### Requirement: List child nodes for a space
WikiService MUST expose a helper that lists child nodes under a wiki space using the paginated endpoint.

#### Scenario: Calls list child nodes endpoint
- **GIVEN** `space_id` plus optional query parameters (`parent_node_token`, `page_size`, `page_token`)
- **WHEN** the helper executes
- **THEN** it calls `GET /open-apis/wiki/v2/spaces/:space_id/nodes`, replacing `:space_id` with the provided identifier
- **AND** it forwards the query parameters and returns the raw API response body.
