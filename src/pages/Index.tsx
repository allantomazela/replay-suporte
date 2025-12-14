import { Navigate } from 'react-router-dom'

export default function Index() {
  // Always redirect root to dashboard
  return <Navigate to="/dashboard" replace />
}
