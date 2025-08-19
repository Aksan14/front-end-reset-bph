"use client";

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Stack,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  useMediaQuery,
  Card,
  Snackbar,
  Alert,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LockIcon from "@mui/icons-material/Lock";
import { useState, useEffect } from "react";
import { borrowService } from "@/services/borrowService"; // Restored original import
import BorrowHistoryTable from "@/components/dashboard/BorrowHistoryTable"; // Restored original import
import { endpoints } from "@/config/api"; // Restored original import
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import PasswordDialog from "@/components/PasswordDialog"; // Restored original import
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Enhanced StatCard Component
const StatCard = ({ icon: Icon, title, value, color = "primary" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 1.5, sm: 2 },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].light,
          0.15
        )} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        "&:hover": {
          transform: { xs: "none", md: "translateY(-8px)" },
          boxShadow: `0 20px 25px -5px ${alpha(
            theme.palette[color].main,
            0.2
          )}`,
          "& .stat-icon": {
            transform: "scale(1.1) rotate(10deg)",
            background: theme.palette[color].main,
            color: "#fff",
          },
        },
      }}
    >
      <Stack
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box
          className="stat-icon"
          sx={{
            p: { xs: 1.5, sm: 1.8, md: 2 },
            width: "fit-content",
            borderRadius: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.palette[color].main, 0.12),
            color: theme.palette[color].main,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Icon sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
        </Box>

        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              background: `linear-gradient(45deg, ${theme.palette[color].dark}, ${theme.palette[color].main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              color: alpha(theme.palette[color].dark, 0.7),
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    h4: {
      fontWeight: 800,
      color: "#0f172a",
      letterSpacing: "-0.5px",
    },
    h5: {
      fontWeight: 700,
      color: "#1e293b",
      letterSpacing: "-0.3px",
    },
    body1: {
      color: "#64748b",
    },
  },
  palette: {
    primary: {
      main: "#6366f1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8b5cf6",
    },
    error: {
      main: "#ef4444",
    },
    success: {
      main: "#10b981",
    },
    info: {
      main: "#0ea5e9",
    },
    warning: {
      main: "#f59e0b",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.03)",
          transition:
            "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 48px 0 rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          right: -10,
          top: -10,
          fontSize: "0.75rem",
          fontWeight: 700,
          height: "24px",
          minWidth: "24px",
          padding: "0 6px",
        },
      },
    },
  },
});

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalBroken, setTotalBroken] = useState(0);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [trendData, setTrendData] = useState({
    // items: 5.2,
    // borrowed: -2.3,
    // broken: 1.7,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allResponse, borrowedResponse, brokenResponse] = await Promise.all(
        [
          fetch(endpoints.STATS_BARANG_ALL),
          fetch(endpoints.STATS_BARANG_DIPINJAM),
          fetch(endpoints.STATS_BARANG_RUSAKBERAT),
        ]
      );

      const allResult = await allResponse.json();
      const borrowedResult = await borrowedResponse.json();
      const brokenResult = await brokenResponse.json();

      setTotalItems(allResult.data || 0);
      setTotalBorrowed(borrowedResult.data || 0);
      setTotalBroken(brokenResult.data || 0);

      const borrows = await borrowService.getRecentBorrows();
      setRecentBorrows(borrows);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Gagal mengambil data: ${err.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseSnackbar = (_, reason) =>
    reason !== "clickaway" && setSnackbar((s) => ({ ...s, open: false }));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePasswordUpdate = () => {
    setPasswordDialog(true);
    handleMenuClose();
  };

  return (
    <ProtectedRoute>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          minHeight: "100vh",
          ml: { xs: 1, sm: 2 },
          backgroundColor: "#f8faff",
          borderRadius: { xs: "16px", sm: "24px" },
          boxShadow: "0 0 20px rgba(0,0,0,0.02)",
          minWidth: { xs: "320px", sm: "auto" },
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              minHeight: "100vh",
              background: `linear-gradient(to bottom right, ${alpha(
                theme.palette.background.paper,
                1
              )}, ${alpha(theme.palette.primary.light, 0.05)})`,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "35%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08
                )} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
                zIndex: 0,
              },
            }}
          >
            <Stack
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{ position: "relative", zIndex: 1 }}
            >
              {/* Enhanced Header */}
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "16px",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <DashboardIcon
                        sx={{ fontSize: 28, color: theme.palette.primary.main }}
                      />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Dashboard Inventaris
                    </Typography>
                  </Box>
                  {/* <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        boxShadow: `0 0 0 3px ${alpha(
                          theme.palette.success.main,
                          0.2
                        )}`,
                      }}
                    />
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "0.95rem" }}
                    >
                    </Typography>
                  </Stack> */}
                </Stack>

                {/* Responsive Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: { xs: "flex-end", sm: "flex-end" },
                  }}
                >
                  <Tooltip title="Pengaturan">
                    <IconButton
                      onClick={handleMenuClick}
                      sx={{
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "background.paper" },
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Notifikasi">
                    <IconButton
                      sx={{
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "background.paper" },
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Updated Settings Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: { xs: "200px", sm: "250px" },
                      boxShadow:
                        "rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 20px 40px -4px",
                      "& .MuiMenuItem-root": {
                        px: 2,
                        py: 1.5,
                        typography: "body1",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: isMobile ? "right" : "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: isMobile ? "right" : "right",
                  }}
                >
                  <MenuItem
                    onClick={handlePasswordUpdate}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <LockIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    Update Password
                  </MenuItem>
                </Menu>

                {/* Password Dialog Component */}
                <PasswordDialog
                  open={passwordDialog}
                  setOpen={setPasswordDialog}
                />
              </Box>

              {/* Stats Grid */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  "& > *": {
                    flex: 1,
                    minWidth: { xs: "100%", md: 0 },
                    maxWidth: "100%",
                  },
                }}
              >
                <StatCard
                  icon={InventoryIcon}
                  title="Total Peminjaman"
                  value={totalItems}
                  color="primary"
                />
                <StatCard
                  icon={AccessTimeIcon}
                  title="Sedang Dipinjam"
                  value={totalBorrowed}
                  color="warning"
                />
                <StatCard
                  icon={ErrorOutlineIcon}
                  title="Barang Dimusnahkan"
                  value={totalBroken}
                  color="error"
                />
              </Box>

              {/* BorrowHistoryTable Container */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: { xs: 1.5, sm: 2 },
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.25rem" },
                    }}
                  >
                    Peminjaman Terbaru
                  </Typography>
                </Box>

                <Box
                  sx={{
                    overflowX: "auto",
                    maxWidth: "100%",
                    WebkitOverflowScrolling: "touch",
                    "& .MuiDataGrid-root": {
                      minWidth: { xs: "600px", sm: "800px" },
                      "& .MuiDataGrid-cell": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                >
                  <BorrowHistoryTable
                    borrows={recentBorrows}
                    loading={loading}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        fontSize: { xs: "0.813rem", sm: "0.875rem" },
                      },
                      "& .MuiDataGrid-cell": {
                        fontSize: { xs: "0.75rem", sm: "0.813rem" },
                      },
                    }}
                  />
                </Box>
              </Card>
            </Stack>

            {/* Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{
                vertical: "top",
                horizontal: isMobile ? "center" : "right",
              }}
              sx={{
                width: { xs: "calc(100% - 32px)", sm: "auto" },
                maxWidth: { xs: "400px", sm: "none" },
              }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontWeight: 600,
                  alignItems: "center",
                }}
                iconMapping={{
                  error: <ErrorOutlineIcon sx={{ fontSize: "1.5rem" }} />,
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </ThemeProvider>
      </Box>
    </ProtectedRoute>
  );
}
