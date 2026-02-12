import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import { apiFetch } from '../api'

interface ActiveCampaignContextType {
  activeCampaignId: string | null
  setActiveCampaign: (id: string) => void
  clearActiveCampaign: () => void
}

const ActiveCampaignContext =
  createContext<ActiveCampaignContextType | undefined>(undefined)

const STORAGE_KEY = 'activeCampaignId'

function isValidObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id)
}

export const ActiveCampaignProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeCampaignId, setActiveCampaignId] =
    useState<string | null>(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored && isValidObjectId(stored) ? stored : null
    })

  // Auto-select when user has only one campaign
  useEffect(() => {
    apiFetch<{ campaigns: { _id: string }[] }>('/api/campaigns')
      .then((data) => {
        const list = data.campaigns ?? []
        if (list.length !== 1) return
        setActiveCampaignId((prev) => {
          if (prev) return prev
          const id = list[0]._id
          localStorage.setItem(STORAGE_KEY, id)
          return id
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const match = matchPath(
      { path: '/campaigns/:campaignId/*' },
      location.pathname
    )

    if (match?.params?.campaignId) {
      const id = match.params.campaignId
      if (id) {
        if (isValidObjectId(id) && id !== activeCampaignId) {
          setActiveCampaignId(id)
          localStorage.setItem(STORAGE_KEY, id)
        } else if (!isValidObjectId(id) && activeCampaignId === id) {
          setActiveCampaignId(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }, [location.pathname, activeCampaignId])

  const setActiveCampaign = (id: string) => {
    setActiveCampaignId(id)
    localStorage.setItem(STORAGE_KEY, id)

    // Optional: auto-navigate to campaign root
    navigate(`/campaigns/${id}`)
  }

  const clearActiveCampaign = () => {
    setActiveCampaignId(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      activeCampaignId,
      setActiveCampaign,
      clearActiveCampaign
    }),
    [activeCampaignId]
  )

  return (
    <ActiveCampaignContext.Provider value={value}>
      {children}
    </ActiveCampaignContext.Provider>
  )
}

export const useActiveCampaign = () => {
  const context = useContext(ActiveCampaignContext)
  if (!context) {
    throw new Error(
      'useActiveCampaign must be used within ActiveCampaignProvider'
    )
  }
  return context
}
