/**
 * Edition gating — look up the base race / class IDs that an edition
 * declares as available.
 *
 * This is the only file in the options module that reads the edition
 * catalog directly.  Everything downstream receives plain ID arrays.
 */
import { editions } from '@/data'
import type { EditionId } from '@/data/editions/edition.types'

export function getEditionBaseRaceIds(editionId: EditionId): readonly string[] {
  const edition = editions.find(e => e.id === editionId)
  return edition?.races ?? []
}

export function getEditionBaseClassIds(editionId: EditionId): readonly string[] {
  const edition = editions.find(e => e.id === editionId)
  return edition?.classes ?? []
}
