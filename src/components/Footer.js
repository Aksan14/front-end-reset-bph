'use client'
import { Box, Container, Grid, Typography, Link } from '@mui/material'

export default function DashboardFooter({ darkMode }) {
    return (
        <Box component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: darkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(6px)',
                borderTop: '1px solid',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color={darkMode ? '#fff' : 'text.secondary'}>
                                © {new Date().getFullYear()} Sistem Informasi Inventaris Barang
                            </Typography>
                            <Link
                                href="https://coconut.or.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: darkMode ? '#90caf9' : '#1976d2' }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                >
                                    COCONUT Computer Club
                                </Typography>
                            </Link>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color={darkMode ? '#fff' : 'text.secondary'}>
                                Versi 1.0.0
                            </Typography>
                            <Typography variant="body2" color={darkMode ? '#fff' : 'text.secondary'}>
                                |
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color={darkMode ? '#fff' : 'text.secondary'}>
                                    Crafted with ❤️ by hacklab
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}