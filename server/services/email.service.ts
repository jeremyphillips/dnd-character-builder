import { env } from '../config/env'
import type { EmailProvider } from './email.providers/types'
import { etherealProvider } from './email.providers/ethereal.provider'
import { smtpProvider } from './email.providers/smtp.provider'

// ---------------------------------------------------------------------------
// Provider selection — Ethereal for development, SMTP for production
// ---------------------------------------------------------------------------

function getProvider(): EmailProvider {
  if (env.NODE_ENV === 'development') return etherealProvider
  return smtpProvider
}

// ---------------------------------------------------------------------------
// Campaign invite email
// ---------------------------------------------------------------------------

interface InviteEmailParams {
  to: string
  campaignName: string
  invitedBy: string
}

export async function sendCampaignInvite({ to, campaignName, invitedBy }: InviteEmailParams) {
  const signUpUrl = `${env.CLIENT_URL}/login`

  const subject = `You've been invited to join "${campaignName}"`

  const text = [
    `Hi there!`,
    ``,
    `${invitedBy} has invited you to join the campaign "${campaignName}" on D&D Character Builder.`,
    ``,
    `To get started, create an account using this email address:`,
    `${signUpUrl}`,
    ``,
    `Once you've signed up, the campaign will appear in your dashboard automatically.`,
    ``,
    `Happy adventuring!`,
    `— D&D Character Builder`,
  ].join('\n')

  const html = [
    `<p>Hi there!</p>`,
    `<p><strong>${invitedBy}</strong> has invited you to join the campaign <strong>"${campaignName}"</strong> on D&amp;D Character Builder.</p>`,
    `<p>To get started, create an account using this email address:</p>`,
    `<p><a href="${signUpUrl}">${signUpUrl}</a></p>`,
    `<p>Once you've signed up, the campaign will appear in your dashboard automatically.</p>`,
    `<p>Happy adventuring!<br/>— D&amp;D Character Builder</p>`,
  ].join('\n')

  const provider = getProvider()
  const result = await provider.sendEmail({ to, subject, text, html })

  return { to, subject, body: text, previewUrl: result.previewUrl }
}
