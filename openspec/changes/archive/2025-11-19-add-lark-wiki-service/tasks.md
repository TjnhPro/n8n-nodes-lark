## 1. BaseService foundation
- [x] Create `services/BaseService.ts` that accepts `{ baseUrl, tenantAccessToken }` in the constructor and exposes a `request(options)` helper which attaches `Authorization: Bearer <tenantAccessToken>` plus default JSON headers.
- [x] Ensure BaseService validates the token input (rejects missing/empty) and centralizes base URL resolution to `https://open.larksuite.com`.

## 2. WikiService implementation
- [x] Add `services/WikiService.ts` that extends `BaseService`.
- [x] Implement `createNode(spaceId, body)` that POSTs to `/open-apis/wiki/v2/spaces/:space_id/nodes`, interpolates the path parameter, sends the provided JSON body, and returns the raw Axios response data.
- [x] Bubble non-2xx responses via descriptive errors so n8n users see the API's `code`/`msg`.
- [x] Implement `getNodeInfo(nodeToken)` that issues a `GET` request to `/open-apis/wiki/v2/spaces/get_node?token=<nodeToken>` and returns the raw response body.
- [x] Implement `listChildNodes(spaceId, query)` that issues a `GET` request to `/open-apis/wiki/v2/spaces/:space_id/nodes`, forwards pagination/parent filters, and returns the raw response body.

## 3. Node integration prep
- [x] Expose WikiService via an index/export so future nodes (e.g., `LarkWiki`) can import it without relative chaos.
- [x] Document in code comments or README stub how the Authenticate node’s tenant token feeds into BaseService/WikiService usage.
