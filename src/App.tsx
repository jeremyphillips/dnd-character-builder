import { useState } from 'react'
import { CharacterBuilderProvider } from '@/characterBuilder'
import { ChatContainer, CharacterBuilderModal } from '@/components/modules'

function App() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <CharacterBuilderProvider>
      <div style={{ padding: 24 }}>
        <h1>Dungeon & Dragons Character Generator</h1>

        <button onClick={() => setModalOpen(true)}>Create Character</button>

        <CharacterBuilderModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />

        <ChatContainer />
      </div>
    </CharacterBuilderProvider>
  )
}

export default App
