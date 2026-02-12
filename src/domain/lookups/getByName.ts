export const getByName = <T extends { name: string }>(
  items: T[],
  name?: string
): T | undefined => {
  if (!name) return undefined

  return items.find(item => item.name === name)
}
