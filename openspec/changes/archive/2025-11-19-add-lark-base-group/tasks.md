## 1. Implementation
- [x] 1.1 Update the `LarkApi` node definition to add the `Base` property group containing App, Table, View, Record, and Field selectors/actions, starting with App operations (create/copy/get/update name).
- [x] 1.2 Create `services/LarkBaseService` that extends `BaseService`, wires inherited HTTP config, and exposes concrete App endpoint helpers for create, copy, get info, and update name.
- [x] 1.3 Connect the new group to `LarkBaseService` so Base App operations reuse the shared token/base URL flow and pass along the required headers, path params, and bodies.
- [x] 1.4 Expand the Base group UI to include Table operations (create, batch create, update, list, delete, batch delete) with the correct inputs and descriptions.
- [x] 1.5 Extend `LarkBaseService` with corresponding Table helpers and wire the node execution logic to these helpers.
- [x] 1.6 Extend the Base group UI with Record operations (create/update/search/delete/batch) and required inputs.
- [x] 1.7 Implement Record helpers inside `LarkBaseService` and connect node execution to them.

## 2. Validation
- [x] 2.1 Validate the OpenSpec change with `openspec validate add-lark-base-group --strict` before requesting review.
