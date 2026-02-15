import { useState } from 'react'
import useChat from '../hooks/useChat'
import type { ChatMessage } from '../types'
import { useCharacterBuilder, CharacterBuilderShell, type CharacterBuilderState } from '@/characterBuilder'
import { apiFetch } from '@/app/api'
import { type CharacterClassInfo } from '@/shared'
import { LoadingOverlay } from '@/ui/elements'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

// ---------------------------------------------------------------------------
// ChatMessageItem
// ---------------------------------------------------------------------------
const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
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
      <Box sx={{ my: 1, p: 2, bgcolor: 'var(--mui-palette-action-hover)', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
          AI Response
        </Typography>
        <pre style={{ overflowX: 'auto', margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {prettyJson}
        </pre>
      </Box>
    )
  }

  return (
    <Box sx={{ my: 1, p: 2, bgcolor: 'var(--mui-palette-primary-main)', color: '#fff', borderRadius: 1 }}>
      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', opacity: 0.8 }}>
        Prompt Sent
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
        {message.content.slice(0, 200)}…
      </Typography>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Parse AI response into structured data
// ---------------------------------------------------------------------------
function parseAiResponse(message: ChatMessage): Record<string, unknown> | null {
  try {
    // Try extracting JSON from markdown code fences first
    const fenceMatch = message.content.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1])
    }
    // Try parsing the whole content as JSON
    return JSON.parse(message.content)
  } catch {
    console.warn('Could not parse AI response as JSON')
    return null
  }
}

// ---------------------------------------------------------------------------
// Merge builder state + AI result into a character document
// ---------------------------------------------------------------------------
function mergeCharacterData(
  builderState: CharacterBuilderState,
  aiResult: Record<string, unknown> | null,
) {
  // The AI response may be wrapped in { character: { ... } }
  const ai = (aiResult && typeof aiResult === 'object' && 'character' in aiResult
    ? (aiResult as any).character
    : aiResult) ?? {}

  const classInfo = builderState.classes.filter((c: CharacterClassInfo) => c.classId)
  const primaryClass = classInfo[0]

  return {
    name: (builderState.name && builderState.name.trim()) || ai.name || '',
    // Builder state (source of truth for selections)
    race: builderState.race ?? '',
    class: primaryClass?.classId ?? '',
    classes: builderState.classes,
    level: builderState.totalLevel || 1,
    totalLevel: builderState.totalLevel || 1,
    alignment: builderState.alignment ?? '',
    edition: builderState.edition ?? '',
    setting: builderState.setting ?? '',
    xp: builderState.xp ?? 0,
    equipment: builderState.equipment ?? { armor: [], weapons: [], gear: [], weight: 0 },

    // Wealth: merge AI overrides onto builder state
    wealth: {
      ...builderState.wealth,
      ...(ai.wealth ?? {}),
    },

    // AI-generated fields
    stats: ai.stats ?? {},
    hitPoints: ai.hitPoints ?? {},
    armorClass: ai.armorClass ?? {},
    proficiencies: ai.proficiencies ?? [],
    narrative: ai.narrative ?? {},

    // Full AI response stored for reference
    ai: aiResult ?? {},

    // Traceability
    generation: {
      model: 'gpt-4o-mini',
      promptVersion: '1.0',
      createdAt: new Date().toISOString(),
    },
  }
}

// ---------------------------------------------------------------------------
// Save character to DB (if user is logged in)
// ---------------------------------------------------------------------------
async function saveCharacterToDb(data: {
  builderState: CharacterBuilderState
  aiResult: Record<string, unknown> | null
}): Promise<boolean> {
  try {
    await apiFetch('/api/auth/me')
    const characterData = mergeCharacterData(data.builderState, data.aiResult)
    await apiFetch('/api/characters', { method: 'POST', body: characterData })
    return true
  } catch (err) {
    console.error('Failed to save character:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// ChatContainer
// ---------------------------------------------------------------------------
interface ChatContainerProps {
  isModalOpen: boolean
  onCloseModal: () => void
}

const ChatContainer = ({ isModalOpen, onCloseModal }: ChatContainerProps) => {
  const { state, isComplete, resetState } = useCharacterBuilder()

  const {
    sendMessage,
    messages,
    error
  } = useChat()

  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const formatPrompt = (s: CharacterBuilderState) => {
    const baseCharacter = {
      character: {
        type: s.type ?? 'pc',
        name: (s.name && s.name.trim()) || '', // User-provided or AI to generate
        
        edition: s.edition ?? '',
        setting: s.setting,
        
        race: s.race,
        classes: s.classes.map((cls: CharacterClassInfo, i: number) => ({
          id: cls.classId,
          name: cls.classId,
          level: cls.level,
          subclass: {
            id: cls.classDefinitionId,
            name: cls.classDefinitionId,
          },
          isStartingClass: i === 0,
        })),
        alignment: s.alignment,
        stats: {
          strength: null,
          dexterity: null,
          constitution: null,
          intelligence: null,
          wisdom: null,
          charisma: null,
        },
        hitPoints: {
          total: null,
          generationMethod: '4d6-drop-lowest',
        },
        armorClass: {
          base: 10,
          current: null,
          calculation: '',
        },
        requirements: {
          minStats: { strength: 9 },
        },
        proficiencies: [],
        equipment: {
          weapons: s?.equipment?.weapons,
          armor: s?.equipment?.armor,
          gear: s?.equipment?.gear,
        },
        derivedMetrics: {
          proficiencyBonus: null,
        },
        narrative: {
          personalityTraits: [],
          ideals: '',
          bonds: '',
          flaws: '',
          backstory: '',
        },
        xp: s.xp,
      },
    }

    return `You are an expert D&D GM. Return a character object in valid JSON format exactly matching this structure: 

    ${JSON.stringify(baseCharacter, null, 2)}

    Do NOT include anything outside this JSON.`
  }

  // ── Generate handler ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!isComplete(state)) return

    setGenerating(true)
    setGenError(null)

    try {
      // 1. Send to AI and wait for response
      const response = await sendMessage(formatPrompt(state))

      // 2. Parse AI result
      const aiResult = response ? parseAiResponse(response) : null

      // 3. Save merged character to DB (only if logged in)
      await saveCharacterToDb({
        builderState: state,
        aiResult,
      })

      // 4. Only clear state + close modal after persistence succeeds
      resetState()
      onCloseModal()
    } catch (err: any) {
      setGenError(err.message ?? 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <>
      <CharacterBuilderShell
        isOpen={isModalOpen}
        onClose={generating ? undefined : onCloseModal}
        onGenerate={handleGenerate}
        isGenerating={generating}
      />

      {/* Generation loader overlay inside the modal */}
      <LoadingOverlay
        open={generating && isModalOpen}
        headline="Generating character…"
        subtext="Consulting the sages"
      />

      {/* Errors */}
      {(error || genError) && (
        <Alert severity="error" sx={{ my: 2 }}>
          {genError ?? error}
        </Alert>
      )}

      {/* Message history */}
      {messages.map((message, i) => (
        <ChatMessageItem key={i} message={message} />
      ))}
    </>
  )
}

export default ChatContainer
