import { env } from '../config/env'

interface InviteEmailParams {
  to: string
  campaignName: string
  invitedBy: string
}

export async function sendCampaignInvite({ to, campaignName, invitedBy }: InviteEmailParams) {
  const signUpUrl = `${env.CLIENT_URL}/login`

  const subject = `You've been invited to join "${campaignName}"`
  const body = [
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

  // TODO: Replace with a real email provider (e.g. Resend, SendGrid, Nodemailer)
  console.log('--- EMAIL PLACEHOLDER ---')
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${body}`)
  console.log('--- END EMAIL ---')

  return { to, subject, body }
}
