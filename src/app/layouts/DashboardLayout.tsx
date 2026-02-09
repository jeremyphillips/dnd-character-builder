import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { ROUTES } from '../routes'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import ShieldIcon from '@mui/icons-material/Shield'
import LogoutIcon from '@mui/icons-material/Logout'

const DRAWER_WIDTH = 260

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
  { label: 'Characters', to: ROUTES.CHARACTERS, icon: <ShieldIcon /> },
  { label: 'Campaigns', to: ROUTES.CAMPAIGNS, icon: <PeopleIcon /> },
]

export default function DashboardLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'var(--mui-palette-background-paper)',
            borderRight: '1px solid var(--mui-palette-divider)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {user.username}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--mui-palette-text-secondary)', textTransform: 'capitalize' }}>
            {user.role}
          </Typography>
        </Box>

        <Divider />

        {/* Navigation */}
        <List component="nav" sx={{ flex: 1, py: 1 }}>
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              end={to === ROUTES.DASHBOARD}
              selected={
                to === ROUTES.DASHBOARD
                  ? location.pathname === to
                  : location.pathname.startsWith(to)
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { fontSize: '0.9rem' } }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={signOut}
            sx={{ justifyContent: 'flex-start' }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
          overflow: 'auto',
          bgcolor: 'var(--mui-palette-background-default)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
