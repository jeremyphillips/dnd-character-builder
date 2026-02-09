import useChat from '../hooks/useChat'
import type { ChatMessage } from '../types'
import { useCharacterBuilder, CharacterBuilderShell, type CharacterBuilderState } from '@/characterBuilder'

const ChatMessageItem = ({ message }: ChatMessage) => {
  if (message.role === 'assistant') {
    const jsonMatch = message.content.match(/```json([\s\S]*?)```/i)
    let prettyJson = message.content

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        prettyJson = JSON.stringify(parsed, null, 2)
      } catch (err) {
        console.error('Failed to parse JSON from assistant message', err)
      }
    }

    return (
      <div className="assistant-message">
        <pre style={{ overflowX: 'auto', backgroundColor: '#fff', color: '#000' }}>{prettyJson}</pre>
      </div>
    )
  }

  return <div className="user-message">{message.content}</div>
}

const ChatContainer = () => {
  const { state, start, isComplete } = useCharacterBuilder()

  const {
    sendMessage,
    isLoading,
    messages,
    error
  } = useChat()

  const formatPrompt = (state: CharacterBuilderState) => {

    const baseCharacter = {
      character: {
        name: "TODO",
        edition: state.edition,
        setting: state.setting || 'TODO',
        race: state.race || 'TODO',
        classes: [
          {
            level: state.level,
            subclass: {
              taxonomy: ''
            },
          },
        ],
        alignment: state.alignment || 'TODO',
        stats: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        },
        hit_points: 0,
        armor_class: 0,
        proficiencies: {},
        background: 'TODO',
        equipment: {
          weapons: state?.equipment?.weapons,
          armor: state?.equipment?.armor
        },
        personality_traits: [
          'TODO',
          'TODO',
          'TODO'
        ],
      }
    }

    if (state.edition === '2e') {
      (baseCharacter.character as any).thaco = 20
    }

    const prompt = `You are a D&D assistant. Return a character object in valid JSON format exactly matching this structure: 

    ${JSON.stringify(baseCharacter, null, 2)}

    Do NOT include anything outside this JSON.`

    return prompt
  }

  const handleGenerate = async () => {
    if (!isComplete(state)) return
    await sendMessage(formatPrompt(state))
  }

  return (
    <>
      <CharacterBuilderShell isOpen={false} onClose={() => {}} />

      {error && <p>{error}</p>}

      {messages.map((message, i) => (
        <div key={i}>
          <strong>{message.role}:</strong>
          <ChatMessageItem message={message} />
        </div>
      ))}
    </>
  )
}

export default ChatContainer
