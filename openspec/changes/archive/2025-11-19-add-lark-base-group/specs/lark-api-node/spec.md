## ADDED Requirements
### Requirement: Base group exposes core Base resources
The `LarkApi` node MUST expose a `Base` property group underneath the Lark feature groups so builders can target Base resources without adding a new node.

#### Scenario: Base group lists Base entities
- **GIVEN** a builder opens the `LarkApi` node configuration
- **WHEN** they expand the `Base` group
- **THEN** they see inputs for selecting the Base `App`, `Table`, `View`, `Record`, and `Field` entities
- **AND** each entity input makes it clear which resource will be acted on.

#### Scenario: Base group routes actions to Base service
- **GIVEN** the builder selects an entity inside the `Base` group and triggers an operation
- **WHEN** the node executes
- **THEN** it delegates the request to `LarkBaseService`
- **AND** it reuses the tenant access token collected by the Authenticate group.

### Requirement: Base group exposes App operations
The `Base` group MUST include App-level operations so builders can create, copy, fetch, and rename Base Apps directly inside the node and each operation MUST document the Lark endpoint contract.

#### Scenario: Create App uses POST /bitable/v1/apps
- **GIVEN** a builder chooses the `Create App` action within the Base group and supplies `name` and optional `folder_token`
- **WHEN** the node executes
- **THEN** it sends a POST request to `https://open.larksuite.com/open-apis/bitable/v1/apps`
- **AND** it includes `Authorization: Bearer <tenant_access_token>` in the headers
- **AND** the JSON body contains `name` and `folder_token` exactly as provided.

#### Scenario: Copy App calls POST /bitable/v1/apps/:app_token/copy
- **GIVEN** the builder selects `Copy App`, provides an `app_token`, and configures `name`, `folder_token`, and `without_content`
- **WHEN** the node runs
- **THEN** it issues a POST request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/copy`
- **AND** the path parameter is substituted with the provided App token
- **AND** the body carries `name`, `folder_token`, and `without_content` fields.

#### Scenario: Get App Info calls GET /bitable/v1/apps/:app_token
- **GIVEN** the builder selects `Get App Info` and supplies an `app_token`
- **WHEN** the node executes
- **THEN** it performs a GET request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}`
- **AND** it sets the Authorization header with the tenant token
- **AND** it returns the raw JSON body to the workflow.

#### Scenario: Update App Name uses PUT /bitable/v1/apps/:app_token
- **GIVEN** the builder chooses `Update App Name`, provides an `app_token`, and the new `name` plus optional `is_advanced`
- **WHEN** the node executes
- **THEN** it sends a PUT request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}`
- **AND** the request body includes `name` and `is_advanced` fields matching the builder inputs
- **AND** the Authorization header continues to use the tenant token from Authenticate.

### Requirement: Base group exposes Table operations
The `Base` group MUST expose data table operations backed by the Bitable endpoints so builders can create, batch-create, rename, list, and delete tables inside a Base App.

#### Scenario: Create Table posts JSON body to /apps/:app_token/tables
- **GIVEN** a builder selects `Create Table`, provides the App token, and supplies a JSON object describing the table
- **WHEN** the node executes
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables`
- **AND** it includes the JSON object as-is in the request body with the Authorization header.

#### Scenario: Batch Create Table calls /tables/batch_create
- **GIVEN** the builder chooses `Batch Create Table` and provides the App token plus a JSON body accepted by Lark
- **WHEN** execution occurs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/batch_create`
- **AND** it forwards the JSON payload verbatim to Lark.

#### Scenario: Update Table name PATCHes /apps/:app_token/tables/:table_id
- **GIVEN** the builder selects `Update Table`, supplies the App token, Table ID, and new name
- **WHEN** the node runs
- **THEN** it PATCHes `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}`
- **AND** the body includes `{ "name": "<new name>" }`.

#### Scenario: List Tables GETs /apps/:app_token/tables with pagination
- **GIVEN** the builder selects `List Tables` with an App token and optional `page_token`/`page_size`
- **WHEN** the node executes
- **THEN** it sends a GET request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables`
- **AND** it passes `page_token` and `page_size` query parameters if provided (respecting the max of 100).

#### Scenario: Delete Table calls DELETE /apps/:app_token/tables/:table_id
- **GIVEN** the builder selects `Delete Table`, supplies App token and Table ID
- **WHEN** the node executes
- **THEN** it issues a DELETE request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}`.

#### Scenario: Batch Delete Table posts /tables/batch_delete
- **GIVEN** the builder selects `Batch Delete Table` and provides App token plus an array of table IDs
- **WHEN** execution occurs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/batch_delete`
- **AND** the body contains `{ "table_ids": ["<table id>", ...] }`.

### Requirement: Base group exposes Record operations
The `Base` group MUST include Record-level operations so builders can create, update, search, delete, batch-create/update/get/delete records inside a Base table.

#### Scenario: Create Record posts to /records
- **GIVEN** a builder selects `Create Record`, provides App token, Table ID, and JSON body
- **WHEN** the node executes
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records`
- **AND** it forwards the JSON payload unchanged.

#### Scenario: Update Record PUTs to /records/:record_id
- **GIVEN** the builder selects `Update Record`, provides App token, Table ID, Record ID, and body
- **WHEN** the node runs
- **THEN** it sends a PUT request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}`
- **AND** the body matches the provided JSON object.

#### Scenario: Search Records posts to /records/search
- **GIVEN** the builder selects `Search Records`, provides query JSON plus pagination inputs
- **WHEN** execution occurs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/search`
- **AND** it appends `page_token`/`page_size (<=500)` in the query string when supplied.

#### Scenario: Delete Record issues DELETE /records/:record_id
- **GIVEN** the builder selects `Delete Record`, provides App token, Table ID, and Record ID
- **WHEN** the node executes
- **THEN** it DELETEs `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}`.

#### Scenario: Batch Create Records posts /records/batch_create
- **GIVEN** the builder selects `Batch Create Records` with the JSON payload
- **WHEN** the node runs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create`.

#### Scenario: Batch Update Records posts /records/batch_update
- **GIVEN** the builder selects `Batch Update Records`
- **WHEN** execution occurs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_update`.

#### Scenario: Batch Get Records posts /records/batch_get
- **GIVEN** the builder selects `Batch Get Records`, supplies record IDs plus options
- **WHEN** the node executes
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_get`
- **AND** the body contains `record_ids`, `user_id_type`, `with_shared_url`, and `automatic_fields` fields as provided.

#### Scenario: Batch Delete Records posts /records/batch_delete
- **GIVEN** the builder selects `Batch Delete Records`
- **WHEN** the node runs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_delete`
- **AND** it forwards `{ "records": ["<record-id>", ...] }`.
