import Typography from '@mui/material/Typography'
import { HorizontalCompactCard } from '@/ui/cards'

interface CampaignHorizontalCardProps {
  campaignId: string
  name: string
  description?: string
  imageUrl?: string
  /** DM / admin display name */
  dmName?: string
  edition?: string
  setting?: string
}

const CampaignHorizontalCard = ({
  campaignId,
  name,
  description,
  imageUrl,
  dmName,
  edition,
  setting,
}: CampaignHorizontalCardProps) => {
  const subheadline = [edition, setting].filter(Boolean).join(' · ')

  return (
    <HorizontalCompactCard
      image={imageUrl}
      headline={name}
      subheadline={subheadline || undefined}
      description={description}
      badges={dmName ? [{ type: 'role' as const, value: `DM: ${dmName}` }] : []}
      link={`/campaigns/${campaignId}`}
      actions={
        <Typography variant="body2" color="primary" sx={{ fontSize: '0.8125rem' }}>
          View details
        </Typography>
      }
    />
  )
}

export default CampaignHorizontalCard
