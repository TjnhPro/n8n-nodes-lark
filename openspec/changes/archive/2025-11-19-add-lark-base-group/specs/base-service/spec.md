## ADDED Requirements
### Requirement: LarkBaseService extends BaseService for Base endpoints
A new `LarkBaseService` MUST inherit from `BaseService` so all Base feature calls share the same HTTP client, base URL, and tenant token enforcement.

#### Scenario: LarkBaseService inherits HTTP configuration
- **GIVEN** `LarkBaseService` is instantiated with the authenticated credentials
- **WHEN** it prepares a request for a Base endpoint
- **THEN** it reuses the base URL `https://open.larksuite.com` and the injected tenant access token from `BaseService` without reconfiguration.

#### Scenario: LarkBaseService exposes placeholder Base methods
- **GIVEN** new Base endpoints for Apps, Tables, Views, Records, and Fields will be added later
- **WHEN** developers inspect `LarkBaseService`
- **THEN** they find dedicated method stubs or descriptive comments for each entity so future endpoints can be added without reworking inheritance.

### Requirement: LarkBaseService implements App endpoint helpers
`LarkBaseService` MUST expose helpers for Base App actions so callers can create, copy, fetch, and update Apps using the exact REST contracts provided by Lark.

#### Scenario: createApp posts payload to /bitable/v1/apps
- **GIVEN** `createApp({ name, folder_token })` is called
- **WHEN** the helper executes
- **THEN** it performs a POST request to `https://open.larksuite.com/open-apis/bitable/v1/apps`
- **AND** it passes `{ name, folder_token }` as the JSON body with the inherited Authorization header.

#### Scenario: copyApp posts to /bitable/v1/apps/:app_token/copy
- **GIVEN** `copyApp({ app_token, name, folder_token, without_content })` is called
- **WHEN** the helper executes
- **THEN** it issues a POST to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/copy`
- **AND** it injects the `app_token` path param plus the JSON body `{ name, folder_token, without_content }`.

#### Scenario: getApp fetches /bitable/v1/apps/:app_token
- **GIVEN** `getApp(app_token)` is called
- **WHEN** the helper executes
- **THEN** it sends a GET request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}`
- **AND** it returns the raw body from Lark unmodified.

#### Scenario: updateAppName puts to /bitable/v1/apps/:app_token
- **GIVEN** `updateAppName({ app_token, name, is_advanced })` is invoked
- **WHEN** the helper executes
- **THEN** it sends a PUT request to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}`
- **AND** it includes `{ name, is_advanced }` in the body while reusing inherited headers.

### Requirement: LarkBaseService implements Table endpoint helpers
`LarkBaseService` MUST provide helpers for Base table operations so callers can mirror the Bitable REST endpoints for create, batch-create, update, list, delete, and batch-delete actions.

#### Scenario: createTable posts to /apps/:app_token/tables
- **GIVEN** `createTable(appToken, payload)` is called with a JSON object payload
- **WHEN** the helper runs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables`
- **AND** it sends the payload unchanged in the request body.

#### Scenario: batchCreateTable posts to /tables/batch_create
- **GIVEN** `batchCreateTable(appToken, payload)` is called
- **WHEN** the helper runs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/batch_create`
- **AND** the provided payload is forwarded untouched.

#### Scenario: updateTableName patches /tables/:table_id
- **GIVEN** `updateTableName({ app_token, table_id, name })` is called
- **WHEN** the helper runs
- **THEN** it PATCHes `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}`
- **AND** it includes `{ name }` as the body.

#### Scenario: listTables queries /apps/:app_token/tables
- **GIVEN** `listTables({ app_token, page_token, page_size })` is called
- **WHEN** the helper runs
- **THEN** it GETs `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables`
- **AND** it passes pagination params if supplied.

#### Scenario: deleteTable calls DELETE /tables/:table_id
- **GIVEN** `deleteTable({ app_token, table_id })` is invoked
- **WHEN** the helper runs
- **THEN** it DELETEs `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}`.

#### Scenario: batchDeleteTables posts to /tables/batch_delete
- **GIVEN** `batchDeleteTables({ app_token, table_ids })` is called
- **WHEN** the helper runs
- **THEN** it POSTs to `https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/batch_delete`
- **AND** the body includes `{ table_ids: [...] }`.

### Requirement: LarkBaseService implements Record endpoint helpers
`LarkBaseService` MUST provide helpers for Base record operations mirroring the single and batch endpoints (create, update, search, delete, batch create/update/get/delete).

#### Scenario: createRecord posts to /records
- **GIVEN** `createRecord({ app_token, table_id, body })` is called
- **WHEN** executed
- **THEN** it POSTs to `/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records` with the JSON body.

#### Scenario: updateRecord puts to /records/:record_id
- **GIVEN** `updateRecord({ app_token, table_id, record_id, body })`
- **WHEN** executed
- **THEN** it PUTs to `/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}` along with the JSON body.

#### Scenario: searchRecords posts to /records/search
- **GIVEN** `searchRecords({ app_token, table_id, query, page_token, page_size })`
- **WHEN** executed
- **THEN** it POSTs to `/records/search` endpoint, appending pagination params (page_size <= 500) and forwarding the JSON query.

#### Scenario: deleteRecord calls DELETE /records/:record_id
- **GIVEN** `deleteRecord({ app_token, table_id, record_id })`
- **WHEN** executed
- **THEN** it DELETEs `/records/{record_id}`.

#### Scenario: batchCreateRecords posts to /records/batch_create
- **GIVEN** `batchCreateRecords({ app_token, table_id, body })`
- **WHEN** executed
- **THEN** it POSTs to `/records/batch_create`.

#### Scenario: batchUpdateRecords posts to /records/batch_update
- **GIVEN** `batchUpdateRecords({ app_token, table_id, body })`
- **WHEN** executed
- **THEN** it POSTs to `/records/batch_update`.

#### Scenario: batchGetRecords posts to /records/batch_get
- **GIVEN** `batchGetRecords({ app_token, table_id, record_ids, user_id_type, with_shared_url, automatic_fields })`
- **WHEN** executed
- **THEN** it POSTs to `/records/batch_get` with all provided fields.

#### Scenario: batchDeleteRecords posts to /records/batch_delete
- **GIVEN** `batchDeleteRecords({ app_token, table_id, records })`
- **WHEN** executed
- **THEN** it POSTs to `/records/batch_delete` with the array of record IDs.
