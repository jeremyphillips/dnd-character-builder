import { editions, type EditionId } from "@/data"
import { getById } from '../lookups'

export const getAlignmentsByEdition = (editionId: EditionId) => {
  const edition = getById(editions, editionId)

  return edition?.alignments ? edition?.alignments : []
}
