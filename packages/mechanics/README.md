# `@rpg-world-builder/mechanics`

Workspace package for **shared mechanics** (combat engine, rulesets, character/equipment math, environment, perception, etc.). Implementation lives under **`src/`**.

## Consumption

- **App / bundler:** `@/features/mechanics/domain/*` → `packages/mechanics/src/*` (see root `tsconfig.app.json` and `vite.config.ts`).
- **Explicit package entry (combat public surface):** `import { applyCombatIntent, … } from '@rpg-world-builder/mechanics'` resolves via `package.json` `exports` to `./src/index.ts`. Same types as the ADR-listed combat API; see `docs/reference/combat/adr-shared-combat-extraction.md`.

## TypeScript

- **Repo build:** `packages/mechanics/src` is included by `tsconfig.app.json`.
- **Package-local check:** `npx tsc --noEmit -p packages/mechanics/tsconfig.json` (extends app config with `baseUrl` aligned to repo `src/` so path aliases match).

## Public surface

`src/index.ts` re-exports the **combat** application layer, intents, results, and `combat/state/types` only. Other subsystems (rulesets, character, …) remain addressable via alias or future subpath `exports`—not a second migration in this pass.
