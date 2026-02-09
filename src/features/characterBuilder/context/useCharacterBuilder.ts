import { useContext } from 'react'
import CharacterBuilderContext from './CharacterBuilderContext'

export const useCharacterBuilder = () => {
  const ctx = useContext(CharacterBuilderContext)
  if (!ctx) {
    throw new Error('useCharacterBuilder must be used inside CharacterBuilderProvider')
  }
  return ctx
}
