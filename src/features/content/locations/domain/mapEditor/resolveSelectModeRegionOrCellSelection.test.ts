import { describe, expect, it } from 'vitest';

import { resolveSelectModeRegionOrCellSelection } from './resolveSelectModeRegionOrCellSelection';

describe('resolveSelectModeRegionOrCellSelection', () => {
  it('returns region when cell has regionId', () => {
    expect(
      resolveSelectModeRegionOrCellSelection('1,1', { '1,1': 'reg-a', '2,2': 'reg-b' }),
    ).toEqual({ type: 'region', regionId: 'reg-a' });
  });

  it('returns cell when no region assignment', () => {
    expect(resolveSelectModeRegionOrCellSelection('0,0', {})).toEqual({ type: 'cell', cellId: '0,0' });
    expect(resolveSelectModeRegionOrCellSelection('0,0', { '1,1': 'x' })).toEqual({
      type: 'cell',
      cellId: '0,0',
    });
  });

  it('trims region id', () => {
    expect(resolveSelectModeRegionOrCellSelection('0,0', { '0,0': '  reg-x  ' })).toEqual({
      type: 'region',
      regionId: 'reg-x',
    });
  });

  it('treats empty trimmed region as cell selection', () => {
    expect(resolveSelectModeRegionOrCellSelection('0,0', { '0,0': '   ' })).toEqual({
      type: 'cell',
      cellId: '0,0',
    });
  });
});
