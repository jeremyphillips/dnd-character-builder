import { parseCurrencyToGold } from '../wealth'

export const getItemCostGp = (
  item: { editionData: any[] },
  edition: string
): number => {
  const data = item.editionData.find(d => d.edition === edition)
  return data?.cost ? parseCurrencyToGold(data.cost) : 0
}
