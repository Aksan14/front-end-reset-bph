"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authService } from "@/services/authService";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const [formDisplay, setFormDisplay] = useState({
    username: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(
        formData.username,
        formData.password
      );

      if (response.success) {
        router.push("/dashboard");
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const formatNRA = (value) => {
    // Remove any non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Add dots after every 2 digits
    const formatted = numbers.replace(/(\d{2})?(\d{2})?(\d{3})?/, function (
      match,
      p1,
      p2,
      p3
    ) {
      let parts = [];
      if (p1) parts.push(p1);
      if (p2) parts.push(p2);
      if (p3) parts.push(p3);
      return parts.join(".");
    });

    return formatted;
  };

  const getNumericOnly = (value) => {
    return value.replace(/\D/g, "");
  };

  return (
    <Box
      className={roboto.className}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.02) 100%)
        `,
        p: 2,
        position: "relative",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: { xs: 380, sm: 450 },
          p: { xs: 3, sm: 4.5 },
          borderRadius: { xs: 4, sm: 3 },
          backgroundColor: "white",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={{
              width: { xs: 80, sm: 90 },
              height: { xs: 80, sm: 90 },
              mx: "auto",
              mb: 2,
              bgcolor: "#4f46e5",
              boxShadow: "0 8px 25px rgba(79, 70, 229, 0.25)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 12px 35px rgba(79, 70, 229, 0.35)",
                bgcolor: "#4338ca",
              },
            }}
          >
            <InventoryIcon sx={{ fontSize: { xs: 40, sm: 45 } }} />
          </Avatar>
          
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 1,
              color: "#1f2937",
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              letterSpacing: "-0.025em",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Sistem Inventaris
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="NRA"
            value={formDisplay.username}
            onChange={(e) => {
              const formatted = formatNRA(e.target.value);
              const numeric = getNumericOnly(e.target.value);

              // Update display value with dots
              setFormDisplay((prev) => ({
                ...prev,
                username: formatted,
              }));

              // Update actual form data with numeric only
              setFormData((prev) => ({
                ...prev,
                username: numeric,
              }));
            }}
            inputProps={{
              maxLength: 10, // Max length including dots (XX.XX.XXX)
              inputMode: "numeric", // Shows numeric keyboard on mobile
              pattern: "[0-9.]*", // Allows only numbers and dots
            }}
            required  
            sx={{
              mb: 3,
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.95rem", sm: "1rem" },
                fontWeight: 500,
                letterSpacing: "0.01em",
              },
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "0.95rem", sm: "1rem" },
                letterSpacing: "0.01em",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "#d1d5db",
                },
                "&:hover fieldset": {
                  borderColor: "#4f46e5",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: 2,
                  borderColor: "#4f46e5",
                },
              },
            }}
            placeholder="Contoh: 01.01.001"
            helperText="Format: XX.XX.XXX"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: "#6b7280",
                      "&:hover": {
                        color: "#4f46e5",
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 4,
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.95rem", sm: "1rem" },
                fontWeight: 500,
                letterSpacing: "0.01em",
              },
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "0.95rem", sm: "1rem" },
                letterSpacing: "0.01em",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "#d1d5db",
                },
                "&:hover fieldset": {
                  borderColor: "#4f46e5",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: 2,
                  borderColor: "#4f46e5",
                },
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              py: { xs: 1.5, sm: 1.75 },
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              letterSpacing: "0.02em",
              backgroundColor: "#4f46e5",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "#4338ca",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
              },
              "&:active": {
                transform: "translateY(0px)",
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af",
                transform: "none",
                boxShadow: "none",
              },
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
