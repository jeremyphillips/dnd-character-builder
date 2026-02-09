import type { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import { CharacterBuilderProvider } from '@/characterBuilder'
import { AuthProvider } from './providers/AuthProvider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CharacterBuilderProvider>
          {children}
        </CharacterBuilderProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
