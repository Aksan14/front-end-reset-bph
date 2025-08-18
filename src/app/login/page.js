"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { endpoints } from "@/config/api";
import { setAuthCookie } from "@/utils/cookies";

export default function LoginPage() {
  const router = useRouter();
  const [nra, setNra] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Input validation
      if (!nra || !password) {
        throw new Error("NRA dan password harus diisi");
      }

      const response = await fetch(endpoints.ADMIN_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nra: nra.trim(),
          password: password.trim(),
        }),
        credentials: "include",
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan pada server");
      }

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Format response tidak valid");
      }

      if (data.code !== 200) {
        throw new Error(data.message || "Autentikasi gagal");
      }

      // Check if token exists in data field
      if (!data.data || typeof data.data !== "string") {
        throw new Error("Token tidak valid");
      }

      // Set auth cookie with the JWT token
      await setAuthCookie({
        token: data.data,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Gagal melakukan login");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3 }}>
          Login Admin
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="NRA"
            variant="outlined"
            fullWidth
            margin="normal"
            value={nra}
            onChange={(e) => setNra(e.target.value)}
            required
            sx={{ mb: 2 }}
            inputProps={{
              maxLength: 20,
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            inputProps={{
              maxLength: 50,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ width: "100%" }}
            elevation={6}
          >
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
