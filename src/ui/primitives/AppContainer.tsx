import Container from '@mui/material/Container'
import type { ContainerProps } from '@mui/material/Container'

export type AppContainerProps = ContainerProps

/**
 * App-wide max-width column (`lg` by default). Root is a `div` unless `component` is set.
 * Under `AuthLayout`, the shell already renders `<main>` — do not pass `component="main"` here.
 */
export default function AppContainer({ maxWidth = 'lg', ...props }: AppContainerProps) {
  return <Container maxWidth={maxWidth} {...props} />
}
