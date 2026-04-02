import { Navigate } from 'react-router-dom'

export default function GameSessionIndexRedirect() {
  return <Navigate to="lobby" replace />
}
