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
  Container,
  Avatar,
  Divider,
  Chip,
  Grid,
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SparklineIcon from "@mui/icons-material/ShowChart";
import Image from "next/image";
import { useState, useEffect } from "react";
import { borrowService } from "@/services/borrowService"; // Restored original import
import BorrowHistoryTable from "@/components/dashboard/BorrowHistoryTable"; // Restored original import
import { endpoints } from "@/config/api"; // Restored original import
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import PasswordDialog from "@/components/PasswordDialog"; // Restored original import
import Cookies from "js-cookie";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Enhanced StatCard Component with Premium Styling
const StatCard = ({ icon: Icon, title, value, color = "primary", trend = null, subtitle = "" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        p: { xs: 2.5, sm: 3, md: 3.5 },
        borderRadius: { xs: 2, sm: 2.5, md: 3 },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].light,
          0.12
        )} 0%, ${alpha(theme.palette[color].main, 0.03)} 50%, ${alpha(
          theme.palette.background.paper,
          0.95
        )} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.08)}`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          opacity: 0.6,
        },
        "&:hover": {
          transform: { xs: "none", md: "translateY(-12px) scale(1.02)" },
          boxShadow: `0 25px 50px -12px ${alpha(
            theme.palette[color].main,
            0.25
          )}`,
          "& .stat-icon": {
            transform: "scale(1.15) rotate(8deg)",
            background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
            color: "#fff",
            boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.4)}`,
          },
          "& .stat-value": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      <Stack
        spacing={{ xs: 2.5, sm: 3, md: 3.5 }}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box
            className="stat-icon"
            sx={{
              p: { xs: 1.8, sm: 2, md: 2.2 },
              width: "fit-content",
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.15)}`,
            }}
          >
            <Icon sx={{ fontSize: { xs: 26, sm: 30, md: 34 } }} />
          </Box>
          
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                bgcolor: trend > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
                fontSize: "0.75rem",
                "& .MuiChip-icon": {
                  fontSize: "1rem",
                },
              }}
            />
          )}
        </Box>

        <Box>
          <Typography
            variant="h3"
            className="stat-value"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
              background: `linear-gradient(135deg, ${theme.palette[color].dark}, ${theme.palette[color].main}, ${theme.palette[color].light})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: { xs: 0.5, sm: 1 },
              transition: "all 0.3s ease",
              letterSpacing: "-1px",
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.15rem" },
              color: alpha(theme.palette[color].dark, 0.8),
              fontWeight: 600,
              mb: subtitle ? 0.5 : 0,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                color: alpha(theme.palette.text.secondary, 0.7),
                fontWeight: 400,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
      color: "#0f172a",
      letterSpacing: "-1px",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 700,
      color: "#1e293b",
      letterSpacing: "-0.5px",
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      color: "#334155",
      letterSpacing: "-0.3px",
      lineHeight: 1.4,
    },
    body1: {
      color: "#64748b",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#0369a1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    error: {
      main: "#dc2626",
      light: "#f87171",
      dark: "#b91c1c",
    },
    success: {
      main: "#059669",
      light: "#34d399",
      dark: "#047857",
    },
    info: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
    },
    warning: {
      main: "#d97706",
      light: "#fbbf24",
      dark: "#b45309",
    },
    background: {
      default: "#f7f8fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    divider: "rgba(0,0,0,0.06)",
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.03)",
    "0px 4px 8px rgba(0,0,0,0.04)",
    "0px 8px 16px rgba(0,0,0,0.05)",
    "0px 12px 24px rgba(0,0,0,0.06)",
    "0px 16px 32px rgba(0,0,0,0.07)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f7f8fa",
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.05)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 20px 60px -10px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          right: -8,
          top: -8,
          fontSize: "0.75rem",
          fontWeight: 700,
          height: "20px",
          minWidth: "20px",
          padding: "0 6px",
          borderRadius: "10px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.75rem",
          height: "24px",
        },
        label: {
          padding: "0 8px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          fontWeight: 600,
          boxShadow: "none",
          textTransform: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "8px",
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
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nra: "",
    password: "",
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);

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

  const handleCreateUser = () => {
    setCreateUserDialog(true);
    handleMenuClose();
  };

  const handleCreateUserSubmit = async () => {
    if (!newUserData.nra || !newUserData.password) {
      setSnackbar({
        open: true,
        message: "NRA dan Password harus diisi",
        severity: "error",
      });
      return;
    }

    try {
      setCreateUserLoading(true);
      const response = await fetch(endpoints.ADMIN_CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
        body: JSON.stringify(newUserData),
      });

      const result = await response.json();

      if (response.ok && result.code === 200) {
        setSnackbar({
          open: true,
          message: result.message || "User berhasil dibuat",
          severity: "success",
        });
        setCreateUserDialog(false);
        setNewUserData({ nra: "", password: "" });
      } else {
        throw new Error(result.message || "Gagal membuat user");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Terjadi kesalahan saat membuat user",
        severity: "error",
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          minHeight: "100vh",
          ml: { xs: 1, sm: 2 },
          backgroundColor: "#f7f8fa",
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
                  <MenuItem
                    onClick={handleCreateUser}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    Create User
                  </MenuItem>
                </Menu>

                {/* Password Dialog Component */}
                <PasswordDialog
                  open={passwordDialog}
                  setOpen={setPasswordDialog}
                />

                {/* Create User Dialog */}
                <Dialog
                  open={createUserDialog}
                  onClose={() => setCreateUserDialog(false)}
                  maxWidth="sm"
                  fullWidth
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    },
                  }}
                >
                  <DialogTitle
                    sx={{
                      pb: 1,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 2, // Tambahkan margin bottom agar ada jarak
                    }}
                  >
                    Buat User Baru
                  </DialogTitle>
                  <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3} marginTop={2}>
                      <TextField
                        fullWidth
                        label="NRA"
                        value={newUserData.nra}
                        onChange={(e) =>
                          setNewUserData((prev) => ({
                            ...prev,
                            nra: e.target.value,
                          }))
                        }
                        placeholder="Contoh: 1324013"
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e) =>
                          setNewUserData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Masukkan password"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Stack>
                  </DialogContent>
                  <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                      onClick={() => {
                        setCreateUserDialog(false);
                        setNewUserData({ nra: "", password: "" });
                      }}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleCreateUserSubmit}
                      variant="contained"
                      disabled={createUserLoading}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      {createUserLoading ? "Membuat..." : "Buat User"}
                    </Button>
                  </DialogActions>
                </Dialog>
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
                  title="Total Inventaris"
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
