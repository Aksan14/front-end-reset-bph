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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          Login
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
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            required
            sx={{ mb: 2 }}
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
            sx={{ py: 1.5 }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
