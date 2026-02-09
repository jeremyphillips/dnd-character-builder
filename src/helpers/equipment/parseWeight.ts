export const parseWeight = (weightStr?: string): number => {
  if (!weightStr) return 0
  const match = weightStr.match(/([\d.]+)/)
  return match ? Number(match[1]) : 0
}
