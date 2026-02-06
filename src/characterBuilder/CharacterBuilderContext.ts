import { createContext } from 'react'
import { type CharacterBuilderContextValue } from './characterBuilder.types'

const CharacterBuilderContext =
  createContext<CharacterBuilderContextValue | null>(null)

export default CharacterBuilderContext
