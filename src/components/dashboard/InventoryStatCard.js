// src/components/dashboard/InventoryStatCard.js
import { Card, Typography, Box, CircularProgress, SvgIcon } from "@mui/material";
import { motion } from "framer-motion";

export default function InventoryStatCard({ icon, title, value, color = 'primary', loading = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{
            mr: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SvgIcon component={icon.type} inheritViewBox sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} color={color} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
}