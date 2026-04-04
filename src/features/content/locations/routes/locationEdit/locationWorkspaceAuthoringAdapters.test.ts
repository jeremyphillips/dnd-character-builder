import { describe, expect, it } from 'vitest';

import { INITIAL_LOCATION_GRID_DRAFT } from '@/features/content/locations/components/locationGridDraft.types';
import { LOCATION_FORM_DEFAULTS } from '@/features/content/locations/domain';
import type { LocationContentItem } from '@/features/content/locations/domain/repo/locationRepo';

import {
  buildHomebrewLocationWorkspaceAuthoringContract,
  buildSystemLocationWorkspaceAuthoringContract,
  getSystemPatchWorkspaceSaveGate,
} from './locationWorkspaceAuthoringAdapters';

describe('buildHomebrewLocationWorkspaceAuthoringContract', () => {
  const loc = { source: 'campaign', scale: 'world' } as LocationContentItem;

  it('exposes homebrew mode and dirty when snapshot differs from baseline', () => {
    const baseline = '{"location":{},"map":{}}';
    const c = buildHomebrewLocationWorkspaceAuthoringContract({
      loc,
      activeFloorId: null,
      values: LOCATION_FORM_DEFAULTS,
      gridDraft: INITIAL_LOCATION_GRID_DRAFT,
      buildingStairConnections: [],
      workspacePersistBaseline: baseline,
    });
    expect(c.mode).toBe('homebrew');
    expect(typeof c.draftProjection).toBe('string');
    expect(c.draftProjection).not.toBe(baseline);
    expect(c.isDirty).toBe(true);
    expect(c.persistedBaselineProjection).toBe(baseline);
  });

  it('is not dirty when baseline is not yet established', () => {
    const c = buildHomebrewLocationWorkspaceAuthoringContract({
      loc,
      activeFloorId: null,
      values: LOCATION_FORM_DEFAULTS,
      gridDraft: INITIAL_LOCATION_GRID_DRAFT,
      buildingStairConnections: [],
      workspacePersistBaseline: null,
    });
    expect(c.isDirty).toBe(false);
  });
});

describe('buildSystemLocationWorkspaceAuthoringContract', () => {
  const validationOk = { current: { validateAll: () => true } };
  const validationFail = { current: { validateAll: () => false } };

  it('exposes system mode and combined dirty flags', () => {
    const c = buildSystemLocationWorkspaceAuthoringContract({
      isPatchDriverDirty: false,
      isGridDraftDirty: true,
      patchDocument: {},
      patchBaseline: {},
      gridDraft: INITIAL_LOCATION_GRID_DRAFT,
      gridDraftBaseline: structuredClone(INITIAL_LOCATION_GRID_DRAFT),
      validationApiRef: validationOk,
    });
    expect(c.mode).toBe('system');
    expect(c.isDirty).toBe(true);
    expect(c.canSave).toBe(true);
    expect(c.saveBlockReason).toBeNull();
    expect(typeof c.draftProjection).toBe('string');
    expect(typeof c.persistedBaselineProjection).toBe('string');
  });

  it('blocks save when patch form validation fails', () => {
    const c = buildSystemLocationWorkspaceAuthoringContract({
      isPatchDriverDirty: true,
      isGridDraftDirty: false,
      patchDocument: { x: 1 },
      patchBaseline: {},
      gridDraft: INITIAL_LOCATION_GRID_DRAFT,
      gridDraftBaseline: structuredClone(INITIAL_LOCATION_GRID_DRAFT),
      validationApiRef: validationFail,
    });
    expect(c.canSave).toBe(false);
    expect(c.saveBlockReason).toMatch(/validation/i);
  });
});

describe('getSystemPatchWorkspaceSaveGate', () => {
  it('matches validateAll', () => {
    const ok = getSystemPatchWorkspaceSaveGate({
      current: { validateAll: () => true },
    });
    expect(ok.canSave).toBe(true);
    expect(ok.saveBlockReason).toBeNull();

    const bad = getSystemPatchWorkspaceSaveGate({
      current: { validateAll: () => false },
    });
    expect(bad.canSave).toBe(false);
    expect(bad.saveBlockReason).not.toBeNull();
  });

  it('treats missing validation api as saveable', () => {
    const v = getSystemPatchWorkspaceSaveGate({ current: null });
    expect(v.canSave).toBe(true);
  });
});
