---
name: architecture-encounter-combat-hosts
overview: Targeted pre-integration cleanup for encounter/combat/host boundaries—prop-inject CombatPlayView layout metrics, resolve EncounterGrid ambiguity, tighten export guidance; defer broad renames until after simulator authored-location work.
todos:
  - id: combat-play-view-props
    content: Inject header/layout metrics into CombatPlayView (remove encounter theme import from combat)
    status: completed
  - id: encounter-grid-resolution
    content: Remove EncounterGrid.tsx or replace with barrel-only re-export; update call sites
    status: completed
  - id: export-boundary-doc
    content: Document canonical import paths (combat vs encounter); optional trim of worst re-exports
    status: completed
isProject: false
---

# Encounter / combat / host architecture — targeted pre-integration cleanup

This document refines the [original architecture investigation](#appendix-original-architecture-report-summary) into a **small, high-value cleanup pass** before (or alongside early steps of) simulator authored-location integration. It is **not** a broad rename wave.

---

## Refined recommended cleanup sequence

Do in roughly this order—each step is independently shippable; stop when pre-integration value is exhausted.

1. **`CombatPlayView` boundary (highest value)**  
   - Remove the direct import of `getEncounterUiStateTheme` from `features/encounter` inside `features/combat`.  
   - **Preferred low-churn approach:** add props for what the shell actually needs (e.g. `headerOffsetCssVar` + `headerOffsetFallbackPx`, or a single `gridHoverStatusTop` CSS expression string) computed **once** in `useEncounterActivePlaySurface` (or a tiny helper colocated with that hook) which already owns encounter context.  
   - **Keep `CombatPlayView` in `features/combat`** if, after injection, it has no encounter imports—then it is honestly shared presentation.  
   - **Do not** move large play layout chunks into `encounter` unless prop injection proves insufficient after a real attempt.

2. **`EncounterGrid` ambiguity**  
   - **Default:** delete [`EncounterGrid.tsx`](src/features/encounter/components/active/grid/EncounterGrid.tsx), switch call sites to `CombatGrid` from `@/features/combat/components` (or `@/features/combat`).  
   - **Acceptable alternative:** keep **only** a named re-export on [`encounter/components/index.ts`](src/features/encounter/components/index.ts) (`export { CombatGrid as EncounterGrid from '...'`) **if** you want a stable import path without a misleading dedicated file—document that it is an alias, not a second implementation.  
   - **Retain a real component file** only when it gains **encounter-specific** props or wiring; until then, avoid a pass-through file that implies a second grid stack.

3. **Import/export boundaries (documentation-first, minimal code)**  
   - Add a short comment block or internal doc (e.g. in `encounter/components/index.ts` or `AGENTS.md` pointer): **encounter barrel = encounter-owned surfaces**; **combat barrel = primitives**. Prefer importing `CombatGrid`, `CombatantAvatar`, etc. from `@/features/combat` in new code.  
   - **Canonical path for presentation helpers:** `@/features/combat/presentation/...` (or combat `components` barrel)—treat [`encounter/helpers/combatants/resolveCombatantAvatarSrc`](src/features/encounter/helpers/combatants/resolveCombatantAvatarSrc.ts) as legacy re-export; migrate call sites opportunistically, not in one sweep.

4. **`SimulatorEncounterPlaySurface` (optional, low priority)**  
   - **Default:** **do not add** a wrapper whose only job is mirroring `GameSessionEncounterPlaySurface` by name.  
   - **Consider only if** extracting 10–15 lines from [`EncounterActiveRoute`](src/features/encounter/routes/EncounterActiveRoute.tsx) materially clarifies ownership (shell + `setupPathWhenEmpty` in one named place) **and** the team agrees the name pays for itself. Empty wrappers are explicitly out of scope.

---

## Highest-value changes to do now

| Priority | Change | Why |
|----------|--------|-----|
| 1 | Prop-inject layout metrics into `CombatPlayView`; drop encounter theme import from combat | Restores the intended **combat = shared presentation** boundary with low churn |
| 2 | Remove `EncounterGrid` file **or** alias-only re-export | Stops implying a duplicate grid implementation |
| 3 | Document canonical import rules + prefer combat path for primitives in new code | Reduces future boundary drift without a mass edit |

---

## What should wait until after simulator authored-location integration

- **Large-scale** barrel cleanup (deleting all combat re-exports from encounter in one pass).  
- **Renaming** `CombatPlayView` props (`encounterGrid` → neutral names) unless bundled with step 1 for clarity—optional, not blocking.  
- **`SimulatorEncounterPlaySurface`** unless a concrete readability win appears while touching simulator routes.  
- **Splitting** `useEncounterActivePlaySurface` by host—only if session and simulator diverge meaningfully post-integration.

---

## Risks if we do nothing before integration

| Risk | Severity | Note |
|------|----------|------|
| **`CombatPlayView` stays encounter-coupled** | Medium | New combat-only consumers may copy the pattern and import encounter from combat; boundary erodes further. |
| **`EncounterGrid` misleads readers** | Low–medium | During authored-map work, engineers may assume encounter-specific grid behavior exists. |
| **Dual import paths** (`resolveCombatantAvatarSrc`) | Low | Confusion, not duplicate logic. |

None of these block authored-location work; they are **maintainability** and **onboarding** risks.

---

## Keep / rename / remove — concise list

| Item | Recommendation |
|------|----------------|
| **`CombatPlayView`** | **Keep** in `features/combat`. **Change implementation** only: inject layout/theme metrics via props so combat does not import encounter. Optionally rename props later (`gridSlot`, `sidebarSlot`)—post-integration or with step 1 if cheap. |
| **`EncounterGrid`** | **Remove** standalone file **or** **barrel alias only** (`CombatGrid as EncounterGrid`). **Do not** keep a no-op component file without a plan for encounter-only behavior. |
| **Simulator host wrapper** | **No new wrapper by default.** **Optional** thin `SimulatorEncounterPlaySurface` only if it consolidates real shell wiring and improves readability—never an empty pass-through. |
| **`encounter/components/index.ts` combat re-exports** | **Short term:** document “prefer `@/features/combat` for primitives.” **Long term:** trim re-exports gradually after integration when touch points are obvious. |

---

## Appendix: original architecture report summary

**Ownership target**

- **`features/encounter`:** Workflow, viewer/capability policy, setup vs active, hooks (`useEncounterState`, `useEncounterActivePlaySurface`, …), simulator runtime context.  
- **`features/combat`:** Reusable battlefield/cards/log/grid primitives; should not depend on encounter once `CombatPlayView` is fixed.  
- **Hosts:** `game-session` (e.g. `GameSessionEncounterPlaySurface`) and simulator routes compose encounter + combat; own launch, hydration, persistence, navigation.

**What already works**

- Both hosts use **`useEncounterActivePlaySurface` → `CombatPlayView`** as the shared active-play seam.  
- **`GameSessionEncounterPlaySurface`** is the thick session host; **`EncounterActiveRoute`** is the thin simulator host.

**Relation to [simulator location map combat](simulator_location_map_combat_f7ddb6bc.plan.md)**

- Authored space resolution belongs in **host + shared helpers**, not in `CombatGrid`.  
- This cleanup is **orthogonal**: do boundary fixes first or in parallel only if it reduces confusion while touching play surfaces.
