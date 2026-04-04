---
name: Hex edge support / constraint
overview: Resolve the hex-edge ambiguity in the location editor. Audit current hex edge storage/rendering/authoring behavior, choose an explicit product path (full support now vs explicit constrained support), preserve stored data, and ensure users cannot end up with silently invisible authored hex edge data.
todos:
  - id: audit-current-hex-edge-behavior
    content: Trace current hex edge storage, load, render, hit-testing, selection, and authoring behavior; identify where square-edge assumptions break hex visibility/editing
    status: pending
  - id: choose-product-path
    content: Make an explicit decision — first-class hex edge support now, or constrained/guarded support until complete
    status: pending
  - id: implement-supported-or-constrained-path
    content: Implement the chosen path cleanly so hex edge data is either visible/editable or explicitly constrained without silent disappearance
    status: pending
  - id: preserve-data-integrity
    content: Ensure existing stored hex edge data is preserved and surfaced safely; no DB migration or silent dropping
    status: pending
  - id: tests-and-docs
    content: Add focused tests and document the current hex edge support level and constraints
    status: pending
isProject: true
---

# Hex edge support / constraint

**Parent context:** The location workspace dirty/save architecture has been stabilized, persistable slice participation has been hardened, and normalization policy has been documented. This pass is **not** about dirty state; it is about a remaining map-editor/product integrity gap: **hex edges**.

**Reference:** [docs/reference/location-workspace.md](../../../docs/reference/location-workspace.md) (e.g. **Open issues §1 — Hex maps: no edge overlay**).

## Problem

Hex maps appear to be in an ambiguous middle state:

- edge data may exist for hex geometry
- square-edge assumptions may still dominate overlay/rendering/interaction
- stored hex edge data may become invisible or not meaningfully editable

That is worse than either:

- fully supporting hex edges, or
- explicitly not supporting them yet

because it creates the risk of **silent invisible authored data**.

## Objective

Resolve hex edge behavior explicitly by choosing and implementing **one** of these product paths:

### Option A — first-class hex edge support now

Support hex edges as real editor entities:

- visible overlays
- correct geometry
- hit-testing
- selection/editing
- authored data rendering parity where appropriate

### Option B — explicit constrained support

If full support is too large for this pass:

- do **not** leave hex edge data silently invisible
- surface existing stored hex edge data in a safe fallback way if feasible
- prevent or gate unsupported hex edge authoring/editing flows
- make current limitations explicit in editor behavior and docs

Do **not** leave the editor in a half-supported state where hex edge data can exist but users cannot reliably see or manage it.

## Core principle

Prefer an **explicit support boundary** over ambiguous partial behavior.

The editor must make one of these truths clear:

- “hex edges are supported here”
- or “hex edges are not yet fully supported here, and the editor is protecting you accordingly”

## Constraints

- No DB migration
- No schema rename
- Preserve existing stored edge data
- Keep square-grid edge behavior intact
- Do not broaden into unrelated map-editor redesign
- Do not conflate this with dirty/save architecture work
- Prefer clarity and data integrity over partial hidden support

## Required decision

Before implementation, make and document an explicit decision between:

### A. Support hex edges properly in this pass

Choose this only if the geometry/rendering/interaction model can be implemented coherently now.

**Minimum required outcome:**

- visible hex edge overlays
- correct edge hit-testing for hex cells
- reliable selection/editing behavior
- authored edge state is not silently lost or hidden

### B. Constrain hex edges explicitly in this pass

Choose this if full support is too large or too risky right now.

**Minimum required outcome:**

- users cannot create or rely on silently invisible hex edge state
- existing stored hex edge data is surfaced somehow if technically feasible, or explicitly warned about
- unsupported authoring flows are blocked/gated clearly
- docs/comments/UI state make the limitation explicit

Do not pick a vague middle ground.

## Implementation goals

### 1. Audit current hex edge behavior end-to-end

Trace current hex edge behavior across:

- data model / storage shape
- load / hydration path
- render / overlay path
- hit-testing / placement path
- selection / inspector path
- save / persistence round-trip as relevant

Identify specifically:

- whether stored hex edge data can already exist in real content
- where square-edge assumptions break on hex maps
- whether the current failure mode is:
  - invisible render
  - no hit targets
  - partial inspector support
  - partial save-only support
  - another mismatch

**Deliverable:** concise summary of the actual current hex edge failure mode(s).

### 2. Define the supported product contract

Write down the intended editor behavior for hex maps after this pass.

Examples:

- Are hex edges fully supported?
- If yes, what counts as a selectable/renderable edge?
- If not, how does the editor block or gate unsupported flows?
- How are existing stored hex edge records surfaced or protected?

This should be explicit enough that a contributor or QA pass can tell whether behavior matches the contract.

### 3. Implement the chosen path cleanly

#### If choosing full support

Implement hex edge behavior as a first-class geometry problem:

- visible edge overlay for hex cells
- centralized hex edge geometry logic
- correct hit-testing / hover / selection
- editing behavior consistent with supported square-edge behavior where appropriate

Do not solve hex edges as a fragile extension of square-edge assumptions.

#### If choosing constrained support

Implement safe product constraints:

- block or hide unsupported hex edge authoring tools where necessary
- surface existing stored hex edge data in a fallback/read-only/warned form if feasible
- prevent silent disappearance
- make limitations explicit in UI/docs or guardrails where appropriate

### 4. Preserve stored data integrity

Regardless of chosen path:

- do not mutate or drop stored hex edge data just because the editor lacks full support
- do not corrupt round-trip behavior
- if fallback visibility is needed, prefer that over hidden loss

### 5. Keep square behavior stable

This pass must not regress:

- square edge overlay rendering
- square edge hit-testing
- square authoring/editing flows

Hex work should remain geometry-aware and not destabilize the already-supported square path.

### 6. Document the support boundary

Update docs/reference notes so the current support level is explicit:

- full hex edge support
- or constrained/not-yet-supported status with protections

If the result is constrained support, make the limitation visible enough that future contributors do not assume hex edges are done.

## Design guidance

- Prefer explicit support boundaries over half-working hidden behavior
- Keep geometry/rendering logic centralized rather than scattered through UI components
- If supporting hex edges, model them as first-class hex geometry, not “square edges with exceptions”
- If constraining support, make the product limitation protective and honest, not merely hidden
- Optimize for user trust: no authored data should silently disappear

## Suggested deliverables

- audit of current hex edge behavior
- explicit product decision: full support now vs constrained support
- implementation of chosen path
- preservation of stored data integrity
- focused tests
- docs/reference update describing current support level

## Suggested tests

Add focused tests that prove the chosen support level:

### If supporting hex edges

- hex edge overlay renders for authored data
- hex edge hit-testing/selection works as intended
- square edge behavior remains unchanged
- stored hex edge data round-trips safely

### If constraining hex edges

- unsupported authoring is blocked or gated on hex maps
- existing stored hex edge data is not silently invisible without explanation
- square edge behavior remains unchanged
- stored data is preserved and not corrupted

Do not rely only on broad snapshot tests; add behavior-focused coverage.

## Acceptance criteria

This pass is complete when all of the following are true:

- hex edge behavior is explicit, not ambiguous
- users cannot end up with silently invisible authored hex edge data
- the editor either:
  - properly supports hex edge rendering/authoring
  - or clearly constrains unsupported hex-edge behavior
- existing stored data is preserved
- square edge behavior remains stable
- docs/tests reflect the chosen support boundary

## Non-goals

- no DB migration
- no schema rename
- no broad map-editor redesign
- no unrelated dirty/save architecture work
- no path-preview or hover-chrome work in this pass

## Related plans (this directory)

See [README.md](README.md).
