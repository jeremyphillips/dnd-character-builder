/**
 * Form picker values ↔ `LocationEntityRef` (building owner/staff).
 * Encoded as `"character:<id>"` / `"npc:<id>"` for OptionPickerField.
 */
import type { CharacterDoc } from '@/features/character/domain/types';
import type { LocationEntityRef } from '@/shared/domain/locations';
import type { PickerOption } from '@/ui/patterns/form/OptionPickerField';

export function encodeLocationEntityRef(ref: LocationEntityRef): string {
  return `${ref.kind}:${ref.id}`;
}

export function decodeLocationEntityRef(value: string): LocationEntityRef | null {
  const idx = value.indexOf(':');
  if (idx <= 0) return null;
  const kind = value.slice(0, idx) as LocationEntityRef['kind'];
  const id = value.slice(idx + 1);
  if (!id) return null;
  if (kind !== 'npc' && kind !== 'character') return null;
  return { kind, id };
}

export function characterRefsToPickerValues(refs: LocationEntityRef[] | undefined): string[] {
  return (refs ?? []).map(encodeLocationEntityRef);
}

export function pickerValuesToCharacterRefs(values: string[]): LocationEntityRef[] {
  const out: LocationEntityRef[] = [];
  for (const v of values) {
    const r = decodeLocationEntityRef(v);
    if (r) out.push(r);
  }
  return out;
}

function characterDocId(c: CharacterDoc): string {
  const raw = c._id as string | { toString(): string };
  return typeof raw === 'string' ? raw : raw.toString();
}

/** Picker options for all campaign-user characters (PC + NPC) from `CharacterDoc[]`. */
export function buildCharacterEntityPickerOptions(characters: CharacterDoc[]): PickerOption[] {
  const opts = characters.map((c) => {
    const id = characterDocId(c);
    const isNpc = c.type === 'npc';
    const kind: LocationEntityRef['kind'] = isNpc ? 'npc' : 'character';
    return {
      value: encodeLocationEntityRef({ kind, id }),
      label: c.name,
      description: isNpc ? 'NPC' : 'Player character',
    } satisfies PickerOption;
  });
  return opts.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}
