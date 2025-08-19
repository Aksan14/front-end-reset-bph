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
  ListItemIcon,
  Paper,
  Pagination,
  TableContainer,
  Menu,
  MenuItem,
  IconButton,
  InputAdornment,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import { jsPDF } from "jspdf";
import { barangService } from "@/services/barangService";
import {
  createPeminjaman,
  updatePengembalian,
  getPeminjaman,
} from "@/services/peminjamanService";
import { API_BASE_URL } from "@/config/api";

export default function PeminjamanContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // State utama
  const [barangList, setBarangList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk menu aksi mobile
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeminjamanForAction, setSelectedPeminjamanForAction] = useState(null);

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
  const itemsPerPage = isMobile ? 6 : isTablet ? 9 : 12;

  // Handle menu aksi mobile
  const handleMenuOpen = (event, peminjaman) => {
    setAnchorEl(event.currentTarget);
    setSelectedPeminjamanForAction(peminjaman);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPeminjamanForAction(null);
  };

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
    if (e.key === "Enter") {
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
    setSelectedBarang(barang);
    setOpenFormDialog(true);
  };

  // Buka dialog detail barang
  const handleOpenDetail = (peminjaman) => {
    setSelectedPeminjaman(peminjaman);
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
    <Box
      sx={{
        width: "100%",
        minWidth: {
          xs: "100%",
          sm: "600px",
          md: "800px",
        },
        bgcolor: { xs: "#f8fafc", sm: "transparent" },
        px: { xs: 0, sm: 2 },
        py: { xs: 1, sm: 2 },
        mt: { xs: 1, sm: 2 },
        ml: {
          xs: 0,
          sm: "60px",
          md: "0px",
        },
        mr: { xs: 0, sm: 2 },
        overflowX: "auto",
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Manajemen Peminjaman
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Kelola peminjaman barang inventaris
          </Typography>
        </Box>

        {/* Search Section */}
        <Card
          elevation={0}
          sx={{
            mx: { xs: 2, sm: 0 },
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            bgcolor: "white",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={handleSearch}
                      edge="start"
                      size="small"
                    >
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setSearchQuery("");
                        fetchBarangTersedia();
                      }}
                      edge="end"
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  bgcolor: "background.paper",
                  "& fieldset": {
                    borderColor: "divider",
                  },
                },
              }}
            />
          </Box>
        </Card>

        {/* Available Items Grid */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Daftar Barang Tersedia
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={isMobile ? 1 : 2}>
                {currentItems.map((barang) => (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2.4}
                    key={barang.id}
                    sx={{ display: "flex" }}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" },
                        cursor: "pointer",
                      }}
                      onClick={() => handleSelectBarang(barang)}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          pt: "75%",
                          bgcolor: "background.neutral",
                        }}
                      >
                        <Avatar
                          src={
                            barang.Foto
                              ? `${API_BASE_URL}${barang.Foto}`
                              : undefined
                          }
                          variant="square"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: barang.Foto ? "transparent" : "#e2e8f0",
                          }}
                        >
                          {!barang.Foto && (
                            <ImageIcon sx={{ fontSize: isMobile ? 32 : 40 }} />
                          )}
                        </Avatar>
                      </Box>
                      <CardContent
                        sx={{
                          p: isMobile ? 1 : 2,
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: isMobile ? "0.875rem" : "1rem",
                            fontWeight: 500,
                            mb: 0.5,
                            lineHeight: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {barang.Namabarang}
                        </Typography>
                        <Box sx={{ mt: "auto" }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                fontSize: isMobile ? "0.75rem" : "0.813rem",
                              }}
                            >
                              {barang.Jumlah} {barang.Satuan}
                            </Typography>
                            <Chip
                              label={barang.Kondisi}
                              size={isMobile ? "small" : "medium"}
                              color={
                                barang.Kondisi === "Baik"
                                  ? "success"
                                  : "warning"
                              }
                              sx={{
                                height: isMobile ? 22 : 24,
                                "& .MuiChip-label": {
                                  px: 1,
                                  fontSize: isMobile ? "0.6875rem" : "0.75rem",
                                },
                              }}
                            />
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box
                sx={{
                  py: 2,
                  mt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            )}
          </Box>
        </Card>

        {/* Borrowing History */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Riwayat Peminjaman
            </Typography>
          </Box>

          <TableContainer
            sx={{
              maxHeight: isMobile ? 400 : 600,
              overflow: "auto",
            }}
          >
            <Table size={isMobile ? "small" : "medium"} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Barang
                  </TableCell>
                  <TableCell>Peminjam</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Tanggal Pinjam
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    Rencana Kembali
                  </TableCell>
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
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        <Typography
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.nama_barang}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: isMobile ? 120 : "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.nama_peminjam}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        {formatDateDisplay(p.tanggal_pinjam)}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        {formatDateDisplay(p.rencana_kembali)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            p.tanggal_kembali ? "Dikembalikan" : "Dipinjam"
                          }
                          color={p.tanggal_kembali ? "success" : "warning"}
                          size={isMobile ? "small" : "medium"}
                        />
                      </TableCell>
                      <TableCell>
                        {isMobile ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, p)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl) && selectedPeminjamanForAction?.id === p.id}
                              onClose={handleMenuClose}
                            >
                              <MenuItem
                                onClick={() => {
                                  generatePDF(p);
                                  handleMenuClose();
                                }}
                              >
                                <ListItemIcon>
                                  <PrintIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Cetak Laporan</ListItemText>
                              </MenuItem>
                              {!p.tanggal_kembali && (
                                <MenuItem
                                  onClick={() => {
                                    setSelectedPeminjaman(p);
                                    setOpenReturnDialog(true);
                                    handleMenuClose();
                                  }}
                                >
                                  <ListItemIcon>
                                    <RefreshIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText>Kembalikan Barang</ListItemText>
                                </MenuItem>
                              )}
                            </Menu>
                          </>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              flexWrap: "nowrap",
                            }}
                          >
                            <Tooltip title="Cetak">
                              <IconButton
                                size="small"
                                onClick={() => generatePDF(p)}
                              >
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
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                Kembalikan
                              </Button>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: { xs: 6, sm: 7 } }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || message}
        </Alert>
      </Snackbar>

      {/* Form Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            py: isMobile ? 1 : 2,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            fontWeight: 600,
          }}
        >
          Form Peminjaman
        </DialogTitle>
        <DialogContent dividers sx={{ pt: isMobile ? 1 : 2 }}>
          {selectedBarang && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Detail Barang
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    <strong>Nama:</strong> {selectedBarang.Namabarang}
                  </Typography>
                  <Typography>
                    <strong>Jumlah:</strong> {selectedBarang.Jumlah}{" "}
                    {selectedBarang.Satuan}
                  </Typography>
                  <Typography>
                    <strong>Kondisi:</strong> {selectedBarang.Kondisi}
                  </Typography>
                  <Typography>
                    <strong>Keterangan:</strong>{" "}
                    {selectedBarang.Keterangan || "-"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Data Peminjaman
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Nama Peminjam"
                    variant="outlined"
                    name="nama_peminjam"
                    value={formData.nama_peminjam}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Tanggal Pinjam"
                    variant="outlined"
                    name="tanggal_pinjam"
                    type="date"
                    value={formData.tanggal_pinjam}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    label="Rencana Kembali"
                    variant="outlined"
                    name="rencana_kembali"
                    type="date"
                    value={formData.rencana_kembali}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    label="Keterangan"
                    variant="outlined"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Stack>
              </Grid>
            </Grid>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              size={isMobile ? "medium" : "large"}
              fullWidth
            >
              Simpan Peminjaman
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenFormDialog(false)}
              size={isMobile ? "medium" : "large"}
              fullWidth
            >
              Batal
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog
        open={openReturnDialog}
        onClose={() => setOpenReturnDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            py: isMobile ? 1 : 2,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            fontWeight: 600,
          }}
        >
          Pengembalian Barang
        </DialogTitle>
        <DialogContent dividers sx={{ pt: isMobile ? 1 : 2 }}>
          <Stack spacing={2}>
            <Typography>
              Anda akan mengembalikan barang{" "}
              <strong>{selectedPeminjaman?.nama_barang}</strong>. Pastikan
              barang dalam kondisi baik sebelum dikembalikan.
            </Typography>

            <TextField
              label="Tanggal Kembali"
              variant="outlined"
              name="tanggal_kembali"
              type="date"
              value={pengembalianData.tanggal_kembali}
              onChange={(e) =>
                setPengembalianData({
                  ...pengembalianData,
                  tanggal_kembali: e.target.value,
                })
              }
              size={isMobile ? "small" : "medium"}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Kondisi Barang"
              variant="outlined"
              name="kondisi"
              select
              value={pengembalianData.kondisi}
              onChange={(e) =>
                setPengembalianData({
                  ...pengembalianData,
                  kondisi: e.target.value,
                })
              }
              size={isMobile ? "small" : "medium"}
              fullWidth
              required
            >
              <MenuItem value="baik">Baik</MenuItem>
              <MenuItem value="rusak ringan">Rusak Ringan</MenuItem>
              <MenuItem value="rusak berat">Rusak Berat</MenuItem>
            </TextField>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                onClick={handlePengembalian}
                size={isMobile ? "medium" : "large"}
                fullWidth
              >
                Konfirmasi Pengembalian
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenReturnDialog(false)}
                size={isMobile ? "medium" : "large"}
                fullWidth
              >
                Batal
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            py: isMobile ? 1 : 2,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            fontWeight: 600,
          }}
        >
          Detail Peminjaman
        </DialogTitle>
        <DialogContent dividers sx={{ pt: isMobile ? 1 : 2 }}>
          <Stack spacing={2}>
            <Typography>
              <strong>Nama Barang:</strong> {selectedPeminjaman?.nama_barang}
            </Typography>
            <Typography>
              <strong>Peminjam:</strong> {selectedPeminjaman?.nama_peminjam}
            </Typography>
            <Typography>
              <strong>Tanggal Pinjam:</strong>{" "}
              {formatDateDisplay(selectedPeminjaman?.tanggal_pinjam)}
            </Typography>
            <Typography>
              <strong>Rencana Kembali:</strong>{" "}
              {formatDateDisplay(selectedPeminjaman?.rencana_kembali)}
            </Typography>
            <Typography>
              <strong>Tanggal Kembali:</strong>{" "}
              {selectedPeminjaman?.tanggal_kembali
                ? formatDateDisplay(selectedPeminjaman.tanggal_kembali)
                : "Belum dikembalikan"}
            </Typography>
            <Typography>
              <strong>Kondisi:</strong> {selectedPeminjaman?.kondisi || "-"}
            </Typography>
            <Typography>
              <strong>Keterangan:</strong>{" "}
              {selectedPeminjaman?.keterangan || "-"}
            </Typography>

            <Button
              variant="contained"
              onClick={() => generatePDF(selectedPeminjaman)}
              size={isMobile ? "medium" : "large"}
              startIcon={<PrintIcon />}
              sx={{ alignSelf: "flex-start", mt: 2 }}
            >
              Cetak Laporan
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            variant="outlined"
            size={isMobile ? "medium" : "large"}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}