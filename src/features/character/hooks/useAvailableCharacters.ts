import { useState, useEffect } from 'react'
import { apiFetch } from '@/app/api'

export interface CharacterForOption {
  _id: string
  name: string
  level?: number
  totalLevel?: number
  class?: string
  classes?: { classId?: string; classDefinitionId?: string; level: number }[]
  edition?: string
  setting?: string
}

export interface UseAvailableCharactersReturn {
  availableCharacters: CharacterForOption[]
  loading: boolean
}

export function useAvailableCharacters(enabled: boolean): UseAvailableCharactersReturn {
  const [availableCharacters, setAvailableCharacters] = useState<CharacterForOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setLoading(true)
    apiFetch<{ characters: CharacterForOption[] }>('/api/characters/available-for-campaign')
      .then((data) => setAvailableCharacters(data.characters ?? []))
      .catch(() => setAvailableCharacters([]))
      .finally(() => setLoading(false))
  }, [enabled])

  return { availableCharacters, loading }
}
