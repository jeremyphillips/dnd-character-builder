import { 
  standardAlignments, 
  basicAlignments, 
  fourEAlignments,
  type Edition,
  type LevelProgression
} from "@/data"

const basicRaces = [
  'human',
  'dwarf',
  'elf',
  'halfling'
] as const

const advancedBasicRaces = [
  ...basicRaces,
  'gnome',
  'halfElf',
  'halfOrc'
] as const

// ===========================================================================
// XP Tables
// ===========================================================================
//
// ARCHITECTURE NOTE — Two XP models exist across D&D history:
//
//   1. Universal tables (3e, 3.5e, 4e, 5e)
//      Every class advances at the same rate.  Stored in
//      Edition.progression.experience.
//
//   2. Class-specific tables (OD&D, Basic/B/X/BECMI, 1e, 2e)
//      Each class has its own XP-per-level curve.  A Fighter at level 5
//      might need 16,000 XP while a Thief at level 5 needs only 10,000 XP.
//      Stored in Edition.progression.classExperience keyed by CANONICAL
//      class ID (post-alias — "fighter" not "fighting-man").
//
// The lookup function (domain/character/xp.ts) checks classExperience first,
// then falls back to experience, then returns 0.
//
// MULTICLASS NOTE — In pre-3e editions XP is typically *divided* between
// classes.  For character creation the builder only needs to look up the
// primary class's table to show the right XP threshold.  Runtime XP
// division is a game-play concern, not a builder concern.
//
// LEVEL CAP NOTE — Several pre-3e classes have a "name level" (usually 9)
// after which XP increases linearly.  We encode these linear ranges
// explicitly to avoid ambiguity up to a reasonable ceiling (level 20).
// ===========================================================================

// ---------------------------------------------------------------------------
// 5e — Universal (levels 1–20)
// ---------------------------------------------------------------------------
const fiveEExperience: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 300 },
  { level: 3, xpRequired: 900 },
  { level: 4, xpRequired: 2700 },
  { level: 5, xpRequired: 6500 },
  { level: 6, xpRequired: 14000 },
  { level: 7, xpRequired: 23000 },
  { level: 8, xpRequired: 34000 },
  { level: 9, xpRequired: 48000 },
  { level: 10, xpRequired: 64000 },
  { level: 11, xpRequired: 85000 },
  { level: 12, xpRequired: 100000 },
  { level: 13, xpRequired: 120000 },
  { level: 14, xpRequired: 140000 },
  { level: 15, xpRequired: 165000 },
  { level: 16, xpRequired: 195000 },
  { level: 17, xpRequired: 225000 },
  { level: 18, xpRequired: 265000 },
  { level: 19, xpRequired: 305000 },
  { level: 20, xpRequired: 355000 }
]

// ---------------------------------------------------------------------------
// 4e — Universal (levels 1–30, three tiers: Heroic/Paragon/Epic)
// ---------------------------------------------------------------------------
const fourEExperience: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1000 },
  { level: 3, xpRequired: 2250 },
  { level: 4, xpRequired: 3750 },
  { level: 5, xpRequired: 5500 },
  { level: 6, xpRequired: 7500 },
  { level: 7, xpRequired: 10000 },
  { level: 8, xpRequired: 13000 },
  { level: 9, xpRequired: 16500 },
  { level: 10, xpRequired: 20500 },
  // Paragon tier
  { level: 11, xpRequired: 26000 },
  { level: 12, xpRequired: 32000 },
  { level: 13, xpRequired: 39000 },
  { level: 14, xpRequired: 47000 },
  { level: 15, xpRequired: 57000 },
  { level: 16, xpRequired: 69000 },
  { level: 17, xpRequired: 83000 },
  { level: 18, xpRequired: 99000 },
  { level: 19, xpRequired: 119000 },
  { level: 20, xpRequired: 143000 },
  // Epic tier
  { level: 21, xpRequired: 175000 },
  { level: 22, xpRequired: 210000 },
  { level: 23, xpRequired: 255000 },
  { level: 24, xpRequired: 310000 },
  { level: 25, xpRequired: 375000 },
  { level: 26, xpRequired: 450000 },
  { level: 27, xpRequired: 550000 },
  { level: 28, xpRequired: 675000 },
  { level: 29, xpRequired: 825000 },
  { level: 30, xpRequired: 1000000 }
]

// ---------------------------------------------------------------------------
// 3e / 3.5e — Universal (levels 1–20)
// Both editions share the same XP table.
// ---------------------------------------------------------------------------
const threeEExperience: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1000 },
  { level: 3, xpRequired: 3000 },
  { level: 4, xpRequired: 6000 },
  { level: 5, xpRequired: 10000 },
  { level: 6, xpRequired: 15000 },
  { level: 7, xpRequired: 21000 },
  { level: 8, xpRequired: 28000 },
  { level: 9, xpRequired: 36000 },
  { level: 10, xpRequired: 45000 },
  { level: 11, xpRequired: 55000 },
  { level: 12, xpRequired: 66000 },
  { level: 13, xpRequired: 78000 },
  { level: 14, xpRequired: 91000 },
  { level: 15, xpRequired: 105000 },
  { level: 16, xpRequired: 120000 },
  { level: 17, xpRequired: 136000 },
  { level: 18, xpRequired: 153000 },
  { level: 19, xpRequired: 171000 },
  { level: 20, xpRequired: 190000 }
]

// ---------------------------------------------------------------------------
// 2e AD&D — Class-specific XP tables
// ---------------------------------------------------------------------------
//
// DESIGN NOTE — After "name level" (usually level 9 or 10), most 2e classes
// gain levels at a flat XP increment.  We pre-compute these up to level 20
// rather than encoding the formula, keeping the data format consistent
// with the universal tables.
//
// The canonical class IDs below match our class data (post-alias).
// "mage" → "wizard", "thief" → "rogue" is NOT aliased (thief IS the
// canonical 2e ID in our system — it maps to rogue only in 5e context).

const twoE_fighter: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2000 },
  { level: 3, xpRequired: 4000 },
  { level: 4, xpRequired: 8000 },
  { level: 5, xpRequired: 16000 },
  { level: 6, xpRequired: 32000 },
  { level: 7, xpRequired: 64000 },
  { level: 8, xpRequired: 125000 },
  { level: 9, xpRequired: 250000 },
  // After name level: +250,000 per level
  { level: 10, xpRequired: 500000 },
  { level: 11, xpRequired: 750000 },
  { level: 12, xpRequired: 1000000 },
  { level: 13, xpRequired: 1250000 },
  { level: 14, xpRequired: 1500000 },
  { level: 15, xpRequired: 1750000 },
  { level: 16, xpRequired: 2000000 },
  { level: 17, xpRequired: 2250000 },
  { level: 18, xpRequired: 2500000 },
  { level: 19, xpRequired: 2750000 },
  { level: 20, xpRequired: 3000000 }
]

const twoE_paladin: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2250 },
  { level: 3, xpRequired: 4500 },
  { level: 4, xpRequired: 9000 },
  { level: 5, xpRequired: 18000 },
  { level: 6, xpRequired: 36000 },
  { level: 7, xpRequired: 75000 },
  { level: 8, xpRequired: 150000 },
  { level: 9, xpRequired: 300000 },
  // After name level: +300,000 per level
  { level: 10, xpRequired: 600000 },
  { level: 11, xpRequired: 900000 },
  { level: 12, xpRequired: 1200000 },
  { level: 13, xpRequired: 1500000 },
  { level: 14, xpRequired: 1800000 },
  { level: 15, xpRequired: 2100000 },
  { level: 16, xpRequired: 2400000 },
  { level: 17, xpRequired: 2700000 },
  { level: 18, xpRequired: 3000000 },
  { level: 19, xpRequired: 3300000 },
  { level: 20, xpRequired: 3600000 }
]

const twoE_ranger: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2250 },
  { level: 3, xpRequired: 4500 },
  { level: 4, xpRequired: 9000 },
  { level: 5, xpRequired: 18000 },
  { level: 6, xpRequired: 36000 },
  { level: 7, xpRequired: 75000 },
  { level: 8, xpRequired: 150000 },
  { level: 9, xpRequired: 300000 },
  // After name level: +300,000 per level
  { level: 10, xpRequired: 600000 },
  { level: 11, xpRequired: 900000 },
  { level: 12, xpRequired: 1200000 },
  { level: 13, xpRequired: 1500000 },
  { level: 14, xpRequired: 1800000 },
  { level: 15, xpRequired: 2100000 },
  { level: 16, xpRequired: 2400000 },
  { level: 17, xpRequired: 2700000 },
  { level: 18, xpRequired: 3000000 },
  { level: 19, xpRequired: 3300000 },
  { level: 20, xpRequired: 3600000 }
]

const twoE_wizard: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2500 },
  { level: 3, xpRequired: 5000 },
  { level: 4, xpRequired: 10000 },
  { level: 5, xpRequired: 20000 },
  { level: 6, xpRequired: 40000 },
  { level: 7, xpRequired: 60000 },
  { level: 8, xpRequired: 90000 },
  { level: 9, xpRequired: 135000 },
  { level: 10, xpRequired: 250000 },
  { level: 11, xpRequired: 375000 },
  // After level 11: +375,000 per level
  { level: 12, xpRequired: 750000 },
  { level: 13, xpRequired: 1125000 },
  { level: 14, xpRequired: 1500000 },
  { level: 15, xpRequired: 1875000 },
  { level: 16, xpRequired: 2250000 },
  { level: 17, xpRequired: 2625000 },
  { level: 18, xpRequired: 3000000 },
  { level: 19, xpRequired: 3375000 },
  { level: 20, xpRequired: 3750000 }
]

const twoE_cleric: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1500 },
  { level: 3, xpRequired: 3000 },
  { level: 4, xpRequired: 6000 },
  { level: 5, xpRequired: 13000 },
  { level: 6, xpRequired: 27500 },
  { level: 7, xpRequired: 55000 },
  { level: 8, xpRequired: 110000 },
  { level: 9, xpRequired: 225000 },
  // After name level: +225,000 per level
  { level: 10, xpRequired: 450000 },
  { level: 11, xpRequired: 675000 },
  { level: 12, xpRequired: 900000 },
  { level: 13, xpRequired: 1125000 },
  { level: 14, xpRequired: 1350000 },
  { level: 15, xpRequired: 1575000 },
  { level: 16, xpRequired: 1800000 },
  { level: 17, xpRequired: 2025000 },
  { level: 18, xpRequired: 2250000 },
  { level: 19, xpRequired: 2475000 },
  { level: 20, xpRequired: 2700000 }
]

const twoE_druid: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2000 },
  { level: 3, xpRequired: 4000 },
  { level: 4, xpRequired: 7500 },
  { level: 5, xpRequired: 12500 },
  { level: 6, xpRequired: 20000 },
  { level: 7, xpRequired: 35000 },
  { level: 8, xpRequired: 60000 },
  { level: 9, xpRequired: 90000 },
  { level: 10, xpRequired: 125000 },
  { level: 11, xpRequired: 200000 },
  { level: 12, xpRequired: 300000 },
  { level: 13, xpRequired: 750000 },
  { level: 14, xpRequired: 1500000 },
  // Hierophant levels — advancement rules change but we encode for builder use
  { level: 15, xpRequired: 3000000 }
]

const twoE_thief: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1250 },
  { level: 3, xpRequired: 2500 },
  { level: 4, xpRequired: 5000 },
  { level: 5, xpRequired: 10000 },
  { level: 6, xpRequired: 20000 },
  { level: 7, xpRequired: 40000 },
  { level: 8, xpRequired: 70000 },
  { level: 9, xpRequired: 110000 },
  { level: 10, xpRequired: 160000 },
  // After level 10: +220,000 per level
  { level: 11, xpRequired: 380000 },
  { level: 12, xpRequired: 600000 },
  { level: 13, xpRequired: 820000 },
  { level: 14, xpRequired: 1040000 },
  { level: 15, xpRequired: 1260000 },
  { level: 16, xpRequired: 1480000 },
  { level: 17, xpRequired: 1700000 },
  { level: 18, xpRequired: 1920000 },
  { level: 19, xpRequired: 2140000 },
  { level: 20, xpRequired: 2360000 }
]

// Bard in 2e uses the same table as Thief
const twoE_bard = twoE_thief

const twoEClassExperience: Record<string, LevelProgression[]> = {
  fighter:  twoE_fighter,
  paladin:  twoE_paladin,
  ranger:   twoE_ranger,
  wizard:   twoE_wizard,   // "mage" resolves to "wizard" via classAliases
  cleric:   twoE_cleric,
  druid:    twoE_druid,
  thief:    twoE_thief,
  bard:     twoE_bard
}

// ---------------------------------------------------------------------------
// 1e AD&D — Class-specific XP tables
// ---------------------------------------------------------------------------
//
// 1e tables are similar to 2e but not identical.  Key differences:
//   - Fighter name level increment is +250,000 (same as 2e)
//   - Cleric values diverge slightly at mid-levels
//   - Magic-User (wizard) tracks very close to 2e Mage
//   - Thief diverges from 2e at levels 10+
//   - 1e has Assassin and Illusionist as standalone classes

const oneE_fighter: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2001 },
  { level: 3, xpRequired: 4001 },
  { level: 4, xpRequired: 8001 },
  { level: 5, xpRequired: 18001 },
  { level: 6, xpRequired: 35001 },
  { level: 7, xpRequired: 70001 },
  { level: 8, xpRequired: 125001 },
  { level: 9, xpRequired: 250001 },
  { level: 10, xpRequired: 500001 },
  { level: 11, xpRequired: 750001 },
  // +250,000 per level
  { level: 12, xpRequired: 1000001 },
  { level: 13, xpRequired: 1250001 },
  { level: 14, xpRequired: 1500001 },
  { level: 15, xpRequired: 1750001 },
  { level: 16, xpRequired: 2000001 },
  { level: 17, xpRequired: 2250001 },
  { level: 18, xpRequired: 2500001 },
  { level: 19, xpRequired: 2750001 },
  { level: 20, xpRequired: 3000001 }
]

const oneE_paladin: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2751 },
  { level: 3, xpRequired: 5501 },
  { level: 4, xpRequired: 12001 },
  { level: 5, xpRequired: 24001 },
  { level: 6, xpRequired: 45001 },
  { level: 7, xpRequired: 95001 },
  { level: 8, xpRequired: 175001 },
  { level: 9, xpRequired: 350001 },
  { level: 10, xpRequired: 700001 },
  { level: 11, xpRequired: 1050001 },
  // +350,000 per level
  { level: 12, xpRequired: 1400001 },
  { level: 13, xpRequired: 1750001 },
  { level: 14, xpRequired: 2100001 },
  { level: 15, xpRequired: 2450001 },
  { level: 16, xpRequired: 2800001 },
  { level: 17, xpRequired: 3150001 },
  { level: 18, xpRequired: 3500001 },
  { level: 19, xpRequired: 3850001 },
  { level: 20, xpRequired: 4200001 }
]

const oneE_ranger: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2251 },
  { level: 3, xpRequired: 4501 },
  { level: 4, xpRequired: 10001 },
  { level: 5, xpRequired: 20001 },
  { level: 6, xpRequired: 40001 },
  { level: 7, xpRequired: 90001 },
  { level: 8, xpRequired: 150001 },
  { level: 9, xpRequired: 225001 },
  { level: 10, xpRequired: 325001 },
  { level: 11, xpRequired: 650001 },
  // +325,000 per level
  { level: 12, xpRequired: 975001 },
  { level: 13, xpRequired: 1300001 },
  { level: 14, xpRequired: 1625001 },
  { level: 15, xpRequired: 1950001 },
  { level: 16, xpRequired: 2275001 },
  { level: 17, xpRequired: 2600001 },
  { level: 18, xpRequired: 2925001 },
  { level: 19, xpRequired: 3250001 },
  { level: 20, xpRequired: 3575001 }
]

const oneE_wizard: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2501 },
  { level: 3, xpRequired: 5001 },
  { level: 4, xpRequired: 10001 },
  { level: 5, xpRequired: 22501 },
  { level: 6, xpRequired: 40001 },
  { level: 7, xpRequired: 60001 },
  { level: 8, xpRequired: 90001 },
  { level: 9, xpRequired: 135001 },
  { level: 10, xpRequired: 250001 },
  { level: 11, xpRequired: 375001 },
  // +375,000 per level
  { level: 12, xpRequired: 750001 },
  { level: 13, xpRequired: 1125001 },
  { level: 14, xpRequired: 1500001 },
  { level: 15, xpRequired: 1875001 },
  { level: 16, xpRequired: 2250001 },
  { level: 17, xpRequired: 2625001 },
  { level: 18, xpRequired: 3000001 }
]

const oneE_cleric: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1501 },
  { level: 3, xpRequired: 3001 },
  { level: 4, xpRequired: 6001 },
  { level: 5, xpRequired: 13001 },
  { level: 6, xpRequired: 27501 },
  { level: 7, xpRequired: 55001 },
  { level: 8, xpRequired: 110001 },
  { level: 9, xpRequired: 225001 },
  { level: 10, xpRequired: 450001 },
  { level: 11, xpRequired: 675001 },
  // +225,000 per level
  { level: 12, xpRequired: 900001 },
  { level: 13, xpRequired: 1125001 },
  { level: 14, xpRequired: 1350001 },
  { level: 15, xpRequired: 1575001 },
  { level: 16, xpRequired: 1800001 },
  { level: 17, xpRequired: 2025001 },
  { level: 18, xpRequired: 2250001 },
  { level: 19, xpRequired: 2475001 },
  { level: 20, xpRequired: 2700001 }
]

const oneE_druid: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2001 },
  { level: 3, xpRequired: 4001 },
  { level: 4, xpRequired: 7501 },
  { level: 5, xpRequired: 12501 },
  { level: 6, xpRequired: 20001 },
  { level: 7, xpRequired: 35001 },
  { level: 8, xpRequired: 60001 },
  { level: 9, xpRequired: 90001 },
  { level: 10, xpRequired: 125001 },
  { level: 11, xpRequired: 200001 },
  { level: 12, xpRequired: 300001 },
  { level: 13, xpRequired: 750001 },
  { level: 14, xpRequired: 1500001 }
]

const oneE_thief: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1251 },
  { level: 3, xpRequired: 2501 },
  { level: 4, xpRequired: 5001 },
  { level: 5, xpRequired: 10001 },
  { level: 6, xpRequired: 20001 },
  { level: 7, xpRequired: 42501 },
  { level: 8, xpRequired: 70001 },
  { level: 9, xpRequired: 110001 },
  { level: 10, xpRequired: 160001 },
  // +220,000 per level
  { level: 11, xpRequired: 380001 },
  { level: 12, xpRequired: 600001 },
  { level: 13, xpRequired: 820001 },
  { level: 14, xpRequired: 1040001 },
  { level: 15, xpRequired: 1260001 },
  { level: 16, xpRequired: 1480001 },
  { level: 17, xpRequired: 1700001 },
  { level: 18, xpRequired: 1920001 },
  { level: 19, xpRequired: 2140001 },
  { level: 20, xpRequired: 2360001 }
]

const oneE_monk: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2251 },
  { level: 3, xpRequired: 4751 },
  { level: 4, xpRequired: 10001 },
  { level: 5, xpRequired: 22501 },
  { level: 6, xpRequired: 47501 },
  { level: 7, xpRequired: 98001 },
  { level: 8, xpRequired: 200001 },
  { level: 9, xpRequired: 350001 },
  { level: 10, xpRequired: 500001 },
  { level: 11, xpRequired: 700001 },
  { level: 12, xpRequired: 950001 },
  { level: 13, xpRequired: 1250001 },
  { level: 14, xpRequired: 1750001 },
  { level: 15, xpRequired: 2250001 },
  { level: 16, xpRequired: 2750001 },
  { level: 17, xpRequired: 3250001 }
]

const oneE_bard: LevelProgression[] = [
  // 1e Bard is complex (must multiclass Fighter→Thief→Bard).
  // These are the Bard-class levels once the character qualifies.
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2001 },
  { level: 3, xpRequired: 4001 },
  { level: 4, xpRequired: 8001 },
  { level: 5, xpRequired: 16001 },
  { level: 6, xpRequired: 25001 },
  { level: 7, xpRequired: 40001 },
  { level: 8, xpRequired: 60001 },
  { level: 9, xpRequired: 90001 },
  { level: 10, xpRequired: 125001 },
  // +250,000 per level
  { level: 11, xpRequired: 375001 },
  { level: 12, xpRequired: 625001 },
  { level: 13, xpRequired: 875001 },
  { level: 14, xpRequired: 1125001 },
  { level: 15, xpRequired: 1375001 }
]

const oneEClassExperience: Record<string, LevelProgression[]> = {
  fighter:  oneE_fighter,
  paladin:  oneE_paladin,
  ranger:   oneE_ranger,
  wizard:   oneE_wizard,    // "magic-user" resolves to "wizard"
  cleric:   oneE_cleric,
  druid:    oneE_druid,
  thief:    oneE_thief,
  monk:     oneE_monk,
  bard:     oneE_bard
}

// ---------------------------------------------------------------------------
// Basic-era XP tables (OD&D, Holmes Basic, B/X, BECMI)
// ---------------------------------------------------------------------------
//
// All Basic-era editions share nearly identical XP tables.  The subtle
// differences (e.g. Holmes caps at level 3, B/X caps at 14, BECMI goes
// to 36) are handled via Edition.progression.maxLevel — the raw XP
// values are the same across these editions.
//
// Race-as-class characters (Dwarf, Elf, Halfling) use the Fighter table
// in our system since they map to the "fighter" canonical class.

const basic_fighter: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2000 },
  { level: 3, xpRequired: 4000 },
  { level: 4, xpRequired: 8000 },
  { level: 5, xpRequired: 16000 },
  { level: 6, xpRequired: 32000 },
  { level: 7, xpRequired: 64000 },
  { level: 8, xpRequired: 120000 },
  { level: 9, xpRequired: 240000 },
  // After name level: +120,000 per level
  { level: 10, xpRequired: 360000 },
  { level: 11, xpRequired: 480000 },
  { level: 12, xpRequired: 600000 },
  { level: 13, xpRequired: 720000 },
  { level: 14, xpRequired: 840000 }
]

const basic_cleric: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1500 },
  { level: 3, xpRequired: 3000 },
  { level: 4, xpRequired: 6000 },
  { level: 5, xpRequired: 12000 },
  { level: 6, xpRequired: 25000 },
  { level: 7, xpRequired: 50000 },
  { level: 8, xpRequired: 100000 },
  { level: 9, xpRequired: 200000 },
  // After name level: +100,000 per level
  { level: 10, xpRequired: 300000 },
  { level: 11, xpRequired: 400000 },
  { level: 12, xpRequired: 500000 },
  { level: 13, xpRequired: 600000 },
  { level: 14, xpRequired: 700000 }
]

const basic_wizard: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 2500 },
  { level: 3, xpRequired: 5000 },
  { level: 4, xpRequired: 10000 },
  { level: 5, xpRequired: 20000 },
  { level: 6, xpRequired: 40000 },
  { level: 7, xpRequired: 80000 },
  { level: 8, xpRequired: 150000 },
  { level: 9, xpRequired: 300000 },
  // After name level: +150,000 per level
  { level: 10, xpRequired: 450000 },
  { level: 11, xpRequired: 600000 },
  { level: 12, xpRequired: 750000 },
  { level: 13, xpRequired: 900000 },
  { level: 14, xpRequired: 1050000 }
]

const basic_thief: LevelProgression[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 1200 },
  { level: 3, xpRequired: 2400 },
  { level: 4, xpRequired: 4800 },
  { level: 5, xpRequired: 9600 },
  { level: 6, xpRequired: 20000 },
  { level: 7, xpRequired: 40000 },
  { level: 8, xpRequired: 80000 },
  { level: 9, xpRequired: 160000 },
  // After name level: +120,000 per level
  { level: 10, xpRequired: 280000 },
  { level: 11, xpRequired: 400000 },
  { level: 12, xpRequired: 520000 },
  { level: 13, xpRequired: 640000 },
  { level: 14, xpRequired: 760000 }
]

const basicClassExperience: Record<string, LevelProgression[]> = {
  fighter:  basic_fighter,
  cleric:   basic_cleric,
  wizard:   basic_wizard,   // "magicUser" / "magic-user" resolve to "wizard"
  thief:    basic_thief
}
export const editions: readonly Edition[] = [
  {
    id: '5e',
    name: '5th Edition',
    settings: [ 'forgottenRealms', 'dragonlance', 'lankhmar', 'ravenloft', 'spellJammer' ],
    alignments: standardAlignments,
    races: [
      ...advancedBasicRaces,
      'dragonborn',
      'tiefling'
    ],
    classes: [
      'artificer',
      'barbarian',
      'bard',
      'druid',
      'fighter',
      'monk',
      'ranger',
      'rogue',
      'sorcerer',
      'wizard'
    ],
    progression: {
      maxLevel: 20,
      experience: fiveEExperience
    },
    multiclassing: { allowed: true },
    equipmentRestrictions: {
      plateArmorMinLevel: 5,
      allowMagicItemsAtCreation: true
    },
    // Xanathar's Guide recommended magic item distribution by tier
    magicItemBudget: {
      maxAttunement: 3,
      tiers: [
        { levelRange: [1, 4],   maxRarity: 'uncommon',  permanentItems: 2,  consumableItems: 9 },
        { levelRange: [5, 10],  maxRarity: 'rare',      permanentItems: 6,  consumableItems: 28 },
        { levelRange: [11, 16], maxRarity: 'very-rare',  permanentItems: 6,  consumableItems: 24 },
        { levelRange: [17, 20], maxRarity: 'legendary',  permanentItems: 6,  consumableItems: 19 }
      ]
    }
  },
  {
    id: '4e',
    name: '4th edition',
    settings: [ 'forgottenRealms' ],
    alignments: fourEAlignments,  
    races: [
      ...basicRaces,
      'dragonborn',
      'eladrin',
      'tiefling'
    ],
    classes: [
      'cleric',
      'fighter',
      'paladin',
      'ranger',
      'rogue',
      'warlock',
      'warlord',
      'wizard'
    ],  
    multiclassing: { allowed: true, maxClasses: 2 },
    progression: {
      maxLevel: 30,
      experience: fourEExperience
    },
    // 4e: Items are gated by item level, not rarity.  The standard treasure
    // parcel gives one item of level+1, level, and level-1.  We approximate
    // this across tier ranges — the domain logic also checks enhancementLevel
    // on each item to enforce the per-level gate.
    magicItemBudget: {
      tiers: [
        { levelRange: [1, 4],   permanentItems: 3,  consumableItems: 4 },
        { levelRange: [5, 10],  permanentItems: 6,  consumableItems: 8 },
        { levelRange: [11, 16], permanentItems: 6,  consumableItems: 8 },
        { levelRange: [17, 20], permanentItems: 6,  consumableItems: 8 },
        { levelRange: [21, 25], permanentItems: 6,  consumableItems: 8 },
        { levelRange: [26, 30], permanentItems: 6,  consumableItems: 8 }
      ]
    }
  },
  {
    id: '3.5e',
    name: '3.5 edition',
    settings: [ 'darkSun', 'dragonlance', 'forgottenRealms', 'ravenloft' ],
    alignments: standardAlignments,
    races: advancedBasicRaces,
    classes: [
      "barbarian",
      "bard",
      "cleric",
      "druid",
      "fighter",
      "monk",
      "paladin",
      "ranger",
      "rogue",
      "sorcerer",
      "wizard"
    ],
    multiclassing: { allowed: true },
    progression: {
      maxLevel: 20,
      experience: threeEExperience
    },
    // 3.5e: Wealth by Level (DMG p135).  Magic items are purchased from the
    // character's total wealth budget.  maxItemValueGp caps any single item.
    magicItemBudget: {
      tiers: [
        { levelRange: [1, 4],   permanentItems: 2,  consumableItems: 4,  maxItemValueGp: 3000 },
        { levelRange: [5, 10],  permanentItems: 4,  consumableItems: 6,  maxItemValueGp: 25000 },
        { levelRange: [11, 16], permanentItems: 6,  consumableItems: 6,  maxItemValueGp: 100000 },
        { levelRange: [17, 20], permanentItems: 8,  consumableItems: 6,  maxItemValueGp: 200000 }
      ]
    }
  },
  {
    id: '3e',
    name: '3rd edition',
    settings: [ 'darkSun', 'dragonlance', 'forgottenRealms', 'ravenloft' ],
    alignments: standardAlignments,
    races: advancedBasicRaces,
    classes: [
      "barbarian",
      "bard",
      "cleric",
      "druid",
      "fighter",
      "monk",
      "paladin",
      "ranger",
      "rogue",
      "sorcerer",
      "wizard"
    ],  
    multiclassing: { allowed: true },
    progression: {
      maxLevel: 20,
      experience: threeEExperience
    },
    // 3e uses the same Wealth by Level system as 3.5e
    magicItemBudget: {
      tiers: [
        { levelRange: [1, 4],   permanentItems: 2,  consumableItems: 4,  maxItemValueGp: 3000 },
        { levelRange: [5, 10],  permanentItems: 4,  consumableItems: 6,  maxItemValueGp: 25000 },
        { levelRange: [11, 16], permanentItems: 6,  consumableItems: 6,  maxItemValueGp: 100000 },
        { levelRange: [17, 20], permanentItems: 8,  consumableItems: 6,  maxItemValueGp: 200000 }
      ]
    }
  },
  {
    id: '2e',
    name: '2nd edition - AD&D',
    settings: [ 'alQadim', 'darkSun', 'dragonlance', 'greyhawk', 'forgottenRealms', 'hollowWorld', 'lankhmar', 'mystara', 'planescape', 'ravenloft', 'spellJammer' ],
    alignments: standardAlignments,
    races: advancedBasicRaces,
    // "mage" resolved to "wizard" via classAliases
    classes: [
      "fighter",
      "paladin",
      "ranger",
      "mage",
      // "specialist wizard",
      "cleric",
      "druid",
      "thief",
      "bard"
    ],
    multiclassing: { allowed: true, maxClasses: 3 },
    progression: {
      maxLevel: 20,
      classExperience: twoEClassExperience
    },
    proficiencies: [
      { id: 'agriculture', name: 'Agriculture', relevantStatId: 'intelligence', checkModifier: 0 },
      { id: 'carpentry', name: 'Carpentry', relevantStatId: 'strength', checkModifier: 0 },
      { id: 'cooking', name: 'Cooking', relevantStatId: 'intelligence', checkModifier: 0 },
      { id: 'directionSense', name: 'Direction Sense', relevantStatId: 'wisdom', checkModifier: 1 },
      { id: 'fishing', name: 'Fishing', relevantStatId: 'wisdom', checkModifier: -1 },
      { id: 'ridingLandBased', name: 'Riding, Land-based', relevantStatId: 'wisdom', checkModifier: 3 },
      { id: 'swimming', name: 'Swimming', relevantStatId: 'strength', checkModifier: 0 },
      { id: 'weatherSense', name: 'Weather Sense', relevantStatId: 'wisdom', checkModifier: -1 }
    ]
  },
  {
    id: '1e',
    name: '1st edition - AD&D',
    settings: [ 'dragonlance', 'greyhawk', 'forgottenRealms', 'lankhmar', 'mystara', 'ravenloft'],
    alignments: standardAlignments,
    races: advancedBasicRaces,
    // "magicUser" resolved to "wizard" via classAliases
    classes: [
      "cleric",
      "druid",
      "fighter",
      "paladin",
      "ranger",
      "magic-user",   // resolved to "wizard" via classAliases
      "illusionist",  // TODO: no catalog entry yet
      "thief",
      "assassin",     // TODO: no catalog entry yet
      "monk",
      "bard"
    ],
    multiclassing: { allowed: true, maxClasses: 3 },
    progression: {
      maxLevel: 20,
      classExperience: oneEClassExperience
    }
  },
  {
    id: 'becmi',
    name: 'BECMI', // Basic, Expert, Companion, Master, Immortal
    settings: [ 'mystara'],
    alignments: basicAlignments,
    races: basicRaces,
    classes: [
      "cleric",
      "fighter",
      "magicUser",
      "thief",
      // TODO: Race as class
      // "dwarf",
      // "elf",
      // "halfling"
      // TODO: Handle later
      // "mystic"
    ],
    progression: {
      maxLevel: 36,
      classExperience: basicClassExperience
    }
  },
  {
    id: 'bx',
    name: 'Basic, Expert',
    settings: [ 'mystara'],
    alignments: basicAlignments,
    races: basicRaces,
    classes: [
      "cleric",
      "fighter",
      "magicUser",
      "thief",
      // TODO: Race as class
      // "dwarf",
      // "elf",
      // "halfling"
      // TODO: Handle later
      // "mystic"
    ],
    progression: {
      maxLevel: 14,
      classExperience: basicClassExperience
    }
  },
  {
    id: 'b',
    name: 'Basic (Holmes)',
    settings: [ 'mystara'],
    alignments: basicAlignments,
    races: basicRaces,
    classes: [
      "cleric",
      "fighter",
      "magic-user",   // resolved to "wizard" via classAliases
      "thief",
      // Race-as-class: demihumans restricted to Fighter via class requirements
    ],
    progression: {
      maxLevel: 3,
      classExperience: basicClassExperience
    }
  },
  {
    id: 'odd',
    name: 'OD&D',
    settings: [ 'mystara'],
    alignments: basicAlignments,
    races: basicRaces,
    // Class IDs resolved via classAliases: "fighting-man" → "fighter", "magic-user" → "wizard"
    classes: [
      "fighting-man",
      "magic-user",
      "cleric",
      "thief",
      // TODO: Introduced later
      // "paladin",
      // "monk",
      // "assassin",
      // "druid"
    ],
    progression: {
      maxLevel: 14,
      classExperience: basicClassExperience
    }
  }
] as const;


 export type EditionType = keyof typeof editions
