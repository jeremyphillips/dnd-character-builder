/** Small numeric display helper for combat UI (e.g. initiative "+2"). */
export function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value)
}
