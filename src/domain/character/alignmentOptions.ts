import type { EditionId } from '@/data'
import { getAllowedAlignmentIdsByClass, type AlignmentOption } from './alignment'

export type { AlignmentOption } from './alignment'

export const getAlignmentOptionsForCharacter = (
  editionId: EditionId | undefined,
  classIds: string[]
): AlignmentOption[] => {
  return getAllowedAlignmentIdsByClass(editionId, classIds)
}
