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
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { jsPDF } from "jspdf";
import { barangService } from "@/services/barangService";
import {
  createPeminjaman,
  updatePengembalian,
  getPeminjaman,
  getBarangTersedia,
} from "@/services/peminjamanService";
import { API_BASE_URL, endpoints } from "@/config/api";
import Cookies from 'js-cookie';

// Available categories
const CATEGORIES = [
  "Semua",
  "Buku",
  "Algo",
  "Dapur",
  "Inventaris Coconut"
];

export default function PeminjamanContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // State utama
  const [barangList, setBarangList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalBarangList, setOriginalBarangList] = useState([]);

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
  const itemsPerPage = isMobile ? 6 : isTablet ? 9 : 10;

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
    if (!dateStr) {
      // If no date is provided, return today's date
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    
    // Try to parse the date string
    const parts = dateStr.split(/[-T]/);
    if (parts.length >= 3) {
      // If the date is already in YYYY-MM-DD format
      const [year, month, day] = parts;
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Fallback: try to parse the string directly
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If all parsing fails, return today's date
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Ambil data barang tersedia
  const fetchBarangTersedia = async () => {
    try {
      setLoading(true);
      const data = await getBarangTersedia();
      
      // Transform data to match component's expected structure
      const transformedData = data.map(item => ({
        id: item.id,
        Namabarang: item.nama_barang,
        Kategori: item.kategori,
        Satuan: item.satuan,
        Kondisi: item.kondisi,
        Foto: item.foto // Using the foto field from the API
      }));
      
      setBarangList(transformedData);
      setOriginalBarangList(transformedData);
      setMessage("Data barang tersedia berhasil dimuat");
      setSnackbarOpen(true);
    } catch (error) {
      setBarangList([]);
      setOriginalBarangList([]);
      setError(error.message || "Gagal mengambil data barang tersedia");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Combined filter function
  const filterBarang = (searchValue, category) => {
    try {
      let filtered = [...originalBarangList];

      // Apply search filter
      if (searchValue.trim()) {
        filtered = filtered.filter(item =>
          item.Namabarang?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.Kategori?.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      // Apply category filter
      if (category && category !== "Semua") {
        filtered = filtered.filter(item => item.Kategori === category);
      }

      setBarangList(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error filtering:", error);
      setError("Terjadi kesalahan saat memfilter data");
      setSnackbarOpen(true);
    }
  };

  // Handle pencarian
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterBarang(value, selectedCategory);
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
        // Fetch barang tersedia first
        await fetchBarangTersedia();
        
        // Then fetch peminjaman data
        const peminjamanResult = await getPeminjaman();
        setPeminjamanList(peminjamanResult);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Gagal memuat data");
        setSnackbarOpen(true);
      }
    };
    loadData();
  }, []);

  // Effect untuk handle perubahan kategori
  useEffect(() => {
    filterBarang(searchQuery, selectedCategory);
  }, [selectedCategory]);

  // Fungsi untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  console.log('BarangList length:', barangList.length); // Debugging log
  console.log('Current page:', currentPage);
  console.log('Items per page:', itemsPerPage);
  const currentItems = barangList.slice(indexOfFirstItem, indexOfLastItem);
  console.log('Current items:', currentItems); // Debugging log
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
    setSelectedBarang(barang); // Fixed the function name
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

  // Add delete handler function
  const handleDelete = async (id) => {
    try {
      if (!window.confirm('Apakah Anda yakin ingin menghapus peminjaman ini?')) {
        return;
      }

      const response = await fetch(endpoints.PEMINJAMAN_DELETE(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      });

      if (response.ok) {
        // Refresh peminjaman list using existing getPeminjaman function
        const updatedList = await getPeminjaman();
        setPeminjamanList(updatedList);
        
        // Use existing snackbar state
        setMessage('Peminjaman berhasil dihapus');
        setSnackbarOpen(true);
      } else {
        throw new Error('Gagal menghapus peminjaman');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Gagal menghapus peminjaman');
      setSnackbarOpen(true);
    }
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
          <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setSearchQuery("");
                        filterBarang("", selectedCategory);
                      }}
                      edge="end"
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  bgcolor: "background.paper",
                  "& fieldset": {
                    borderColor: "divider",
                  },
                },
              }}
            >
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  filterBarang(searchQuery, e.target.value);
                }}
                label="Kategori"
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              <Grid 
                container 
                spacing={isMobile ? 2 : 2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr', // 1 column for mobile
                    sm: 'repeat(3, 1fr)', // 3 columns for tablet
                    md: 'repeat(4, 1fr)', // 4 columns for desktop
                    lg: 'repeat(5, 1fr)', // 5 columns for large screens
                  },
                  gap: { xs: 2, sm: 2 },
                }}
              >
                {currentItems.map((barang) => (
                  <Card
                    key={barang.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' },
                      cursor: 'pointer',
                      height: '100%',
                    }}
                    onClick={() => handleSelectBarang(barang)}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: {
                          xs: '280px', // Taller for mobile
                          sm: '240px', // Taller for tablet
                          md: '260px', // Taller for desktop
                          lg: '280px'  // Taller for large screens
                        },
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Avatar
                        src={barang.Foto ? `${API_BASE_URL}${barang.Foto}` : 
                             barang.foto ? `${API_BASE_URL}${barang.foto}` : undefined}
                        alt={barang.Namabarang}
                        variant="square"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: barang.Foto ? 'transparent' : '#e2e8f0',
                          '& img': {
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%',
                            padding: '12px', // Slightly larger padding
                          }
                        }}
                      >
                        {!barang.Foto && (
                          <ImageIcon 
                            sx={{ 
                              fontSize: {
                                xs: 64, // Larger icon for mobile
                                sm: 56, // Larger icon for tablet
                                md: 64  // Larger icon for desktop
                              }
                            }} 
                          />
                        )}
                      </Avatar>
                    </Box>
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2 },
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: {
                            xs: '1rem', // Larger font for mobile
                            sm: '0.9rem',
                            md: '1rem',
                          },
                          fontWeight: 500,
                          mb: 1,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: {
                            xs: 'auto', // Auto height for mobile
                            sm: '2.6em',
                          },
                        }}
                      >
                        {barang.Namabarang}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: {
                                xs: '0.875rem', // Larger font for mobile
                                sm: '0.813rem',
                                md: '0.875rem',
                              },
                            }}
                          >
                            {barang.Jumlah} {barang.Satuan}
                          </Typography>
                          <Chip
                            label={barang.Kondisi}
                            size={isMobile ? "medium" : "small"}
                            color={barang.Kondisi === "Baik" ? "success" : "warning"}
                            sx={{
                              height: { xs: 28, sm: 24 }, // Larger chip for mobile
                              '& .MuiChip-label': {
                                px: 1.5,
                                fontSize: {
                                  xs: '0.875rem', // Larger font for mobile
                                  sm: '0.75rem',
                                  md: '0.8125rem',
                                },
                              },
                            }}
                          />
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
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
                  <TableCell>Peminjam</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Barang
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Tanggal Pinjam
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peminjamanList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Tidak ada data peminjaman
                    </TableCell>
                  </TableRow>
                ) : (
                  peminjamanList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {p.nama_peminjam}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Typography variant="body2">{p.nama_barang}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        <Typography variant="body2">
                          {formatDateDisplay(p.tanggal_pinjam)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.tanggal_kembali ? "Dikembalikan" : "Dipinjam"}
                          color={p.tanggal_kembali ? "success" : "warning"}
                          size="small"
                          sx={{ minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isMobile ? (
                            // Mobile view with menu
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, p)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedPeminjamanForAction?.id === p.id}
                                onClose={handleMenuClose}
                              >
                                {p.tanggal_kembali && (
                                  <MenuItem dense onClick={() => {
                                    handleOpenDetail(p);
                                    handleMenuClose();
                                  }}>
                                    Lihat Detail
                                  </MenuItem>
                                )}
                                {!p.tanggal_kembali && (
                                  <MenuItem dense onClick={() => {
                                    setSelectedPeminjaman(p);
                                    setOpenReturnDialog(true);
                                    handleMenuClose();
                                  }}>
                                    Kembalikan Barang
                                  </MenuItem>
                                )}
                                <MenuItem dense onClick={() => {
                                  generatePDF(p);
                                  handleMenuClose();
                                }}>
                                  Cetak Laporan
                                </MenuItem>
                                {p.tanggal_kembali && (
                                  <MenuItem 
                                    dense 
                                    onClick={() => {
                                      handleDelete(p.id);
                                      handleMenuClose();
                                    }}
                                    sx={{ color: 'error.main' }}
                                  >
                                    Hapus
                                  </MenuItem>
                                )}
                              </Menu>
                            </>
                          ) : (
                            // Desktop view with all buttons
                            <>
                              {!p.tanggal_kembali && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedPeminjaman(p);
                                    setOpenReturnDialog(true);
                                  }}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2 
                                  }}
                                >
                                  Kembalikan
                                </Button>
                              )}
                              {p.tanggal_kembali && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="info"
                                  onClick={() => handleOpenDetail(p)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2 
                                  }}
                                >
                                  Detail
                                </Button>
                              )}
                              {p.tanggal_kembali && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(p.id)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2 
                                  }}
                                >
                                  Hapus
                                </Button>
                              )}
                            </>
                          )}
                        </Stack>
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
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            p: 3,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box 
            component="span" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              flex: 1 
            }}
          >
            Form Peminjaman Barang
          </Box>
          {isMobile && (
            <IconButton
              onClick={() => setOpenFormDialog(false)}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent 
          sx={{ 
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.default' 
          }}
        >
          {selectedBarang && (
            <Grid container spacing={3}>
              {/* Left Side - Item Details with Larger Image */}
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Large Image Container */}
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: { 
                      xs: '340px', // Larger for mobile
                      sm: '380px', // Larger for tablet
                      md: '420px', // Larger for desktop
                      lg: '460px'  // Larger for large screens
                    },
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Avatar
                      src={selectedBarang.Foto ? `${API_BASE_URL}${selectedBarang.Foto}` : undefined}
                      variant="square"
                      sx={{
                        width: '100%',
                        height: '100%',
                        '& img': {
                          objectFit: 'contain',
                          p: 3 // Larger padding in dialog
                        }
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 80 }} /> {/* Larger placeholder icon */}
                    </Avatar>
                  </Box>

                  {/* Item Details in Grid for better mobile layout */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Nama Barang
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedBarang.Namabarang}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Kategori
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedBarang.Kategori || '-'}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Jumlah Tersedia
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedBarang.Jumlah} {selectedBarang.Satuan}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Kondisi
                      </Typography>
                      <Chip 
                        label={selectedBarang.Kondisi}
                        color={selectedBarang.Kondisi === "Baik" ? "success" : "warning"}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right Side - Form with better spacing for mobile */}
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack spacing={2.5}>
                    <TextField
                      label="Nama Peminjam"
                      name="nama_peminjam"
                      value={formData.nama_peminjam}
                      onChange={handleChange}
                      fullWidth
                      required
                      size={isMobile ? "medium" : "small"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.paper'
                        }
                      }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Tanggal Pinjam"
                          name="tanggal_pinjam"
                          type="date"
                          value={formData.tanggal_pinjam}
                          onChange={handleChange}
                          fullWidth
                          required
                          size={isMobile ? "medium" : "small"}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Rencana Kembali"
                          name="rencana_kembali"
                          type="date"
                          value={formData.rencana_kembali}
                          onChange={handleChange}
                          fullWidth
                          required
                          size={isMobile ? "medium" : "small"}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={isMobile ? 3 : 4}
                      size={isMobile ? "medium" : "small"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.paper'
                        }
                      }}
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions 
          sx={{ 
            p: 2.5, 
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOpenFormDialog(false)}
            size="large"
            sx={{ 
              px: 3,
              mr: 1,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main'
              }
            }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            size="large"
            sx={{ 
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Simpan Peminjaman
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Dialog with improved styling */}
      <Dialog
        open={openReturnDialog}
        onClose={() => setOpenReturnDialog(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle
          sx={{
            py: isMobile ? 2 : 3,
            px: { xs: 2, sm: 3 },
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            color: 'white',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 700,
          }}
        >
          Pengembalian Barang
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid',
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                mb: 2 
              }}
            >
              Update untuk pengembalian barang <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{selectedPeminjaman?.nama_barang}</Box>.
              Isi form berikut untuk melanjutkan proses pengembalian.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Tanggal Kembali"
                name="tanggal_kembali"
                type="date"
                value={pengembalianData.tanggal_kembali || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  setPengembalianData({
                    ...pengembalianData,
                    tanggal_kembali: selectedDate || new Date().toISOString().split('T')[0]
                  });
                }}
                fullWidth
                required
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper'
                  }
                }}
              />
              <TextField
                label="Kondisi Barang"
                name="kondisi"
                select
                value={pengembalianData.kondisi}
                onChange={(e) => setPengembalianData({
                  ...pengembalianData,
                  kondisi: e.target.value,
                })}
                fullWidth
                required
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper'
                  }
                }}
              >
                <MenuItem value="baik">Baik</MenuItem>
                <MenuItem value="rusak ringan">Rusak Ringan</MenuItem>
                <MenuItem value="rusak berat">Rusak Berat</MenuItem>
              </TextField>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: 'background.paper' }}>
          <Button
            variant="outlined"
            onClick={() => setOpenReturnDialog(false)}
            size="large"
            sx={{ px: 3 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handlePengembalian}
            size="large"
            sx={{ px: 3 }}
          >
            Konfirmasi Pengembalian
          </Button>
        </DialogActions>
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