# base-service Specification

## Purpose
TBD - created by archiving change add-lark-wiki-service. Update Purpose after archive.
## Requirements
### Requirement: BaseService centralizes Lark HTTP configuration
`BaseService` MUST encapsulate the common HTTP client configuration for Lark APIs so downstream services share the same base URL and authentication behavior.

#### Scenario: Sets default base URL
- **GIVEN** a consumer instantiates `BaseService` without overriding the base URL
- **WHEN** it issues a request
- **THEN** the service prefixes the path with `https://open.larksuite.com`.

#### Scenario: Injects tenant access token header
- **GIVEN** `tenant_access_token` from the Authenticate node
- **WHEN** the service executes a request
- **THEN** it adds `Authorization: Bearer <tenant_access_token>` to the outbound headers.

#### Scenario: Rejects missing token
- **GIVEN** a falsy or missing `tenant_access_token`
- **WHEN** a request is attempted
- **THEN** the BaseService throws an error explaining that authentication is required before calling Lark APIs.

