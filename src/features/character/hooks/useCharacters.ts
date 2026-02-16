import { useState, useEffect, useCallback } from 'react'
import type { CharacterDoc } from '@/shared'
import { apiFetch } from '@/app/api'

export interface UseCharactersReturn {
  characters: CharacterDoc[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useCharacters(): UseCharactersReturn {
  const [characters, setCharacters] = useState<CharacterDoc[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const data = await apiFetch<{ characters: CharacterDoc[] }>('/api/characters')
      setCharacters(data.characters ?? [])
    } catch {
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { characters, loading, refetch }
}
