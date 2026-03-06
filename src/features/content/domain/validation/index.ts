/**
 * Content change validation (delete/disallow).
 *
 * Validates whether content can be deleted or disabled based on
 * character references in the campaign.
 */
export {
  validateCharacterReferenceChange,
  type ChangeValidationResult,
  type CharacterReferenceMode,
  type CharacterReferenceLike,
  type CharacterReferenceMatcher,
} from './validateCharacterReferenceChange';
export { buildBlockedMessage, type ValidationMode } from './validationMessage';
export { validateArmorChange, type ArmorValidationMode } from './validateArmorChange';
export { validateClassChange, type ClassValidationMode } from './validateClassChange';
export { validateGearChange, type GearValidationMode } from './validateGearChange';
export {
  validateMagicItemChange,
  type MagicItemValidationMode,
} from './validateMagicItemChange';
export { validateRaceChange, type RaceValidationMode } from './validateRaceChange';
export {
  validateSkillProficiencyChange,
  type SkillProficiencyValidationMode,
} from './validateSkillProficiencyChange';
export { validateSpellChange, type SpellValidationMode } from './validateSpellChange';
export { validateWeaponChange, type WeaponValidationMode } from './validateWeaponChange';
