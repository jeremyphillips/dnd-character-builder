import { useState } from 'react'
import { CharacterBuilderShell } from '@/characterBuilder'
import { ChatContainer } from '@/chat'

export default function CharacterBuilderRoute() {
  const [isModalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ padding: 24 }}>
      <h1>Dungeon &amp; Dragons Character Generator</h1>

      <button onClick={() => setModalOpen(true)}>Create Character</button>

      <CharacterBuilderShell
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ChatContainer />
    </div>
  )
}
