export const getEquipmentCostByEdition = (
  item: { editionData?: { edition: string; cost?: string }[] },
  edition: string
) => {
  const data = item.editionData?.find(d => d.edition === edition)
  return data?.cost ? data.cost : ''
}
