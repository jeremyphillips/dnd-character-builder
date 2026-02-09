import type { EditionId } from '@/data'
import { getAlignmentsByEdition } from './getAlignmentsByEdition'
import { getClassRequirement } from '../class'

export type AlignmentOption = {
  id: string
  label: string
  disabled: boolean
}

export const getAlignmentOptions = (
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
          : [...allowedAlignments]
      const set = new Set(ids)
      if (allowed === null) allowed = new Set(ids)
      else allowed = new Set([...allowed].filter((id) => set.has(id)))
    }
  }

  return editionAlignments.map((a) => ({
    id: a.id,
    label: a.name,
    disabled: allowed !== null ? !allowed.has(a.id) : false
  }))
}
