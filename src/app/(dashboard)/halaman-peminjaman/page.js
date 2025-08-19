"use client";

import { Box } from "@mui/material";
import PeminjamanContent from "@/components/peminjaman/PeminjamanContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PeminjamanPage() {
  return (
    <ProtectedRoute>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          ml: { xs: 1, sm: 2 },
          borderRadius: { xs: "16px", sm: "24px" },
        }}
      >
        <PeminjamanContent />
      </Box>
    </ProtectedRoute>
  );
}
