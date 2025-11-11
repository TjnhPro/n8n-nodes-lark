## Why
- We need an entry-point Lark API node so n8n workflows can talk to Feishu/Lark tenants without copy/pasting token logic.
- Lark requires a tenant access token that is derived from the app credentials, so we must design how builders supply the values and how the node obtains the token.

## What Changes
- Introduce a `LarkApi` node whose first property group is `Authenticate`, exposing `app_id` and `app_secret` inputs that map to the underlying Lark app credentials.
- Add a `services/tokenService` helper responsible for exchanging the credentials for a tenant access token by POSTing to `https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal`.
- Define the contract for the token response (HTTP 200, JSON containing `code`, `msg`, `tenant_access_token`, and `expire`) so downstream operations can reuse the helper.

## Impact
- Adds a new capability; no existing nodes are affected.
- Requires coordination with credential storage so sensitive values (especially `app_secret`) are marked as secure inputs.
- Implementation should include unit-free helper wiring but does not introduce new external dependencies beyond native `node-fetch`/`http` used today.
