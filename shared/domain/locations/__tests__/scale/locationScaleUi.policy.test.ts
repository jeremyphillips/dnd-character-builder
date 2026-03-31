// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  isCampaignLocationListScale,
  isInteriorLocationScale,
  isStandaloneCreateLocationScale,
} from '../../scale/locationScaleUi.policy';

describe('locationScaleUi.policy', () => {
  it('marks floor/room as interior', () => {
    expect(isInteriorLocationScale('floor')).toBe(true);
    expect(isInteriorLocationScale('room')).toBe(true);
    expect(isInteriorLocationScale('building')).toBe(false);
  });

  it('standalone create is surface macro + building only', () => {
    expect(isStandaloneCreateLocationScale('building')).toBe(true);
    expect(isStandaloneCreateLocationScale('floor')).toBe(false);
    expect(isStandaloneCreateLocationScale('region')).toBe(false);
  });

  it('campaign list excludes interior only', () => {
    expect(isCampaignLocationListScale('building')).toBe(true);
    expect(isCampaignLocationListScale('floor')).toBe(false);
    expect(isCampaignLocationListScale('region')).toBe(true);
  });
});
