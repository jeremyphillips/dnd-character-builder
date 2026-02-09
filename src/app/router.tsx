import { createBrowserRouter, Outlet } from 'react-router-dom'
import { ROUTES } from './routes'
import { AppProviders } from './providers'

// MUI Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Route components
import {
  CharacterBuilderRoute,
  LoginRoute,
  DashboardRoute,
  CharactersRoute,
  CampaignsRoute,
  CampaignRoute,
} from './routes/index'

function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.HOME, element: <CharacterBuilderRoute /> },
          { path: ROUTES.CHARACTER_BUILDER, element: <CharacterBuilderRoute /> },
          { path: ROUTES.LOGIN, element: <LoginRoute /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardRoute /> },
          { path: ROUTES.CHARACTERS, element: <CharactersRoute /> },
          { path: ROUTES.CAMPAIGNS, element: <CampaignsRoute /> },
          { path: ROUTES.CAMPAIGN, element: <CampaignRoute /> },
        ],
      },
    ],
  },
])
