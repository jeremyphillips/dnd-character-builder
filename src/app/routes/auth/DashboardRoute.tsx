import { useAuth } from '@/app/providers/AuthProvider'

export default function DashboardRoute() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      <p>Manage your characters and campaigns from the sidebar.</p>
    </div>
  )
}
