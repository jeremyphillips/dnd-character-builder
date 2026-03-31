import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/app/api'
import type { CharacterType } from '@/features/character/domain/types'
import type { CharacterDoc } from '@/features/character/domain/types'

export interface UseCharactersReturn {
  characters: CharacterDoc[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useCharacters(filters?: {
  /** Use `'all'` to load both PCs and NPCs (omits `type` query — server returns every owned character). */
  type?: CharacterType | 'all'
}) {
  const [characters, setCharacters] = useState<CharacterDoc[]>([])
  const [loading, setLoading] = useState(true)
  
  const type = filters?.type ?? 'pc'
  const params = new URLSearchParams()
  if (type !== 'all') {
    params.append('type', type)
  }
  const query = params.toString()
  const url = query ? `/api/characters?${query}` : '/api/characters'

  const refetch = useCallback(async () => {
    try {
      const data = await apiFetch<{ characters: CharacterDoc[] }>(url)
      setCharacters(data.characters ?? [])
    } catch {
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { characters, loading, refetch }
}
