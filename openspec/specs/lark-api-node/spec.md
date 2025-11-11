# lark-api-node Specification

## Purpose
TBD - created by archiving change add-lark-authenticate-node. Update Purpose after archive.
## Requirements
### Requirement: Authenticate group collects Lark app credentials
The `LarkApi` node MUST expose an `Authenticate` property group first in the UI so builders can supply the app credentials required for tenant authentication.

#### Scenario: App credentials are required inputs
- **GIVEN** a builder adds the `LarkApi` node to a workflow
- **WHEN** they open the `Authenticate` group
- **THEN** they see `app_id` and `app_secret` inputs
- **AND** both inputs are required before the node can execute
- **AND** `app_secret` is treated as a secure/password field and hidden in the editor.

### Requirement: Token service exchanges credentials for tenant access token
A shared `services/tokenService` helper MUST POST to `https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal` with the provided credentials using Axios and surface the raw JSON body from Lark so downstream callers can inspect every field.

#### Scenario: Successful token exchange (raw data)
- **GIVEN** valid `app_id` and `app_secret` values
- **WHEN** the token service sends a POST request with body `{ "app_id": "<app_id>", "app_secret": "<app_secret>" }`
- **THEN** it receives the 200 response from Lark
- **AND** it returns the raw JSON response body containing fields such as `code`, `msg`, `tenant_access_token`, and `expire` without reshaping.

#### Scenario: Failed token exchange bubbles error
- **GIVEN** the Lark API responds with a non-zero `code` or transport error
- **WHEN** the token service processes the response
- **THEN** it throws an error surfaced to the n8n workflow so builders can correct the credentials.

### Requirement: Authenticate group exposes getAccessToken option
The `Authenticate` group MUST include an `Action` dropdown whose initial option is `getAccessToken`, and executing that action MUST use the token service so builders can obtain raw tenant access tokens.

#### Scenario: getAccessToken action returns token payload
- **GIVEN** a builder chooses `getAccessToken` within the `Authenticate` group and supplies valid credentials
- **WHEN** the node executes
- **THEN** it calls the token service to request the tenant access token
- **AND** it outputs the untouched token response body (`code`, `msg`, `tenant_access_token`, `expire`) for each input item.

