# n8n Lark Nodes

Typed n8n community nodes for Feishu/Lark. The goal is to expose common Lark admin and automation scenarios (chat messages, approvals, calendars, user sync) directly inside n8n while keeping the package compliant with the official n8n node review guidelines.

## Status

- Tooling in place (`@n8n/node-cli`, strict TypeScript, GitHub Actions)
- Node/credential implementations in progress (existing GitHub/Example scaffolds removed)
- Target APIs: Tenant/ISV tokens, Messaging, Bitable, Approval, Calendar

## Development Workflow

1. Install deps: `npm install`
2. Add credentials to `credentials/` and nodes under `nodes/Lark*`
3. Register builds in `package.json -> n8n.credentials` and `n8n.nodes`
4. Run `npm run dev` to load the node(s) inside a local n8n instance for manual testing
5. Run `npm run lint && npm run build` before committing

## Repository Structure

```
credentials/   # Lark API credentials (OAuth2, app tokens, tenant access)
nodes/         # Declarative node implementations grouped by resource
dist/          # Generated output from `npm run build`
openspec/      # Project/process specs used for planning changes
```

## NPM Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start `n8n-node dev` with hot reload to test nodes locally |
| `npm run lint` / `npm run lint:fix` | Run ESLint via `@n8n/node-cli` to enforce style/quality |
| `npm run build` / `npm run build:watch` | Emit compiled JS into `dist/` |
| `npm run release` | Release workflow powered by `n8n-node release` / `release-it` |

## Contribution Checklist

- Keep TypeScript strict options enabled; do not add runtime deps unless essential.
- Follow Prettier config (tabs, 100 char width, single quotes); run lint before pushing.
- Document each resource/operation in node descriptions; use Lark terminology in UI labels.
- Update this README and `openspec/project.md` when adding significant capabilities.

## License

MIT
