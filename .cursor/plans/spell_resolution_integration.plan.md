---
name: Spell Resolution Integration
overview: Staged plan to author structured effects for ~250 note-only spell stubs and extend the resolution engine to support additional effect kinds, prioritizing combat-impactful spell patterns that require the least engine work first.
todos:
  - id: stage-0-tracking
    content: Add note category to NoteEffect, optional resolution.caveats to SpellBase, getSpellResolutionStatus utility, and wire into SpellListRoute
    status: pending
  - id: stage-1-save-damage
    content: Author structured effects for ~25 save-based damage spells and ~15 save-condition spells across levels 1-9 (no engine changes needed)
    status: pending
  - id: stage-2-heal-attack
    content: Author structured effects for ~8 healing spells and ~2 attack-roll spells (no engine changes needed)
    status: pending
  - id: stage-3-modifier
    content: Extend modifier resolution in action-effects.ts beyond AC-add to support speed, attack, saves, and set/min modes; author ~10-15 buff/debuff spells
    status: pending
  - id: stage-4-roll-modifier
    content: Add roll-modifier runtime resolution (advantage/disadvantage tracking + application in attack/save rolls); author ~8-10 spells
    status: pending
  - id: stage-5-concentration
    content: Implement concentration tracking on CombatantInstance with damage-triggered saves and effect cleanup
    status: pending
  - id: stage-6-interval
    content: Resolve state.ongoingEffects and interval effects on turn boundaries via turn hooks; author ~15-20 ongoing-damage spells
    status: pending
  - id: stage-7-advanced
    content: Implement trigger, auto-hit, grant, move, check, and form effect resolution as demand justifies
    status: pending
  - id: stage-8-docs
    content: Update docs/reference/effects.md with note category, resolution status, and scaling tiers; update docs/reference/resolution.md with new engine capabilities and supported effect matrix
    status: pending
isProject: false
---

# Spell Resolution Integration Plan

## Current State

**Spell catalog:** ~273 spells across levels 0-9.

- **~23 spells** have structured effects (targeting, damage, save, condition, hit-points, modifier, immunity, etc.)
- **~250 spells** are note-only stubs that resolve as `log-only`

**Resolution engine ([action-effects.ts](src/features/mechanics/domain/encounter/resolution/action/action-effects.ts))** handles:

- `save` (full branching), `damage`, `hit-points`, `condition`, `state`, `note` -- **full support**
- `modifier` -- **AC add only**; other stat targets and modes unsupported
- `immunity` -- `spell` and `source-action` scope only
- `death-outcome`, `interval`, `move` -- **log only**
- Everything else -- **unsupported**

**Spell adapter ([encounter-helpers.ts](src/features/encounter/helpers/encounter-helpers.ts), `classifySpellResolutionMode`)** classifies into:

- `attack-roll` (has `deliveryMethod`) -- 12 spells
- `effects` (has `save`, `hit-points` heal, or self-range `modifier`/`immunity`) -- 11 spells
- `log-only` -- everything else (~250 spells)

---

## Staging Strategy

Two parallel tracks: **authoring** (converting stubs to structured effects) and **engine** (extending `applyActionEffects` and the adapter). Each stage is ordered by the ratio of spells unlocked to engine work required.

---

## Stage 0: Resolution Status Tracking (Infrastructure)

Add infrastructure to track spell authoring completeness, queryable at runtime for SpellListRoute filtering.

**1. Add `category` to `NoteEffect`** in [effects.types.ts](src/features/mechanics/domain/effects/effects.types.ts):

```ts
export type NoteEffect = EffectBase<'note'> & {
  text: string;
  category?: 'under-modeled' | 'flavor';
};
```

- `under-modeled`: the note stands in for a mechanic that cannot yet be structurally modeled (e.g., "Charmed creature can still attack allies of caster")
- `flavor`: descriptive text that is not a mechanical gap (e.g., "Flammable objects start burning")
- Omitted: treated as ambiguous; existing note-only stubs do not need retroactive categorization

**2. Add optional `resolution` to `SpellBase`** in [spell.types.ts](src/features/content/spells/domain/types/spell.types.ts):

```ts
resolution?: {
  caveats?: string[];
};
```

For per-spell qualitative gaps that categorized notes cannot express (e.g., "target prevention behavior requires engine Stage 4"). Most spells will not need this.

**3. Derive `SpellResolutionStatus` at runtime:**

```ts
type SpellResolutionStatus = 'stub' | 'partial' | 'full';

function getSpellResolutionStatus(spell: SpellBase): SpellResolutionStatus {
  const effects = spell.effects ?? [];
  const hasStructured = effects.some(e => e.kind !== 'note');
  if (!hasStructured) return 'stub';

  const hasUnderModeled = effects.some(
    e => e.kind === 'note' && e.category === 'under-modeled'
  );
  const hasCaveats = (spell.resolution?.caveats?.length ?? 0) > 0;
  if (hasUnderModeled || hasCaveats) return 'partial';

  return 'full';
}
```

Status transitions automatically as you author:

- Note-only stub -> `stub`
- Structured effects + under-modeled notes -> `partial`
- All mechanics modeled, notes are flavor-only -> `full`

**4. Wire into SpellListRoute** as a filterable/sortable column.

---

## Stage 1: Author Save-Based Damage Spells (Pure Authoring)

**Engine work:** None. The existing `targeting -> save -> damage` pipeline already fully resolves this pattern.

**Target spells** -- these are the most common combat spells and currently note-only:

- Level 1: Burning Hands (DEX/fire), Thunderwave (CON/thunder), Hellish Rebuke (DEX/fire)
- Level 2: Shatter (CON/thunder)
- Level 3: Lightning Bolt (DEX/lightning), Call Lightning (DEX/lightning)
- Level 4: Ice Storm (DEX/bludgeoning+cold), Blight (CON/necrotic), Vitriolic Sphere (DEX/acid)
- Level 5: Cone of Cold (CON/cold), Flame Strike (DEX/fire+radiant), Insect Plague (CON/piercing), Cloudkill (CON/poison)
- Level 6: Chain Lightning (DEX/lightning), Circle of Death (CON/necrotic), Disintegrate (DEX/force), Sunbeam (CON/radiant)
- Level 7: Delayed Blast Fireball (DEX/fire), Finger of Death (CON/necrotic), Fire Storm (DEX/fire), Prismatic Spray (DEX/varies)
- Level 8: Sunburst (CON/radiant)
- Level 9: Meteor Swarm (DEX/fire+bludgeoning)

**Also author save + condition spells** (engine already handles this):

- Level 3: Fear (WIS/frightened), Hypnotic Pattern (WIS/incapacitated+charmed), Stinking Cloud (CON/incapacitated), Slow (WIS)
- Level 4: Banishment (CHA), Confusion (WIS), Phantasmal Killer (WIS/frightened+damage)
- Level 5: Hold Monster (WIS/paralyzed), Contagion (CON/poisoned)
- Level 6: Flesh to Stone (CON/restrained->petrified), Eyebite (WIS/varies), Irresistible Dance (WIS)
- Level 8: Power Word Stun (auto/stunned)

**Estimated yield:** ~40 spells move from log-only to fully resolved.

---

## Stage 2: Author More Healing and Attack-Roll Spells (Pure Authoring)

**Engine work:** None.

**Healing** (engine supports `hit-points` with `mode: 'heal'`):

- Level 3: Mass Healing Word, Revivify
- Level 5: Mass Cure Wounds
- Level 6: Heal
- Level 7: Regenerate, Resurrection
- Level 9: Mass Heal, Power Word Heal

**Attack-roll** (engine supports `deliveryMethod` + `damage`):

- Level 1: Inflict Wounds (melee-spell-attack)
- Level 3: Vampiric Touch (already has deliveryMethod; may need structured damage)

**Estimated yield:** ~10 more spells fully resolved. Running total: ~50 spells with mechanical resolution.

---

## Stage 3: Extend Modifier Support (Engine + Authoring)

**Engine work in [action-effects.ts](src/features/mechanics/domain/encounter/resolution/action/action-effects.ts):**

Currently the modifier branch is gated to AC-add-numeric only:

```232:248:src/features/mechanics/domain/encounter/resolution/action/action-effects.ts
    if (effect.kind === 'modifier' && effect.target === 'armor_class' && effect.mode === 'add' && typeof effect.value === 'number') {
      // ...only AC add
    }
```

Extend to support:

- **More stat targets:** `speed`, `attack`, `damage_bonus`, saving throw modifiers
- **More modes:** `set` (for Barkskin's "AC can't be less than 16"), `multiply` (for Haste speed doubling)
- Extend `addStatModifierToCombatant` to track non-AC modifiers and apply them during resolution

**Adapter work in [encounter-helpers.ts](src/features/encounter/helpers/encounter-helpers.ts):**

- `classifySpellResolutionMode` already catches self-range `modifier` -- extend to catch modifier spells with non-self range too (e.g., Bane targets enemies)

**Unlocked spells:**

- Shield of Faith (AC +2), Mage Armor (AC set 13+DEX), Barkskin (AC min 16)
- Longstrider (speed +10), Haste (AC +2, speed double), Expeditious Retreat (dash bonus action)
- Stoneskin (resistance), Protection from Energy (resistance)
- Bless (d4 attack+save), Bane (d4 penalty)

**Estimated yield:** ~10-15 more spells. Running total: ~60-65.

---

## Stage 4: Roll-Modifier Support (Engine + Authoring)

**Engine work:**

- Add `roll-modifier` handling in `applyActionEffects` -- apply advantage/disadvantage as a runtime state on the target
- Track active roll-modifiers on `CombatantInstance` (e.g., "advantage on attack rolls", "disadvantage on attacks against this creature")
- Wire into the attack-roll resolution path in [action-resolver.ts](src/features/mechanics/domain/encounter/resolution/action/action-resolver.ts) so advantage/disadvantage modifies the d20 roll

**Unlocked spells:**

- Blur (disadvantage on attacks against), Greater Invisibility (advantage + disadvantage)
- Faerie Fire (advantage on attacks against), True Strike (advantage on next attack)
- Guiding Bolt on-hit rider (advantage), Vicious Mockery (disadvantage on next attack)

**Estimated yield:** ~8-10 more spells. Running total: ~70-75.

---

## Stage 5: Concentration Tracking (Engine Only)

**Engine work:**

- Add `concentrating` flag (spell ID + associated runtime effect IDs) to `CombatantInstance`
- On damage to a concentrating caster, auto-roll CON save (DC = max(10, damage/2))
- On failed save or new concentration spell, remove all effects linked to the old spell
- Wire into `applyDamageToCombatant` to trigger concentration checks

**Adapter work:**

- Tag spells with `concentration: true` from `spell.duration.concentration`
- When building combat actions, mark the action as concentration-dependent

**No new spells are unlocked directly**, but all buff/debuff spells authored in stages 1-4 that have concentration become mechanically honest (e.g., Hold Person, Blur, Haste, Bless, Bane all drop on damage).

---

## Stage 6: Ongoing / Interval Effects (Engine + Authoring)

**Engine work:**

- Resolve `state.ongoingEffects` on turn boundaries (currently just logged)
- Resolve `interval` effects (damage/healing at turn start/end)
- Wire into the turn-hook system in [runtime.ts](src/features/mechanics/domain/encounter/state/runtime.ts)

**Unlocked spells:**

- Spirit Guardians (damage on turn start/entry), Moonbeam (damage on turn start)
- Wall of Fire (damage on entry/turn end), Witch Bolt (damage on turn)
- Heat Metal (damage on bonus action), Flaming Sphere (damage on bonus action)
- Cloud of Daggers, Hunger of Hadar, Sickening Radiance

**Estimated yield:** ~15-20 more spells. Running total: ~85-95.

---

## Stage 7: Advanced Patterns (Engine + Authoring)

Lower priority; each unlocks fewer spells and requires more engine work:

- **Trigger effects:** Reactive damage (Fire Shield), Shield reaction. Requires an event bus or hook system.
- **Auto-hit:** Magic Missile. Needs a new resolution mode or flag.
- **Grant effects at runtime:** Condition immunities (Protection from Evil, Freedom of Movement).
- **Move effects (actual application):** Forced push/pull (Thunderwave, Gust of Wind). Requires position tracking.
- **Check effects:** Ability check gates (Web escape, Counterspell contest).
- **Form effects:** Polymorph, Shapechange -- stat block replacement.

---

## Effect Type Scaling Strategy

How effect kinds should evolve as more spells are authored:

### Tier 1 -- Canonical, Fully Resolved

Already stable. No scaling concerns.

- `save`, `damage`, `hit-points`, `condition`, `state`, `note`

### Tier 2 -- Extend Existing Partial Support

Small, bounded engine changes with high payoff.

- `**modifier`**: Expand stat targets beyond `armor_class`; add `set`/`min` modes. The `StatTarget` type and `addStatModifierToCombatant` are the extension points.
- `**immunity`**: Expand scope if damage-type or condition immunity patterns recur (e.g., Protection from Energy grants resistance, not full immunity -- may need a `resistance` scope or a separate `grant` resolution path).

### Tier 3 -- New Runtime Resolution

Medium engine work.

- `**roll-modifier`**: Track advantage/disadvantage as runtime state; wire into attack/save resolution.
- `**interval**`: Per-turn effect application via turn hooks.
- `**move**`: Forced movement application (bounded -- no grid tracking needed, just distance + direction for log fidelity).

### Tier 4 -- Deferred / Under-Model

Follow the extension policy in [effects.md](docs/reference/effects.md): under-model first, promote only when the pattern proves repeatable.

- `trigger`, `activation`, `form`, `spawn`, `aura`, `check`, `grant` (runtime), `containment`, `visibility-rule`, `hold-breath`, `tracked-part`, `extra-reaction`, `resource`, `formula`
- These remain authored as structured content but resolve to log-text at runtime until demand justifies engine investment.

### Key Scaling Principle

Content authoring should continue aggressively using the full `Effect` vocabulary regardless of runtime support. The adapter degrades unsupported kinds to log-text gracefully. This means:

- **Author all spells fully** even if the engine can't resolve them yet
- **Engine catches up stage by stage**, each time unlocking a batch of already-authored spells
- This avoids the trap of authoring content to match current runtime limits (anti-pattern from [effects.md](docs/reference/effects.md) section 11)

---

## Stage 8: Documentation Updates

Update both reference docs to reflect all changes made in Stages 0-7.

### [docs/reference/effects.md](docs/reference/effects.md)

- **Section 5 (Shared Effect Kind Reference):** Add `category` field documentation to the `note` kind entry. Describe `under-modeled` vs `flavor` semantics and when to use each.
- **Section 8 (Intentional Under-Modeling):** Update to reference the `category: 'under-modeled'` pattern as the canonical way to mark partial modeling. Add guidance on transitioning notes from `under-modeled` to `flavor` (or removing them) as the engine catches up.
- **Section 9 (Scaling Direction):** Add documentation for `resolution.caveats` on SpellBase and the derived `SpellResolutionStatus` (`stub | partial | full`). Document how status is computed and what drives transitions.
- **Section 10 (Adapter Philosophy):** Update "Known Unsupported Spell Mechanics" to reflect which gaps have been closed by engine work in Stages 3-7. Add newly supported mechanics (modifier targets, roll-modifiers, concentration, interval/ongoing effects, etc.).
- **New section: Effect Type Scaling Tiers.** Codify the Tier 1-4 scaling strategy from this plan as permanent reference: which effect kinds are fully resolved, which are partially resolved, which are deferred. This replaces the informal status markers currently in Section 5.

### [docs/reference/resolution.md](docs/reference/resolution.md)

- **Section 4.4 (Action Resolution):** Update the `action-effects` module description to list all newly supported effect kinds with their resolution behavior (modifier stat targets and modes, roll-modifier tracking, concentration checks, interval/ongoing application).
- **Section 5 (Extension Points):** Add guidance for "Adding concentration tracking to a spell" and "Adding ongoing/interval effects to a spell" as new extension point patterns.
- **New section: Supported Effect Matrix.** A table mapping each `Effect` kind to its runtime support status (fully resolved / log-only / unsupported) and which resolution mode(s) use it. This gives a single-glance view of engine coverage that stays current as stages land.
- **Consumer Patterns:** Add examples for new patterns introduced (self-buff modifier spells, concentration-dependent spells, interval-based spells).

