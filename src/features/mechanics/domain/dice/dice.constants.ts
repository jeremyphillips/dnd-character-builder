export const DIE_FACES = [4, 6, 8, 10, 12, 20] as const;

/** UI-facing options with string values (RHF-friendly). */
export const DIE_FACE_OPTIONS = DIE_FACES.map((n) => ({
  value: String(n),
  label: `d${n}`,
})) as ReadonlyArray<{ value: string; label: string }>;