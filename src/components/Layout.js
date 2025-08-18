'use client'
import { Box, AppBar, Toolbar, IconButton, useTheme, useMediaQuery } from '@mui/material'
import { useState, useEffect } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardDrawer from './Drawer'

export default function DashboardLayout({ children }) {
  const [miniSidenav, setMiniSidenav] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  // Close drawer when screen size changes
  useEffect(() => {
    if (!isMobile) setMiniSidenav(false)
  }, [isMobile])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{ 
          display: { md: 'none' },
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setMiniSidenav(true)}
            sx={{ color: 'text.secondary' }}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <DashboardDrawer 
        open={isMobile ? miniSidenav : true}
        onClose={() => setMiniSidenav(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, md: 0 },
          ml: { xs: 0, md: '280px' },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          backgroundColor: 'background.default'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}