# Color theming (reference for agents)

This project uses a **two-layer** color model for the app shell and MUI theme.

## Layers

1. **Primitives** — `src/app/theme/colorPrimitives.ts`  
   Named scales (`gray`, `red`, `gold`, `mapSlate`, `mapGreen`, …) with numeric steps **100 = lightest → 500 = darkest**. Raw hex lives here so it does not sprawl across the codebase.

2. **Semantic palette** — `src/app/theme/palette.ts`  
   MUI roles: `primary`, `secondary`, `background`, `text`, `divider`, etc. This is what components should consume via the theme (`theme.palette.*`). **Do not** rename semantic keys for drive-by refactors.

## Guidelines

- **New UI colors for global chrome:** add or adjust primitives first, then map them in `palette.ts`.
- **Map cell-fill swatches:** `src/app/theme/mapColors.ts` maps domain keys to `colorPrimitives.mapSlate`, `mapGreen`, `mapBlue`, and `mapSand`. Tune terrain in primitives; keep `baseMapSwatchColors` as the semantic key layer.
- **Alpha compositing** (e.g. dividers, translucent text on dark): often stay as `rgba(...)` in the semantic palette where a single hex primitive is not enough; that is intentional.
- **Fantasy / parchment character:** neutrals lean warm (`gray[100]` parchment); primary red and secondary gold support banner / treasure / ember cues.

## Imports

- Theme consumers: `useTheme()`, `theme.palette`, MUI `sx` with theme callbacks.
- Do not import `colorPrimitives` in feature components unless you are extending theme wiring; prefer semantic tokens.
