import { createContext } from 'react'
import { type CharacterBuilderContextValue } from '../types'

const CharacterBuilderContext =
  createContext<CharacterBuilderContextValue | null>(null)

export default CharacterBuilderContext
