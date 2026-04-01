# Encounter mutation entry points (Phase 4A audit)

Primary state hub: `src/features/encounter/hooks/useEncounterState.ts`.

| Flow | Handler | Engine / notes |
|------|---------|----------------|
| Start encounter | `handleStartEncounter` | `createEncounterState` |
| End turn | `handleNextTurn` | `applyCombatIntent` → `advanceEncounterTurn` |
| Resolve action | `handleResolveAction` | `resolveCombatAction` + hook selection state |
| Grid move | `handleMoveCombatant` | `moveCombatant` + reconciliation, stealth, auras |
| DM / manual | damage, healing, conditions, etc. | state mutators |
| Reset | `handleResetEncounter` | clears encounter state |

Routes (`EncounterActiveRoute`, `EncounterRuntimeContext`) wire grid/footer callbacks to the handlers above.

## Phase 4B+ migration candidates

| Intent area | Risk | Notes |
|-------------|------|--------|
| End turn | Low | Routed through `applyCombatIntent` (4A). |
| Move combatant | Medium | Post-move hooks in `useEncounterState` |
| Resolve action | High | Many selection fields + UI resets |
| AoE / spawn confirm | High | Multi-step UI state; keep ephemeral state out of intents |

UI-only (never authoritative intents): hover, drawer mode, unconfirmed target, AoE preview, modal open state.
