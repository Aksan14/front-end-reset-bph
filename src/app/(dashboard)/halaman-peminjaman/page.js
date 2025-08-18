"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Pagination,
  TableContainer,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { jsPDF } from "jspdf";
import { barangService } from "@/services/barangService";
import {
  createPeminjaman,
  updatePengembalian,
  getPeminjaman,
} from "@/services/peminjamanService";
import { API_BASE_URL } from "@/config/api";
import ProtectedRoute from "@/utils/protect_route";

export default function PeminjamanPage() {
  // State utama
  const [barangList, setBarangList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk form peminjaman
  const [formData, setFormData] = useState({
    barang_id: "",
    nama_peminjam: "",
    tanggal_pinjam: "",
    rencana_kembali: "",
    keterangan: "",
  });

  // State untuk pengembalian
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [pengembalianData, setPengembalianData] = useState({
    tanggal_kembali: "",
    kondisi: "baik",
  });

  // State untuk dialog
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Format tanggal untuk display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID");
  };

  // Format tanggal untuk API
  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  // Ambil data barang
  const fetchBarangTersedia = async () => {
    try {
      setLoading(true);
      const result = await barangService.getAll();
      if (result.success) {
        setBarangList(
          result.data.filter((item) => item.Kondisi !== "Dimusnahkan")
        );
        setMessage("Data barang berhasil dimuat");
        setSnackbarOpen(true);
      } else {
        setBarangList([]);
        setError(result.message || "Gagal mengambil data barang");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setBarangList([]);
      setError(error.message || "Terjadi kesalahan");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle pencarian
  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await barangService.search(searchQuery);
      if (result.success) {
        setBarangList(
          result.data.filter((item) => item.Kondisi !== "Dimusnahkan")
        );
        setCurrentPage(1);
        setMessage("Pencarian berhasil");
        setSnackbarOpen(true);
      } else {
        setBarangList([]);
        setError(result.message || "Pencarian gagal");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setBarangList([]);
      setError("Terjadi kesalahan saat mencari");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load data awal
  useEffect(() => {
    const loadData = async () => {
      try {
        const [peminjamanResult] = await Promise.all([
          getPeminjaman(),
          fetchBarangTersedia(),
        ]);
        setPeminjamanList(peminjamanResult);
      } catch (error) {
        console.error("Error:", error);
        setError("Gagal memuat data");
        setSnackbarOpen(true);
      }
    };
    loadData();
  }, []);

  // Fungsi untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = barangList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(barangList.length / itemsPerPage);

  // Handle perubahan form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pilih barang untuk dipinjam
  const handleSelectBarang = (barang) => {
    setFormData({
      ...formData,
      barang_id: barang.id,
    });
    setOpenFormDialog(true);
  };

  // Buka dialog detail barang
  const handleOpenDetail = (barang) => {
    setSelectedBarang(barang);
    setOpenDetailDialog(true);
  };

  // Submit peminjaman
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPeminjaman({
        ...formData,
        tanggal_pinjam: formatDateForAPI(formData.tanggal_pinjam),
        rencana_kembali: formatDateForAPI(formData.rencana_kembali),
      });
      setOpenFormDialog(false);
      await Promise.all([
        fetchBarangTersedia(),
        getPeminjaman().then(setPeminjamanList),
      ]);
      setMessage("Peminjaman berhasil");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Gagal meminjam");
      setSnackbarOpen(true);
    }
  };

  // Handle pengembalian
  const handlePengembalian = async () => {
    try {
      await updatePengembalian(selectedPeminjaman.id, {
        tanggal_kembali: formatDateForAPI(pengembalianData.tanggal_kembali),
        kondisi: pengembalianData.kondisi,
      });
      setOpenReturnDialog(false);
      await Promise.all([
        fetchBarangTersedia(),
        getPeminjaman().then(setPeminjamanList),
      ]);
      setMessage("Pengembalian berhasil");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Gagal mengembalikan");
      setSnackbarOpen(true);
    }
  };

  // Generate PDF
  const generatePDF = (peminjaman) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 136, 229);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("LAPORAN PEMINJAMAN", 105, 20, { align: "center" });

    // Content
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 40;
    const addRow = (label, value) => {
      doc.text(`${label}:`, 20, y);
      doc.text(value, 70, y);
      y += 10;
    };

    addRow("Nama Barang", peminjaman.nama_barang);
    addRow("Peminjam", peminjaman.nama_peminjam);
    addRow("Tanggal Pinjam", formatDateDisplay(peminjaman.tanggal_pinjam));
    addRow("Rencana Kembali", formatDateDisplay(peminjaman.rencana_kembali));
    addRow(
      "Tanggal Kembali",
      peminjaman.tanggal_kembali
        ? formatDateDisplay(peminjaman.tanggal_kembali)
        : "Belum dikembalikan"
    );
    addRow("Kondisi", peminjaman.kondisi || "-");
    addRow("Keterangan", peminjaman.keterangan || "-");

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 105, 290, {
      align: "center",
    });

    doc.save(`Laporan_Peminjaman_${peminjaman.id}.pdf`);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} fontWeight="600">
          Manajemen Peminjaman Barang
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={error ? "error" : "success"}
          >
            {error || message}
          </Alert>
        </Snackbar>

        {/* Daftar Barang Tersedia */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography variant="h6">
              Daftar Barang Tersedia
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                label="Cari Barang"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ width: { xs: '100%', sm: 300 } }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : barangList.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography>Tidak ada barang tersedia</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {currentItems.map((barang) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={barang.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                    >
                      <Box
                        sx={{
                          height: 180,
                          position: "relative",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpenDetail(barang)}
                      >
                        <img
                          src={
                            barang.Foto
                              ? `${API_BASE_URL}${barang.Foto}`
                              : "/placeholder-item.png"
                          }
                          alt={barang.Namabarang}
                          style={{
                            width: "30vh",
                            height: "30vh",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = "/placeholder-item.png";
                          }}
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => handleOpenDetail(barang)}
                        >
                          {barang.Namabarang}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {barang.Kategori}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            {barang.Jumlah} {barang.Satuan}
                          </Typography>
                          <Chip
                            label={barang.Kondisi}
                            size="small"
                            sx={{
                              backgroundColor:
                                barang.Kondisi === "Baik"
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(244, 67, 54, 0.1)",
                              color:
                                barang.Kondisi === "Baik"
                                  ? "#2E7D32"
                                  : "#C62828",
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Card>

        {/* Riwayat Peminjaman */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
          <Typography variant="h6" mb={2}>
            Riwayat Peminjaman
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Barang</TableCell>
                  <TableCell>Peminjam</TableCell>
                  <TableCell>Tanggal Pinjam</TableCell>
                  <TableCell>Rencana Kembali</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peminjamanList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Tidak ada data peminjaman
                    </TableCell>
                  </TableRow>
                ) : (
                  peminjamanList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nama_barang}</TableCell>
                      <TableCell>{p.nama_peminjam}</TableCell>
                      <TableCell>
                        {formatDateDisplay(p.tanggal_pinjam)}
                      </TableCell>
                      <TableCell>
                        {formatDateDisplay(p.rencana_kembali)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            p.tanggal_kembali ? "Dikembalikan" : "Dipinjam"
                          }
                          color={p.tanggal_kembali ? "success" : "warning"}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Cetak">
                            <IconButton onClick={() => generatePDF(p)}>
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!p.tanggal_kembali && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedPeminjaman(p);
                                setOpenReturnDialog(true);
                              }}
                            >
                              Kembalikan
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Dialog Form Peminjaman */}
        <Dialog
          open={openFormDialog}
          onClose={() => setOpenFormDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Form Peminjaman Barang</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="Nama Barang"
                value={selectedBarang?.Namabarang || ""}
                fullWidth
                sx={{ mb: 2 }}
                disabled
              />
              <TextField
                label="Nama Peminjam"
                name="nama_peminjam"
                value={formData.nama_peminjam}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                type="date"
                label="Tanggal Pinjam"
                name="tanggal_pinjam"
                value={formData.tanggal_pinjam}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                type="date"
                label="Rencana Kembali"
                name="rencana_kembali"
                value={formData.rencana_kembali}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
              <DialogActions>
                <Button onClick={() => setOpenFormDialog(false)}>Batal</Button>
                <Button
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Simpan
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Dialog Pengembalian */}
        <Dialog
          open={openReturnDialog}
          onClose={() => setOpenReturnDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Pengembalian Barang</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detail Peminjaman
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Nama Barang"
                    secondary={selectedPeminjaman?.nama_barang}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Peminjam"
                    secondary={selectedPeminjaman?.nama_peminjam}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tanggal Pinjam"
                    secondary={formatDateDisplay(
                      selectedPeminjaman?.tanggal_pinjam
                    )}
                  />
                </ListItem>
              </List>
            </Box>

            <TextField
              type="date"
              label="Tanggal Kembali"
              name="tanggal_kembali"
              value={pengembalianData.tanggal_kembali}
              onChange={(e) =>
                setPengembalianData({
                  ...pengembalianData,
                  tanggal_kembali: e.target.value,
                })
              }
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Kondisi Barang"
              name="kondisi"
              value={pengembalianData.kondisi}
              onChange={(e) =>
                setPengembalianData({
                  ...pengembalianData,
                  kondisi: e.target.value,
                })
              }
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="baik">Baik</MenuItem>
              <MenuItem value="rusak">Rusak</MenuItem>
              <MenuItem value="hilang">Hilang</MenuItem>
            </TextField>
            <DialogActions>
              <Button onClick={() => setOpenReturnDialog(false)}>Batal</Button>
              <Button variant="contained" onClick={handlePengembalian}>
                Simpan
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>

        {/* Dialog Detail Barang */}
        <Dialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Detail Barang</DialogTitle>
          <DialogContent>
            {selectedBarang && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 300,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={
                        selectedBarang.Foto
                          ? `${API_BASE_URL}${selectedBarang.Foto}`
                          : "/placeholder-item.png"
                      }
                      alt={selectedBarang.Namabarang}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Nama Barang"
                        secondary={selectedBarang.Namabarang || "-"}
                        secondaryTypographyProps={{ variant: "h6" }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Kategori"
                        secondary={selectedBarang.Kategori || "-"}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Jumlah"
                        secondary={`${selectedBarang.Jumlah || 0} ${
                          selectedBarang.Satuan || ""
                        }`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Kondisi"
                        secondary={
                          <Chip
                            label={selectedBarang.Kondisi}
                            sx={{
                              backgroundColor:
                                selectedBarang.Kondisi === "Baik"
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(244, 67, 54, 0.1)",
                              color:
                                selectedBarang.Kondisi === "Baik"
                                  ? "#2E7D32"
                                  : "#C62828",
                            }}
                          />
                        }
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Deskripsi"
                        secondary={
                          selectedBarang.Deskripsi || "Tidak ada deskripsi"
                        }
                      />
                    </ListItem>
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        handleSelectBarang(selectedBarang);
                        setOpenDetailDialog(false);
                      }}
                    >
                      Pinjam Barang Ini
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}