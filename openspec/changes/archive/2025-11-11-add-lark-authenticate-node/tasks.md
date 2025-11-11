## 1. LarkApi node scaffolding
- [x] Create `nodes/LarkApi/LarkApi.node.ts` (or equivalent) that registers a `LarkApi` node with display name/description that matches n8n guidelines.
- [x] Add an `Authenticate` collection group as the first section of node properties, containing required `app_id` (string) and `app_secret` (password/secure) inputs.
- [x] Ensure the node persists user-provided credentials and exposes them to execute logic for token retrieval.

## 2. Token service
- [x] Add a root-level `services/tokenService.ts` module to encapsulate the POST request to `https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal`.
- [x] Implement a `getTenantAccessToken(appId, appSecret)` helper that sends the JSON payload `{ "app_id": "...", "app_secret": "..." }`, parses the response, and returns `{ code, msg, tenant_access_token, expire }`.
- [x] Surface non-zero `code` responses or transport errors as n8n-friendly errors.

## 3. Node execution wiring
- [x] Call the token service from the LarkApi node’s execute handler so any downstream operations run with a fresh tenant access token.
- [x] Store the token in the node context/data to enable reuse within the same workflow execution step.
