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
        bgcolor: "rgba(248, 250, 252, 0.2)", // More transparent background
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: { xs: "150%", sm: "100%" },
          height: { xs: "150%", sm: "100%" },
          backgroundImage: "url('/images/coconut-logo.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 0.3, // Increased logo visibility further
          transform: {
            xs: "translate(-50%, -50%) rotate(-15deg) scale(0.8)",
            sm: "translate(-50%, -50%) rotate(-15deg)",
          },
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: { xs: 320, sm: 400 },
          p: { xs: 2.5, sm: 4 },
          border: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.08)", // Even more transparent border
          borderRadius: { xs: 3, sm: 2 },
          backgroundColor: "rgba(255, 255, 255, 0.45)", // More transparent card
          backdropFilter: "blur(20px)", // Increased blur effect
          position: "relative",
          zIndex: 1,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)", // Lighter shadow
        }}
      >
        {/* Update Avatar style */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: { xs: 70, sm: 80 },
              height: { xs: 70, sm: 80 },
              mx: "auto",
              bgcolor: "primary.main",
              boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}25`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05) rotate(5deg)",
                boxShadow: (theme) => `0 12px 32px ${theme.palette.primary.main}40`,
              },
            }}
          >
            <InventoryIcon sx={{ fontSize: { xs: 35, sm: 40 } }} />
          </Avatar>
        </Box>

        {/* Update Typography styles */}
        <Typography
          variant="h5"
          fontWeight={700}
          textAlign="center"
          sx={{
            mb: 1,
            color: "primary.main",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            letterSpacing: "-0.01em", // Modern typography
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Selamat Datang
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{
            mb: 3,
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            letterSpacing: "0.01em", // Modern typography
            fontWeight: 300, // Lighter weight for modern look
          }}
        >
          Silakan masuk untuk melanjutkan
        </Typography>

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
              mb: 2,
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 400,
                letterSpacing: "0.01em",
              },
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
                letterSpacing: "0.01em",
                borderRadius: 1.5, // Modern rounded corners
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
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderRadius: 1.5,
              textTransform: "none", // Modern button text
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
