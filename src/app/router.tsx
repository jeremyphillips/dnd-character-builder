import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'
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
  UsersRoute,
  MyCharactersRoute,
  CharacterDetailRoute,
  CampaignsRoute,
  CampaignRoute,
  InviteRoute,
  RulesRoute,
  PartyRoute,
  SessionsRoute,
  SessionRoute,
  MessagingRoute,
  WorldRoute,
  LocationsRoute,
  LocationRoute,
  NpcsRoute,
  NpcRoute,
  MonstersRoute,
  MonsterRoute,
  EquipmentRoute,
  EquipmentDetailsRoute,
  AdminGuard,
  AdminRoute,
  AdminInvitesRoute,
  AdminBrainstormingRoute,
  AdminSettingsRoute,
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
          { path: ROUTES.USERS, element: <UsersRoute /> },
          { path: ROUTES.CHARACTERS, element: <MyCharactersRoute /> },
          { path: ROUTES.CHARACTER, element: <CharacterDetailRoute /> },
          { path: ROUTES.CAMPAIGNS, element: <CampaignsRoute /> },
          { path: ROUTES.RULES, element: <RulesRoute /> },
          { path: ROUTES.PARTY, element: <PartyRoute /> },
          {
            path: ROUTES.CAMPAIGN,
            element: <CampaignRoute />,
            children: [
              { path: 'equipment', element: <EquipmentRoute /> },
              { path: 'equipment/:equipmentId', element: <EquipmentDetailsRoute /> },
              {
                path: 'world',
                element: <WorldRoute />,
                children: [
                  { index: true, element: <Navigate to="locations" replace /> },
                  { path: 'locations', element: <LocationsRoute /> },
                  { path: 'locations/:locationId', element: <LocationRoute /> },
                  { path: 'npcs', element: <NpcsRoute /> },
                  { path: 'npcs/:npcId', element: <NpcRoute /> },
                  { path: 'monsters', element: <MonstersRoute /> },
                  { path: 'monsters/:monsterId', element: <MonsterRoute /> },
                ],
              },
              { path: 'sessions', element: <SessionsRoute /> },
              { path: 'sessions/:sessionId', element: <SessionRoute /> },
              { path: 'messages', element: <MessagingRoute /> },
              { path: 'messages/:conversationId', element: <MessagingRoute /> },
            ],
          },
          { path: ROUTES.INVITE, element: <InviteRoute /> },
          {
            path: ROUTES.ADMIN,
            element: <AdminGuard />,
            children: [
              {
                element: <AdminRoute />,
                children: [
                  { index: true, element: <Navigate to={ROUTES.ADMIN_INVITES} replace /> },
                  { path: 'invites', element: <AdminInvitesRoute /> },
                  { path: 'brainstorming', element: <AdminBrainstormingRoute /> },
                  { path: 'settings', element: <AdminSettingsRoute /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
