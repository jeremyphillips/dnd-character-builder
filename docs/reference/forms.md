# Forms architecture

This document describes how declarative and custom forms are structured in the app: **`AppForm`**, **`DynamicFormRenderer`**, **`ConditionalFormRenderer`**, and how UI styling is applied for consistent layouts.

---

## Principles

### Use primitives and patterns for field UI

- **`@/ui/primitives`** — Presentational controls only (for example **`AppTextField`**, **`AppSelect`**, **`AppCheckbox`**, **`AppRadioGroup`**, **`AppDateTimePicker`**, **`AppJsonPreviewField`**, **`AppImageUploadField`**). These components know nothing about react-hook-form; they are controlled via props (`value`, `onChange`, `label`, errors, and so on).
- **`@/ui/patterns/form`** — RHF adapters (names prefixed with **`AppForm…`**, for example **`AppFormTextField`**, **`AppFormSelect`**, **`AppFormActions`**) plus layout helpers (**`DynamicFormRenderer`**, **`ConditionalFormRenderer`**, **`AppForm`**).
- **Feature code** should compose forms from these modules. Avoid ad‑hoc MUI **`TextField`** / **`Select`** / raw **`<input>`** for product forms when an **`App*`** or **`AppForm*`** equivalent exists, so behavior and accessibility stay aligned.

Custom screens that are not driven by **`FieldConfig`** still wrap content in **`AppForm`** (or **`FormProvider`** + **`useForm`** when you need full control) and should use **`AppForm*`** field components or primitives plus **`Controller`** where appropriate.

---

## `AppForm`

**Path:** `src/ui/patterns/form/AppForm.tsx`

**Role:** Thin wrapper around **react-hook-form**’s **`useForm`** and **`FormProvider`**. It renders a native **`<form>`** with **`onSubmit={handleSubmit(onSubmit)}`**, default **`mode: 'onBlur'`**, and wraps children in MUI **`Stack`** (configurable **`spacing`**).

- Pass **`defaultValues`** and **`onSubmit`**.
- Children may be a **`ReactNode`** or a function **`(methods) => ReactNode`** to access **`UseFormReturn`** (for example to wire **`watch`** or **`setValue`**).
- Optional **`id`** on **`<form>`** so external buttons can use **`form={id}`** to submit.

**`DynamicFormRenderer`** / **`ConditionalFormRenderer`** assume a **`FormProvider`** ancestor; **`AppForm`** is the usual way to provide it.

---

## `DynamicFormRenderer`

**Path:** `src/ui/patterns/form/DynamicFormRenderer.tsx`

**Role:** Declarative renderer for a list of **`FormLayoutNode`** items (see **`form.types.ts`**). It maps each node to the correct field implementation:

- **Leaf fields** → **`DynamicField`** (react-hook-form / **`Controller`**-backed **`AppForm*`** components) or **`DriverField`** when using a patch driver.
- **Horizontal field groups** (same **`group.id`**, **`direction: 'row'`**) → MUI **`Grid`** with **`FormLayoutStretchProvider`** so row height alignment works (see [UI styling](#ui-styling)).
- **Repeatable groups** → **`RepeatableGroupField`**.
- **`type: 'custom'`** nodes → your **`render`** function receives context (`usePatchDriver`, **`patchDriver`**, etc.).

**No business logic** lives here: it only lays out and delegates. Validation beyond what **`FieldConfig`** carries is expected to come from RHF rules or domain layers outside this component.

### Drivers (`FormDriver`)

The optional **`driver`** prop selects how values are read and written:

| `driver` | Behavior |
|----------|----------|
| Omitted or **`{ kind: 'rhf' }`** | Standard RHF; requires **`FormProvider`**. Fields use **`DynamicField`**. |
| **`{ kind: 'patch', getValue, setValue, unsetValue? }`** | Values flow through a patch-style API (for example workspace drafts). Fields use **`DriverField`**, which binds **`FieldConfig.path`** / **`patchBinding`** to the driver. |

Use the patch driver when the form edits a flattened UI model but persists into a nested domain object, or when you intentionally avoid registering every field in RHF.

---

## `ConditionalFormRenderer`

**Path:** `src/ui/patterns/form/ConditionalFormRenderer.tsx`

**Role:** Wraps **`DynamicFormRenderer`** and **filters** the layout to fields whose **`visibleWhen`** conditions (see **`conditions.ts`**) currently pass. Non-layout nodes (repeatable groups, custom blocks) are kept; leaf fields without **`visibleWhen`** always render.

**When a field becomes hidden:**

- **RHF mode:** the field’s value is reset toward its **`defaultValue`** (or cleared), and errors for that field are cleared.
- **Patch mode:** if **`driver.unsetValue`** exists, the coerced domain path is unset (**`PatchValidationProvider`** may also wrap validation for visible fields only).

Re-renders use **`useWatch`** (RHF) or **`driver.getValue`** (patch) to evaluate conditions. Prefer **`ConditionalFormRenderer`** over hand-rolled show/hide when you use **`visibleWhen`** on **`FieldConfig`**.

---

## Data shapes and configuration

- **`FieldConfig`**, **`FormLayoutNode`**, **`FormSection`**, and related types live in **`src/ui/patterns/form/form.types.ts`**.
- Registry modules in features build arrays of **`FieldConfig`** / **`FormLayoutNode`** for **`DynamicFormRenderer`** / **`ConditionalFormRenderer`**.
- **`buildDefaultValues`** (`utils/buildDefaultValues.ts`) helps derive initial RHF values from the same config.

---

## UI styling

Styling is **MUI-first** and shared through a small set of layout primitives so grid rows align and theme tokens stay consistent.

### `FormLayoutStretchProvider` and `formGridStretchOutlinedSx`

**Path:** `src/ui/patterns/form/FormLayoutStretchContext.tsx`

When fields sit in a **horizontal group** (**`group.direction === 'row'`**), **`DynamicFormRenderer`** wraps the group in **`FormLayoutStretchProvider`** with **`value={true}`**. Descendants call **`useFormLayoutStretch()`**; when **`true`**, outlined inputs are given **`formGridStretchOutlinedSx`** so shorter controls (for example **`Select`**) **stretch vertically** to match taller neighbors (for example multiline or number fields) in the same row.

**`AppFormTextField`**, **`AppFormSelect`**, and similar components merge this **`sx`** onto their underlying **`FormControl`** / **`TextField`** when stretch is active.

### `FieldWithDescription` and group chrome

**Path:** `src/ui/patterns/form/DynamicField.tsx` (**`FieldWithDescription`**)

- Optional **`fieldDescription`** on **`FieldConfig`** renders as secondary **`Typography`** below the control. Inside stretched grid cells, the wrapper **`Box`** uses flex column layout so descriptions stay under the control while the control expands with the row.

**`DynamicFormRenderer`** group headers use **`subtitle2`** + **`FormHelperText`** for **`group.label`** / **`group.helperText`**, with a bottom border between grouped sections.

### Theme and density

- Global MUI theme (component defaults, palette) applies to all **`App*`** / MUI usage.
- Many form controls default to **`size="small"`** where set in primitives or adapters (for example **`AppSelect`**, **`DateTimePicker`** **`textField`** slot) for density; **`AppForm`** uses **`Stack`** spacing **`3`** by default.
- Prefer **`sx`** with theme callbacks (**`(theme) => ({ … })`**) when you need palette-aware borders or spacing, consistent with existing form code.

---

## Related entry points

| Export | Typical import |
|--------|------------------|
| **`AppForm`** | `@/ui/patterns/form` or `@/ui/patterns` |
| **`DynamicFormRenderer`**, **`ConditionalFormRenderer`**, **`FormDriver`** | `@/ui/patterns/form` |
| **`AppForm*`** field adapters | `@/ui/patterns/form` / `@/ui/patterns` |
| **`App*`** primitives | `@/ui/primitives` |
| **`FieldConfig`**, **`FormLayoutNode`** | `@/ui/patterns/form` (re-exported from **`form.types`**) |

For inline editing outside full-page forms, **`src/ui/patterns/form/editable/`** exposes **`EditableTextField`**, **`EditableSelect`**, and similar pattern components (local state / save callbacks rather than **`AppForm`**).
