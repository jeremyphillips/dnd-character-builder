export type { WeaponFormValues } from './weaponForm.types';
export {
  getWeaponFieldConfigs,
  type GetWeaponFieldConfigsOptions,
} from './weaponForm.config';
export {
  weaponToFormValues,
  toWeaponInput,
  toOptionalNumber,
  trimOrNull,
} from './weaponForm.mappers';
export { WEAPON_DETAIL_SPECS, type WeaponDetailCtx } from './weaponDetail.spec';
