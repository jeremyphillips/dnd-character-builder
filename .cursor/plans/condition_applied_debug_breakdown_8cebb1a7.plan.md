---
name: Condition applied debug breakdown
overview: Add condition consequence breakdowns, concentration time tracking, and a combatant status snapshot to debug logs so that debug mode surfaces full mechanical context at key resolution points.
todos:
  - id: format-condition-debug
    content: Add `formatConditionConsequencesDebug` helper to `resolution-debug.ts`
    status: completed
  - id: wire-condition-applied
    content: Add `debugDetails` to `condition-applied` log event in `condition-mutations.ts`
    status: completed
  - id: format-status-snapshot
    content: Add `formatCombatantStatusSnapshot` helper to `resolution-debug.ts`
    status: completed
  - id: wire-turn-start
    content: Add combatant status snapshot debug details to `turn-started` log in `runtime.ts`
    status: completed
  - id: wire-concentration
    content: Add concentration time tracking debug line to `turn-ended` log in `runtime.ts`
    status: completed
  - id: update-docs
    content: Document new debug helpers and integration points in `resolution.md`
    status: completed
isProject: false
---

# Condition-Applied Debug Breakdown and Status Snapshots

## 1. Condition consequence breakdown on apply

When `addConditionToCombatant` in [condition-mutations.ts](src/features/mechanics/domain/encounter/state/condition-mutations.ts) emits the `condition-applied` log event, look up the condition label in `CONDITION_RULES`. If it matches a known `EffectConditionId`, format its consequences as `debugDetails`.

### Add `formatConditionConsequencesDebug` to `resolution-debug.ts`

New helper in [resolution-debug.ts](src/features/mechanics/domain/encounter/resolution/action/resolution-debug.ts) that takes a condition label, checks if it exists in `CONDITION_RULES`, and returns a `string[]` describing each consequence in human-readable form:

```typescript
export function formatConditionConsequencesDebug(conditionLabel: string): string[]
```

Uses the `ConditionConsequence` discriminated union to format each kind:

- `action_limit` -> `"cannot take actions"`, `"cannot take reactions"`
- `movement` -> `"speed becomes zero"`, `"stand-up costs half movement"`
- `attack_mod` -> `"outgoing attack disadvantage"`, `"incoming attack advantage (melee)"`
- `save_mod` -> `"auto-fail STR/DEX saves"`, `"DEX save disadvantage"`
- `check_mod` -> `"all ability checks at disadvantage"`
- `speech` -> `"cannot speak"`
- `awareness` -> `"unaware of surroundings"`
- `visibility` -> `"cannot see"`, `"unseen by default"`
- `crit_window` -> `"incoming melee hits within 5ft become critical"`
- `source_relative` -> `"cannot attack source"`, `"cannot move closer to source"`
- `damage_interaction` -> `"resistance to all damage"`

Returns `["consequences:", "  ...", "  ..."]` if the condition is known, or `[]` if not.

### Wire into `condition-mutations.ts`

In `addConditionToCombatant` ([condition-mutations.ts](src/features/mechanics/domain/encounter/state/condition-mutations.ts) line 29), add `debugDetails` to the `condition-applied` log event:

```typescript
import { formatConditionConsequencesDebug } from '../resolution/action/resolution-debug'

const condDebug = formatConditionConsequencesDebug(trimmedCondition)
// ...
debugDetails: condDebug.length > 0 ? condDebug : undefined,
```

## 2. Combatant status snapshot at turn-start

Add a debug-only status snapshot when each combatant starts their turn. This shows all active conditions, states, concentration, and key derived resource state in one place.

### Add `formatCombatantStatusSnapshot` to `resolution-debug.ts`

```typescript
export function formatCombatantStatusSnapshot(combatant: CombatantInstance): string[]
```

Returns lines like:

```
status:
  HP: 25/45 (bloodied)
  conditions: incapacitated, prone
  states: banished
  concentrating: Banishment (12s/60s)
  actions: disabled (incapacitated)
  movement: 0 (incapacitated)
```

- Lists conditions and states from `combatant.conditions` and `combatant.states`
- Shows concentration with time tracking: uses the same `(elapsed/total)` format as the UI badge (`(totalTurns - remainingTurns) * 6`s / `totalTurns * 6`s). Shows `(indefinite)` when `remainingTurns` is undefined.
- Shows HP and bloodied status
- Shows disabled resources from condition consequences (`canTakeActions`, `canTakeReactions`, `getSpeedConsequences`)
- Returns `[]` if the combatant has no conditions, no states, and no concentration (nothing interesting to report)

### Wire into `runtime.ts` turn-started log

The `createTurnStartedLog` function in [logging.ts](src/features/mechanics/domain/encounter/state/logging.ts) (line 32) creates the `turn-started` event. It currently has no `debugDetails`. Add the snapshot:

```typescript
const combatant = state.combatantsById[state.activeCombatantId ?? '']
const snapshot = combatant ? formatCombatantStatusSnapshot(combatant) : []
// ...
debugDetails: snapshot.length > 0 ? snapshot : undefined,
```

## 3. Concentration time tracking at turn-end

`tickConcentrationDuration` in [concentration-mutations.ts](src/features/mechanics/domain/encounter/state/concentration-mutations.ts) decrements `remainingTurns` at the caster's turn-end. It already logs a note when concentration expires. Add a debug note after each tick showing the updated timer, matching the UI badge format:

```
Concentrating: Banishment (12s/60s)
```

This is wired into the existing `turn-ended` path in [runtime.ts](src/features/mechanics/domain/encounter/state/runtime.ts). The `createTurnEndedLog` in `logging.ts` can include the concentration timer as a `debugDetails` line if the active combatant is concentrating. Alternatively, `tickConcentrationDuration` itself can emit a debug note after decrementing.

The simpler approach: add the concentration timer to the `turn-ended` log event in `createTurnEndedLog` when the active combatant is concentrating, since `state` is available there.

## Files changed

- [resolution-debug.ts](src/features/mechanics/domain/encounter/resolution/action/resolution-debug.ts) --- add `formatConditionConsequencesDebug`, `formatCombatantStatusSnapshot`
- [condition-mutations.ts](src/features/mechanics/domain/encounter/state/condition-mutations.ts) --- import formatter, add `debugDetails` to `condition-applied` log
- [logging.ts](src/features/mechanics/domain/encounter/state/logging.ts) --- add `debugDetails` to `createTurnStartedLog` (status snapshot) and `createTurnEndedLog` (concentration timer)
- [docs/reference/resolution.md](docs/reference/resolution.md) --- update Section 4.6 with new debug helpers and integration points
