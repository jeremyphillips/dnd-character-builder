import { useChat } from '@/hooks'
import type { ChatMessage } from '@/services'
import { useCharacterBuilder, type CharacterBuilderState } from '@/characterBuilder'
import { CharacterBuilderModal } from '@/components/modules'

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
        campaign: state.campaign || 'TODO',
        race: state.race || 'TODO',
        classes: [
          { 
            // id: state.characterClass,
            // name: state.characterClass,
            level: state.level,
            subclass: { // or null
              // id: state.classDefinition,
              // name: state.classDefinition,
              taxonomy: '' 
              // source: 'CFH' 
              // isStartingClass: boolean
            },
          },
        ],
        // 2e: Leveling both at once
        // progressionType: "multiclass", 
        // totalCharacterLevel: 6,
        // classes: [...]
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
        // 2e
        // mechanics: {
        //   weaponSpecialization: 'Longsword', // Only 2e Fighters get this
        //   secondarySkills: 'Navigation'      // 2e specific flavor
        // }
      }
    }

    // const workingPrompt = {
    //   context: {
    //     edition: '2e',
    //     intent: 'I want to play a highly charismatic Paladin from a fallen noble house.'
    //   },
    //   generationRules: {
    //     method: 'high-fantasy-optimized', // Tells AI to favor primary stats
    //     pointPool: 75, // Or specify '3d6 in order' or '4d6 drop lowest'
    //     constraints: {
    //       minima: { strength: 12, constitution: 9, wisdom: 13, charisma: 17 }, // The 2e Paladin "Gate"
    //       racialAdjustments: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }
    //     }
    //   },
    //   // The AI will fill this out in the response
    //   targetStats: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    // }

    // Inject thaco if edition is 2
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
      <CharacterBuilderModal />
      
      {/* {!state.step && (
        <button onClick={start}>
          Create a Character
        </button>
      )} */}

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
