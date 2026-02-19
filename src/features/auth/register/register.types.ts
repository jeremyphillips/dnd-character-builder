export interface RegisterFormData {
  username: string
  firstName: string
  lastName: string
  password: string
  inviteToken: string
}

export interface RegisterResponse {
  user: { id: string } | null
  campaignId?: string
  campaignName?: string
  campaignEdition?: string
  campaignSetting?: string
  error?: string
}

export interface PendingRedirect {
  to: string
  state?: Record<string, unknown>
}
