export const getById = <T extends { id: string }>(
  array: readonly T[],
  id: string
): T | undefined => {
  if (!id) return undefined

  return array.find(item => item.id === id)
}
