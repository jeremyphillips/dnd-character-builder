/**
 * @deprecated Use @/features/content/classes/domain/forms instead.
 * Class form exports have moved to the content classes area.
 */
export type { ClassFormValues, ClassInput } from '@/features/content/classes/domain/forms/types/classForm.types';
export {
  getClassFieldConfigs,
  CLASS_FORM_DEFAULTS,
  type GetClassFieldConfigsOptions,
} from '@/features/content/classes/domain/forms/config/classForm.config';
export { classToFormValues, toClassInput } from '@/features/content/classes/domain/forms/mappers/classForm.mappers';
export { CLASS_DETAIL_SPECS, type ClassDetailCtx } from '@/features/content/classes/domain/details/classDetail.spec';
