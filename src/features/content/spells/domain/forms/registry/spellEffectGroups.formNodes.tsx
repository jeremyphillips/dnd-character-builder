import type { CustomFormNodeSpec } from '@/features/content/shared/forms/registry/formNodeSpec.types';
import type { Spell, SpellInput } from '@/features/content/spells/domain/types';
import type { SpellFormValues } from '../types/spellForm.types';
import { SpellEffectPayloadFields } from '../components/SpellEffectPayloadFields';

export const spellEffectPayloadFormNode: CustomFormNodeSpec<
  SpellFormValues,
  SpellInput & Record<string, unknown>,
  Spell & Record<string, unknown>
> = {
  kind: 'custom',
  key: 'spellEffectPayload',
  render: (ctx) => (
    <SpellEffectPayloadFields namePrefix={ctx.rowPrefix} patchDriver={ctx.patchDriver} />
  ),
};
