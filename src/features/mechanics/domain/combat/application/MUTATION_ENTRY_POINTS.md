# Encounter mutation entry points

**Prep vs commit:** see [`PHASE_4C_ACTION_PREP_VS_COMMIT.md`](./PHASE_4C_ACTION_PREP_VS_COMMIT.md) (UI-local preparation vs confirmed payload vs authoritative `applyCombatIntent`).

Primary state hub: `src/features/encounter/hooks/useEncounterState.ts`.

| Flow | Handler | Engine / notes |
|------|---------|----------------|
| Start encounter | `handleStartEncounter` | `createEncounterState` |
| End turn | `handleNextTurn` | `applyCombatIntent` (`end-turn`) → `advanceEncounterTurn` |
| Resolve action | `handleResolveAction` | `applyCombatIntent` (`resolve-action`) → `resolveCombatAction` |
| Grid move | `handleMoveCombatant` | `applyCombatIntent` (`move-combatant`) → `moveCombatant` + reconciliation, stealth, auras |
| DM / manual | damage, healing, conditions, etc. | state mutators (not intent-dispatched yet) |
| Reset | `handleResetEncounter` | clears encounter state |

Orchestration for move/resolve/end-turn lives in [`apply-combat-intent.ts`](./apply-combat-intent.ts) and helpers (`apply-move-combatant-intent.ts`, `apply-resolve-action-intent.ts`).

Routes (`EncounterActiveRoute`, `EncounterRuntimeContext`) wire grid/footer callbacks to the handlers above.

## Phase 4D — log and toast from intent success

After a successful `applyCombatIntent`, Encounter schedules **one** `queueMicrotask` per intent (not per `log-appended` event). Log rows for UI/toast are a **single flattened** array: `flattenLogEntriesFromIntentSuccess` in [`intent-success-log-entries.ts`](./intent-success-log-entries.ts) concatenates every `log-appended` chunk in `result.events` order. The hook still exposes **`registerCombatLogAppended(entries, stateAfter)`** unchanged; the route passes flattened `entries` into `buildEncounterActionToastPayload`.

## Later migration (4E+)

| Area | Notes |
|------|--------|
| AoE / spawn as standalone intents | Optional; today folded into `resolve-action` selection |
| DM manual mutators | Could become intents or stay simulator-only |

UI-only (never authoritative intents): hover, drawer mode, unconfirmed target, AoE preview, modal open state.
