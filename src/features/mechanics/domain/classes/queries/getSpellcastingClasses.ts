import type { CharacterClass } from '@/data/classes.types'; 

export function getSpellcastingClasses(classCatalog: CharacterClass[]): CharacterClass[] {
  return classCatalog.filter(
    c => c.progression.spellcasting !== 'none'
  );
}
