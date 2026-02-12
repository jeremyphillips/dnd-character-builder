import { AppAvatar } from '@/ui/avatar'

interface UserAvatarProps {
  userId?: string
  username?: string
  avatarUrl?: string
  role?: 'dm' | 'player'
  status?: 'online' | 'offline' | 'pending'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const UserAvatar = ({
  username,
  avatarUrl,
  role,
  status,
  size = 'md',
}: UserAvatarProps) => (
  <AppAvatar
    src={avatarUrl}
    name={username}
    size={size}
    role={role}
    status={status}
  />
)

export default UserAvatar
