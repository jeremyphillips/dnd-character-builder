import { editions, type EditionId } from '@/data'
import { getById } from '../lookups'
import { getClassRequirement } from './classRequirements'

export const getAlignmentsByEdition = (editionId: EditionId) => {
  const edition = getById(editions, editionId)
  return edition?.alignments ?? []
}

export type AlignmentOption = {
  id: string
  label: string
  disabled: boolean
}

export const getAllowedAlignmentIdsByClass = (
  editionId: EditionId | undefined,
  classIds: string[]
): AlignmentOption[] => {
  const editionAlignments = editionId ? getAlignmentsByEdition(editionId) : []
  let allowed: Set<string> | null = null

  if (editionId && classIds.length > 0) {
    for (const classId of classIds) {
      const req = getClassRequirement(classId, editionId)
      const allowedAlignments = req?.allowedAlignments
      if (allowedAlignments === undefined) continue
      const ids: string[] =
        allowedAlignments === 'any'
          ? editionAlignments.map((a) => a.id)
          : (allowedAlignments as string[]).slice()
      const set = new Set<string>(ids)
      if (allowed === null) allowed = new Set(ids)
      else allowed = new Set([...allowed].filter((id: string) => set.has(id)))
    }
  }

  return editionAlignments.map((a) => ({
    id: a.id,
    label: a.name,
    disabled: allowed !== null ? !allowed.has(a.id) : false,
  }))
}
