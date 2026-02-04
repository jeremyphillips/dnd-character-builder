import { useChat } from '@/hooks'
import { Form }from '@/components/elements'
import type { FormValues } from '@/components/elements/Form/Form'
import type { ChatMessage } from '@/services'

const ChatMessageItem = ({ message }: ChatMessage) => {
  if (message.role === 'assistant') {
    // extract JSON portion from message
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
  const { sendMessage, isLoading, messages, error } = useChat()

  const formatPrompt = (selections: FormValues) => {

    console.log('fooo',selections)

    const baseCharacter = {
      character: {
        name: "TODO",
        edition: selections.edition,
        campaign: selections.campaign || 'TODO',
        race: selections.race || 'TODO',
        class: selections.characterClass || 'TODO',
        subclass: selections.characterSubclass || 'TODO',
        alignment: selections.alignment || 'TODO',
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
        level: 1,
        skills: {},
        background: "TODO",
        equipment: {},
        personality_traits: {}
      }
    }

    // Inject thaco if edition is 2
    if (selections.edition === '2') {
      (baseCharacter.character as any).thaco = 20; // or some placeholder
    }

    const prompt = `You are a D&D assistant. Return a character object in valid JSON format exactly matching this structure: 

    ${JSON.stringify(baseCharacter, null, 2)}

    Do NOT include anything outside this JSON.`

    return prompt
  }


  const handleSubmit = async (selections: FormValues) => {
    console.log(formatPrompt(selections))
    //await sendMessage(formatPrompt(selections))
  }

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        loading={isLoading}
      />

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
