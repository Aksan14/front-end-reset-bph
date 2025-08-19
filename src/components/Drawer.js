'use client'
import { 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import Image from 'next/image';
import { menuItems } from '@/config/menuItems';

export default function DashboardDrawer({ open, onClose, variant }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    router.push('/login');
  };

  const DrawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'rgba(255, 255, 255, 0.95)', // More transparent background
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        width: '70%', // Smaller width for better visibility
        height: '70%', // Smaller height for better visibility
        backgroundImage: "url('/images/coconut-logo.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
        backgroundSize: 'contain',
        opacity: 0.15, // Increased opacity
        transform: 'rotate(-5deg)', // Slight rotation for style
        pointerEvents: 'none',
        zIndex: 0,
        filter: 'grayscale(0.3)', // Less grayscale for more color
      }
    }}>
      {/* Header Section with Coconut Computer Club Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: (theme) => `linear-gradient(90deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.primary.light}, 
              transparent
            )`,
          }
        }}
      >
        <Box 
          sx={{ 
            width: '200px',
            height: '60px',
            position: 'relative',
            mb: 1,
            '&:hover': {
              transform: 'scale(1.02)',
            },
            transition: 'transform 0.2s ease'
          }}
        >
          <Image
            src="/images/coconut-logo-lanskap.png"
            alt="Coconut Computer Club"
            fill
            priority
            style={{ 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </Box>
        <Typography 
          variant="subtitle2"
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            opacity: 0.7,
            mt: 1
          }}
        >
          Inventaris System
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ 
        px: 2.5, 
        py: 3, 
        flex: 1,
        position: 'relative',
        zIndex: 2,
        '& .MuiListItem-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.4)', // More transparent menu items
          backdropFilter: 'blur(8px)', // Enhanced blur effect
          mb: 1,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
        }
      }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={() => {
              router.push(item.path);
              if (isMobile) onClose?.();
            }}
            sx={{
              mb: 1,
              borderRadius: 2,
              cursor: 'pointer',
              color: pathname === item.path ? 'primary.main' : 'text.secondary',
              bgcolor: pathname === item.path ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.12)',
                color: 'primary.main',
                transform: 'translateX(6px)',
                borderColor: 'rgba(99, 102, 241, 0.2)'
              },
              py: 1.5
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', 
              minWidth: 45, // Increased icon width
              fontSize: '1.2rem'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: pathname === item.path ? 600 : 500
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Updated Logout Button with more transparency */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)' // More transparent background
      }}>
        <Button
          fullWidth
          variant="text"
          color="inherit"
          startIcon={<LogoutIcon sx={{ opacity: 0.7 }} />}
          onClick={handleLogout}
          sx={{
            py: 1.25,
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'text.secondary',
            backgroundColor: 'rgba(255, 255, 255, 0.2)', // More transparent button
            backdropFilter: 'blur(12px)', // Enhanced blur
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 59, 59, 0.08)', // Subtle red tint
              color: 'error.main',
              transform: 'translateX(4px)',
              borderColor: 'rgba(255, 59, 59, 0.2)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Keluar
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true
      }}
      sx={{
        display: { xs: 'block' },
        '& .MuiDrawer-paper': {
          width: 320, // Increased drawer width
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: variant === 'temporary' ? 
            '0 8px 24px rgba(0,0,0,0.12)' : 
            '0 0 20px rgba(0,0,0,0.05)',
          bgcolor: 'background.paper'
        }
      }}
    >
      {DrawerContent}
    </Drawer>
  );
}