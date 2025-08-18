import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { menuItems } from '@/config/menuItems';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
        borderTop: 1,
        borderColor: 'divider'
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={pathname}
        onChange={(_, newValue) => router.push(newValue)}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.text}
            label={item.text}
            icon={item.icon}
            value={item.path}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}