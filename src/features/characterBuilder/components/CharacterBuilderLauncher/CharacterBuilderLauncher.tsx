import { useState } from 'react'
import Button from '@mui/material/Button'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

import { useCharacterBuilder } from '@/characterBuilder'
import { ChatContainer } from '@/chat'
import type { CharacterType } from '@/shared/types/character.core'
import type { EditionId, SettingId } from '@/data'

type CharacterBuilderLauncherProps = {
  buttonLabel?: string
  variant?: 'contained' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  onCharacterCreated?: (character: unknown) => void
  characterType?: CharacterType
  campaignEdition?: EditionId
  campaignSetting?: SettingId
}

const CharacterBuilderLauncher = ({
  characterType = 'pc',
  buttonLabel = 'Create Character',
  variant = 'contained',
  size = 'large',
  onCharacterCreated
}: CharacterBuilderLauncherProps) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const { setCharacterType } = useCharacterBuilder()

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<AutoFixHighIcon />}
        onClick={() => {
          setCharacterType(characterType)
          setModalOpen(true)
        }}
      >
        {buttonLabel}
      </Button>

      <ChatContainer
        isModalOpen={isModalOpen}
        onCloseModal={() => setModalOpen(false)}
        onCharacterCreated={onCharacterCreated}
      />
    </>
  )
}

export default CharacterBuilderLauncher