# Project Context

## Purpose
Custom n8n community node package that delivers typed nodes and credentials for SaaS APIs (targeting Feishu/Lark, with GitHub sample nodes kept for reference). The goal is to expose common Lark workflows (messages, approvals, user sync) inside n8n while following the official node guidelines so the package can be published/verified.

## Tech Stack
- TypeScript (ES2019 target, strict compiler options) for all nodes and credentials
- Node.js 22+ runtime with npm scripts wired to `@n8n/node-cli`
- n8n Workflow SDK (`n8n-workflow` peer dependency) plus declarative node helpers inside `nodes/**`
- ESLint (via `@n8n/node-cli` shareable config) and Prettier for linting/formatting
- GitHub Actions (`.github/workflows/ci.yml`) for lint + build verification on pushes and PRs

## Project Conventions

### Code Style
- Format exclusively with Prettier (`.prettierrc.js`): tabs, print width 100, semicolons, single quotes.
- Lint with `npm run lint` (`@n8n/node-cli` ESLint config). No unused locals, no implicit `any`, and consistent casing enforced by `tsconfig.json`.
- Node/credential class names and folders use PascalCase (e.g., `nodes/LarkMessages/LarkMessages.node.ts`), resource helpers live under `resources/` or `listSearch/`.

### Architecture Patterns
- Each integration lives under `nodes/<IntegrationName>/` with a single `.node.ts` entry that wires declarative operations (`properties` definitions imported from `./resources`).
- Shared data loaders (list search) and resource property definitions are modularized inside the node folder to keep execute logic declarative.
- Credentials reside in `credentials/*.credentials.ts` and are registered in `package.json -> n8n.credentials`; nodes are registered under `n8n.nodes`.
- Builds target `dist/` via `n8n-node build`; nothing imports from `dist` in source.

### Testing Strategy
- Local manual validation through `npm run dev` (runs `n8n-node dev`, hot-reloads nodes inside a local n8n instance).
- Static checks (`npm run lint`) must pass before publishing; CI enforces lint + `npm run build`.
- No automated integration tests yet; exercise nodes by creating representative n8n workflows against sandbox Lark/GitHub tenants.

### Git Workflow
- `main` is the release branch; feature work happens on topic branches and lands via PR so CI runs.
- Keep commits scoped to a single node/feature; run `npm run lint && npm run build` before pushing.
- Releases use `npm run release` / `n8n-node release` (release-it) once nodes are verified.

## Domain Context
- We are extending n8n with Feishu/Lark automation: expect REST/Graph APIs, OAuth 2.0 and app tokens, message/approval objects, etc.
- Declarative node properties should mirror Lark terminology (e.g., "Chat ID", "Tenant Access Token") to stay familiar to Lark admins.
- No legacy starter nodes remain; every folder under `nodes/` must represent a real Lark capability.

## Important Constraints
- Node.js 22+ and npm are required (aligned with CI and `README.md` prerequisites).
- Package must stay MIT-licensed and avoid additional runtime dependencies to qualify for n8n Cloud verification.
- TypeScript compiler options are strict; new code must not disable checks.
- Follow n8n node UX guidelines (display names, icons, error handling) so the package is accepted by n8n review.

## External Dependencies
- n8n runtime (`@n8n/node-cli`, `n8n-workflow`) for building, linting, and executing nodes.
- Target SaaS APIs: Feishu/Lark (primary focus for all nodes).
- GitHub Actions CI for automation; publishing goes to npm under the `n8n-nodes-*` namespace.
