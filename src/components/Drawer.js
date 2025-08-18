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
      bgcolor: 'background.paper' 
    }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3, // Increased padding
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ position: 'relative', width: 42, height: 42 }}> {/* Increased logo size */}
          <Image
            src="/images/coconut-logo.png"
            alt="Logo"
            fill
            priority
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Typography 
          variant="h6"
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '1.2rem'
          }}
        >
          Coconut Inventaris
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2.5, py: 3, flex: 1 }}> {/* Increased padding */}
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={() => {
              router.push(item.path);
              if (isMobile) onClose?.();
            }}
            sx={{
              mb: 1, // Increased spacing between items
              borderRadius: 2, // Increased border radius
              cursor: 'pointer',
              color: pathname === item.path ? 'primary.main' : 'text.secondary',
              bgcolor: pathname === item.path ? 'primary.lighter' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                transform: 'translateX(6px)'
              },
              py: 1.5 // Added vertical padding
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

      {/* Logout Button */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            py: 1.5, // Increased button height
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '0.95rem',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'error.lighter'
            }
          }}
        >
          Logout
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