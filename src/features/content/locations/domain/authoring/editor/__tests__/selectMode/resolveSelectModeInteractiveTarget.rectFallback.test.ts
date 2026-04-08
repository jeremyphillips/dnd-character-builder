import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSelectModeInteractiveTarget } from '../../selectMode';

const emptyDraft = {
  objectsByCellId: {} as Record<string, { id: string }[] | undefined>,
  linkedLocationByCellId: {} as Record<string, string | undefined>,
  regionIdByCellId: {} as Record<string, string | undefined>,
  edgeEntries: [] as { kind: 'wall'; edgeId: string }[],
};

/**
 * Hex-style hit testing: `elementsFromPoint` returns only the gridcell button, not icon descendants.
 * Rect fallback must still resolve `[data-map-object-id]` / linked icons.
 */
describe('resolveSelectModeInteractiveTarget — DOM rect fallback (hex-style stack)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns object when pointer is over object icon rect but stack top is gridcell button', () => {
    const button = document.createElement('button');
    button.setAttribute('role', 'gridcell');
    button.setAttribute('data-cell-id', '5,5');
    const icon = document.createElement('span');
    icon.setAttribute('data-map-object-id', 'obj-hex');
    icon.setAttribute('data-map-object-cell-id', '5,5');
    button.appendChild(icon);
    document.body.appendChild(button);

    vi.spyOn(icon, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 130,
      bottom: 130,
      width: 30,
      height: 30,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    document.elementsFromPoint = vi.fn().mockReturnValue([button]) as typeof document.elementsFromPoint;

    const r = resolveSelectModeInteractiveTarget({
      targetElement: button,
      clientX: 115,
      clientY: 115,
      gx: 0,
      gy: 0,
      anchorCellId: '5,5',
      ...emptyDraft,
      objectsByCellId: {},
      pathPolys: [],
      edgeGeoms: null,
      edgeEntries: emptyDraft.edgeEntries,
      isHex: true,
    });

    expect(r).toEqual({ type: 'object', cellId: '5,5', objectId: 'obj-hex' });
  });

  it('returns linked cell when pointer is over linked icon rect but stack top is gridcell button', () => {
    const button = document.createElement('button');
    button.setAttribute('role', 'gridcell');
    button.setAttribute('data-cell-id', '10,2');
    const linked = document.createElement('span');
    linked.setAttribute('data-map-linked-cell', '10,2');
    button.appendChild(linked);
    document.body.appendChild(button);

    vi.spyOn(linked, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      top: 200,
      right: 230,
      bottom: 230,
      width: 30,
      height: 30,
      x: 200,
      y: 200,
      toJSON: () => {},
    });

    document.elementsFromPoint = vi.fn().mockReturnValue([button]) as typeof document.elementsFromPoint;

    const r = resolveSelectModeInteractiveTarget({
      targetElement: button,
      clientX: 215,
      clientY: 215,
      gx: 0,
      gy: 0,
      anchorCellId: '10,2',
      ...emptyDraft,
      objectsByCellId: {},
      pathPolys: [],
      edgeGeoms: null,
      edgeEntries: emptyDraft.edgeEntries,
      isHex: true,
    });

    expect(r).toEqual({ type: 'cell', cellId: '10,2' });
  });

  it('rect fallback still works when elementsFromPoint top is not the gridcell (e.g. grid wrapper)', () => {
    const wrapper = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('role', 'gridcell');
    button.setAttribute('data-cell-id', '7,7');
    const icon = document.createElement('span');
    icon.setAttribute('data-map-object-id', 'obj-wrap');
    icon.setAttribute('data-map-object-cell-id', '7,7');
    button.appendChild(icon);
    document.body.appendChild(button);

    vi.spyOn(icon, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 50,
      right: 80,
      bottom: 80,
      width: 30,
      height: 30,
      x: 50,
      y: 50,
      toJSON: () => {},
    });

    document.elementsFromPoint = vi.fn().mockReturnValue([wrapper]) as typeof document.elementsFromPoint;

    const r = resolveSelectModeInteractiveTarget({
      targetElement: wrapper,
      clientX: 60,
      clientY: 60,
      gx: 0,
      gy: 0,
      anchorCellId: '7,7',
      ...emptyDraft,
      objectsByCellId: {},
      pathPolys: [],
      edgeGeoms: null,
      edgeEntries: emptyDraft.edgeEntries,
      isHex: true,
    });

    expect(r).toEqual({ type: 'object', cellId: '7,7', objectId: 'obj-wrap' });
  });

  it('rect fallback resolves gridcell via role=grid from stack (matches runtime stack order)', () => {
    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    const button = document.createElement('button');
    button.setAttribute('role', 'gridcell');
    button.setAttribute('data-cell-id', '3,3');
    const icon = document.createElement('span');
    icon.setAttribute('data-map-object-id', 'obj-scoped');
    icon.setAttribute('data-map-object-cell-id', '3,3');
    button.appendChild(icon);
    grid.appendChild(button);
    document.body.appendChild(grid);

    vi.spyOn(icon, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      right: 40,
      bottom: 40,
      width: 30,
      height: 30,
      x: 10,
      y: 10,
      toJSON: () => {},
    });

    document.elementsFromPoint = vi.fn().mockReturnValue([grid]) as typeof document.elementsFromPoint;

    const r = resolveSelectModeInteractiveTarget({
      targetElement: grid,
      clientX: 20,
      clientY: 20,
      gx: 0,
      gy: 0,
      anchorCellId: '3,3',
      ...emptyDraft,
      objectsByCellId: {},
      pathPolys: [],
      edgeGeoms: null,
      edgeEntries: emptyDraft.edgeEntries,
      isHex: true,
    });

    expect(r).toEqual({ type: 'object', cellId: '3,3', objectId: 'obj-scoped' });
  });

  it('grid-wide rect picks object when SVG path is top of stack (closest from SVG never reaches icon)', () => {
    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    const button = document.createElement('button');
    button.setAttribute('role', 'gridcell');
    button.setAttribute('data-cell-id', '10,2');
    const icon = document.createElement('span');
    icon.setAttribute('data-map-object-id', 'obj-svg');
    icon.setAttribute('data-map-object-cell-id', '10,2');
    button.appendChild(icon);
    grid.appendChild(button);
    document.body.appendChild(grid);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    vi.spyOn(icon, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 130,
      bottom: 130,
      width: 30,
      height: 30,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    document.elementsFromPoint = vi.fn().mockReturnValue([path, grid, button, icon]) as typeof document.elementsFromPoint;

    const r = resolveSelectModeInteractiveTarget({
      targetElement: null,
      clientX: 115,
      clientY: 115,
      gx: 0,
      gy: 0,
      anchorCellId: '10,2',
      ...emptyDraft,
      objectsByCellId: {},
      pathPolys: [],
      edgeGeoms: null,
      edgeEntries: emptyDraft.edgeEntries,
      isHex: true,
    });

    expect(r).toEqual({ type: 'object', cellId: '10,2', objectId: 'obj-svg' });
  });
});
