export const ABILITIES = [
  { id: 'str', name: 'Strength', key: 'strength' },
  { id: 'dex', name: 'Dexterity', key: 'dexterity' },
  { id: 'con', name: 'Constitution', key: 'constitution' },
  { id: 'int', name: 'Intelligence', key: 'intelligence' },
  { id: 'wis', name: 'Wisdom', key: 'wisdom' },
  { id: 'cha', name: 'Charisma', key: 'charisma' },
] as const;

export const ABILITY_NAMES = ABILITIES.map(ability => ability.name);
export const ABILITY_IDS = ABILITIES.map(ability => ability.id);
export const ABILITY_KEYS = ABILITIES.map(ability => ability.key);
