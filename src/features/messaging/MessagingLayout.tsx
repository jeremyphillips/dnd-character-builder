import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useMessaging } from '@/app/providers/MessagingProvider'
import { ROUTES } from '@/app/routes'
import { getConversationDisplayName } from '@/domain/messaging'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { ConversationList } from './ConversationList'
import { ConversationView } from './ConversationView'
import { NewConversationModal } from './NewConversationModal'

export const MessagingLayout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id: campaignId, conversationId: urlConversationId } = useParams<{
    id: string
    conversationId?: string
  }>()
  const {
    conversations,
    selectedConversationId,
    getConversation,
    loadMessages,
    selectConversation,
    setNewConversationModalOpen,
    newConversationModalOpen,
  } = useMessaging()

  useEffect(() => {
    if (!campaignId) return

    if (!urlConversationId) {
      if (selectedConversationId) selectConversation(null)
      return
    }

    if (selectedConversationId === urlConversationId) return

    const conv = conversations.find((c) => c._id === urlConversationId)
    if (conv) {
      selectConversation(urlConversationId)
      return
    }

    getConversation(urlConversationId).then((fetched) => {
      if (fetched) selectConversation(urlConversationId)
    })
  }, [urlConversationId, campaignId, selectedConversationId, conversations, getConversation, selectConversation])

  const selectedConversation = selectedConversationId
    ? conversations.find((c) => c._id === selectedConversationId)
    : null

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId, loadMessages])

  const handleConversationCreated = (conversationId: string) => {
    selectConversation(conversationId)
    loadMessages(conversationId)
    if (campaignId) {
      navigate(ROUTES.MESSAGING_CONVERSATION.replace(':id', campaignId).replace(':conversationId', conversationId))
    }
  }

  if (!campaignId) {
    return (
      <Typography color="text.secondary">No campaign selected.</Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', minHeight: 400 }}>
      <Box
        sx={{
          width: 280,
          borderRight: 1,
          borderColor: 'divider',
          p: 2,
          overflow: 'auto',
        }}
      >
        <ConversationList campaignId={campaignId} />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            displayName={getConversationDisplayName(selectedConversation, user?.id ?? '')}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              Select a conversation or start a new one
            </Typography>
          </Box>
        )}
      </Box>

      <NewConversationModal
        campaignId={campaignId}
        open={newConversationModalOpen}
        onClose={() => setNewConversationModalOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </Box>
  )
}
