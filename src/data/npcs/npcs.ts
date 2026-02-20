import { npcsLankhmar } from "./npcs.lankhmar"
import { npcs5eBase } from "./npcs.npcs5eBase"
import type { Character } from "@/shared/types"

export const npcs: readonly Character[] = [
  ...npcsLankhmar,
  ...npcs5eBase
] as const