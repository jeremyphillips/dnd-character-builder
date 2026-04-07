// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { resolveFamilyVariant, type FamilyWithVariants } from './familyVariantResolve';

describe('resolveFamilyVariant', () => {
  const family: FamilyWithVariants<{ label: string }> = {
    defaultVariantId: 'a',
    variants: {
      a: { label: 'Alpha' },
      b: { label: 'Bravo' },
    },
  };

  it('returns requested variant when id is a valid key', () => {
    const r = resolveFamilyVariant(family, 'b');
    expect(r.resolvedVariantId).toBe('b');
    expect(r.variant).toEqual({ label: 'Bravo' });
  });

  it('falls back to defaultVariantId when requested id is invalid', () => {
    const r = resolveFamilyVariant(family, 'nope');
    expect(r.resolvedVariantId).toBe('a');
    expect(r.variant).toEqual({ label: 'Alpha' });
  });

  it('falls back to defaultVariantId when requested id is null or undefined', () => {
    expect(resolveFamilyVariant(family, null).resolvedVariantId).toBe('a');
    expect(resolveFamilyVariant(family, undefined).resolvedVariantId).toBe('a');
  });

  it('treats whitespace-prefixed ids as invalid keys (no trim)', () => {
    const r = resolveFamilyVariant(family, ' b');
    expect(r.resolvedVariantId).toBe('a');
    expect(r.variant.label).toBe('Alpha');
  });
});
