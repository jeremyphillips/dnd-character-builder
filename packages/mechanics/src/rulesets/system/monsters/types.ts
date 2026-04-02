import type { MonsterFields } from '@/features/content/monsters/domain/types'

/** System ruleset catalog row before `toSystemMonster` adds `source` / `systemId`. */
export type MonsterCatalogEntry = MonsterFields
