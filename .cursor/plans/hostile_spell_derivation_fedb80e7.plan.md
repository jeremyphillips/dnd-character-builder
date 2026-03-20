---
name: Hostile spell derivation
overview: Hostile vs non-hostile is not inferred from spell text or effect kinds today; it comes almost entirely from CombatActionTargetingProfile plus explicit requiresWilling. Phase 2 adds a derived classifier (damage, save, state map, escape hatch) with clear precedence, then maps results into combat actions / isHostileAction.
todos:
  - id: audit-touch-buffs
    content: Audit spell catalog for touch + one-creature buffs missing requiresWilling (start with mage-armor in level1-m-z.ts)
    status: pending
  - id: docs-hostility
    content: "Add authoring note: hostility = combat targeting + Phase 2 signals; when to set requiresWilling"
    status: pending
  - id: optional-lint
    content: "Optional: spell audit script for suspicious touch+one-creature without requiresWilling/damage/save"
    status: pending
  - id: phase2-classifier
    content: "Implement deriveSpellHostility (precedence below); walk effects for damage/save; wire spell-combat-adapter + isHostileAction or action targeting"
    status: pending
  - id: state-hostility-map
    content: "Add stateId → hostile | non-hostile map (e.g. hallowed non-hostile); unknown falls through"
    status: pending
  - id: escape-hatch-meta
    content: "Add spell.resolution.hostileIntent optional boolean override in types + adapter"
    status: pending
isProject: false
---

# Better derivation of hostile vs non-hostile spells

## How hostility is derived today

There is **no** central “is this spell hostile?” classifier on spell data. Encounter resolution uses [`isHostileAction`](src/features/mechanics/domain/encounter/resolution/action/action-targeting.ts):

```42:46:src/features/mechanics/domain/encounter/resolution/action/action-targeting.ts
export function isHostileAction(action: CombatActionDefinition): boolean {
  const kind = action.targeting?.kind
  if (action.targeting?.requiresWilling) return false
  return !kind || kind === 'single-target' || kind === 'all-enemies' || kind === 'entered-during-move'
}
```

- **`requiresWilling: true`** on the action’s targeting profile → **not hostile** (charm / “can’t target charmer” rules don’t apply as hostile).
- Otherwise, **`single-target`**, **`all-enemies`**, **`entered-during-move`**, or **missing `kind`** → treated as **hostile**.
- **`self`**, **`single-creature`**, **`dead-creature`** → **not** hostile (the `kind` checks don’t match those strings).

Spells are turned into combat actions in [`buildSpellTargeting`](src/features/encounter/helpers/spell-combat-adapter.ts). Special cases:

| Signal in spell data | Combat targeting |
| -------------------- | ---------------- |
| `range.kind === 'self'` | `self` |
| `one-dead-creature` | `dead-creature` |
| `hit-points` heal | `single-creature` (non-hostile) |
| `targeting.requiresWilling` | `single-target` + **`requiresWilling: true`** (non-hostile for ally touch) |
| Default `one-creature` | `single-target` **without** `requiresWilling` → **hostile** |

With default [`suppressSameSideHostileActions`](src/features/mechanics/domain/encounter/resolution/action-resolution.types.ts) (on unless explicitly `false`), hostile **`single-target`** cannot pick same-side combatants—so **Mage Armor** blocks allies until you mark it as willing.

## Why Mage Armor fails

[`mage-armor`](src/features/mechanics/domain/rulesets/system/spells/data/level1-m-z.ts) has `one-creature` targeting but **no** `requiresWilling`, despite copy saying “touch a willing creature.” Default path → hostile `single-target` → ally targeting blocked.

---

## Phase 2: Derived spell hostility (classifier)

Goal: infer **hostile vs non-hostile** from authored `effects` (and overrides) so touch buffs, wards, and save-based spells classify correctly without hand-flagging every spell.

**Signals (building blocks)**

| Signal | Typical classification | Caveats |
| ------ | ------------------------ | ------- |
| `targeting.requiresWilling` | **Non-hostile** (willing / same-side touch) | Explicit author intent; keep as highest explicit rule after escape hatch. |
| Any `effect.kind === 'damage'` (walk nested: `save.onFail`, `onSuccess`, `interval.effects`, etc.) | **Hostile** | Strong default; few buff false positives. |
| Top-level or meaningful `effect.kind === 'save'` (and nested branches that aren’t notes-only) | **Hostile** by default | “Target resists” usually means harmful application; false positives if a buff is mis-modeled with a stray `save`. |
| `state` effect whose `stateId` appears in **state hostility map** | Map says **hostile** or **non-hostile** | e.g. `hallowed` → **non-hostile** (ward / area setup, not a direct attack). Unknown `stateId` → no signal (fall through). |
| Healing (`hit-points` heal) | Already **non-hostile** via `single-creature` in adapter | Keep aligned with classifier. |

**Precedence (highest wins)**

1. **Escape hatch** — optional `spell.resolution.hostileIntent: boolean` (or `targeting`-level mirror) set in data: **forces** hostile or non-hostile for edge cases (GM spells, odd authoring).
2. **`requiresWilling`** on spell `targeting` effect → **non-hostile** for willingness / ally touch semantics.
3. **State map lookup** on primary `state` effects (first match or merge policy TBD) → if **non-hostile**, classifier returns non-hostile unless overridden by (1).
4. **Any damage** in walked effects → **hostile**.
5. **Save** present (with non-note harmful payload on fail/success, if you want to tighten) → **hostile**.
6. **Default** — keep current behavior: `single-target` without above → **hostile** (conservative for charm / suppression), or **unknown** in audit-only mode first.

**Implementation notes**

- Implement **`deriveSpellHostility(spell): 'hostile' | 'non-hostile' | 'unknown'`** in one module (e.g. next to spell adapter or `spell-resolution-audit.ts`); reuse a single recursive **effect walker** (same spirit as [`walkNestedEffects`](src/features/encounter/helpers/spell-resolution-audit.ts)).
- **Runtime wiring**: `buildSpellCombatActions` sets `CombatActionDefinition.targeting` and/or a new field **`hostileApplication?: boolean`** so [`isHostileAction`](src/features/mechanics/domain/encounter/resolution/action/action-targeting.ts) can prefer **data-derived** hostility when present instead of inferring only from `kind`. Alternatively: set `requiresWilling` only from explicit data, and set **`hostileIntent: false`** from classifier when non-hostile—avoid conflating “willing” with “not hostile” for non-touch spells.
- **State map**: small record in code or JSON, e.g. `{ hallowed: 'non-hostile', ... }`, documented in [`effects.md`](docs/reference/effects.md).

**Caveats**

- Do **not** silently override explicit `requiresWilling` / escape hatch.
- **Save = hostile** is heuristic; pair with **lint** for “save + no damage + no requiresWilling” for review.
- True **willing consent** is still approximated as same-side + `requiresWilling` at encounter layer.

---

## Phase 1 (still valuable): Authoring + docs + lint

1. **Authoring** — Touch buffs: set **`requiresWilling: true`** where rules say “willing creature” (Mage Armor, etc.); audit catalog.
2. **Documentation** — Clarify: today hostility = targeting profile; Phase 2 adds derived hostility from effects + map + override.
3. **Optional lint** — Flag `touch` + `one-creature` + no `requiresWilling` + no damage/save → suggest `requiresWilling` or escape hatch.

## Out of scope (for this plan)

- Replacing all of `isHostileAction` in one shot without adapter bridge.
- Full simulation of “willing” vs “ally only” beyond same-side.
