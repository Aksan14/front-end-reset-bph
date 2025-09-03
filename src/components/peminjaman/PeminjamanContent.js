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
  Select,
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
import Cookies from "js-cookie";

const CATEGORIES = ["Semua", "Buku", "Algo", "Dapur", "Lainnya"];

export default function PeminjamanContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [barangList, setBarangList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalBarangList, setOriginalBarangList] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeminjamanForAction, setSelectedPeminjamanForAction] =
    useState(null);

  const [formData, setFormData] = useState({
    barang_id: "",
    nama_peminjam: "",
    tanggal_pinjam: "",
    rencana_kembali: "",
    keterangan: "",
  });

  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [pengembalianData, setPengembalianData] = useState({
    tanggal_kembali: "",
    kondisi: "baik",
  });


  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 6 : isTablet ? 9 : 10;

  const handleMenuOpen = (event, peminjaman) => {
    setAnchorEl(event.currentTarget);
    setSelectedPeminjamanForAction(peminjaman);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPeminjamanForAction(null);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID");
  };

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }

    const parts = dateStr.split(/[-T]/);
    if (parts.length >= 3) {
      const [year, month, day] = parts;
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const fetchBarangTersedia = async () => {
    try {
      setLoading(true);
      const data = await getBarangTersedia();

      const transformedData = data.map((item) => ({
        id: item.id,
        Namabarang: item.nama_barang,
        Kategori: item.kategori,
        Satuan: item.satuan,
        Kondisi: item.kondisi,
        Foto: item.foto,
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

  const filterBarang = (searchValue, category) => {
    try {
      let filtered = [...originalBarangList];

      if (searchValue.trim()) {
        filtered = filtered.filter(
          (item) =>
            item.Namabarang?.toLowerCase().includes(
              searchValue.toLowerCase()
            ) ||
            item.Kategori?.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      if (category && category !== "Semua") {
        filtered = filtered.filter((item) => item.Kategori === category);
      }

      setBarangList(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error filtering:", error);
      setError("Terjadi kesalahan saat memfilter data");
      setSnackbarOpen(true);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterBarang(value, selectedCategory);
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchBarangTersedia();

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

  useEffect(() => {
    filterBarang(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = barangList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(barangList.length / itemsPerPage);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectBarang = (barang) => {
    setFormData({
      ...formData,
      barang_id: barang.id,
    });
    setSelectedBarang(barang); 
    setOpenFormDialog(true);
  };


  const handleOpenDetail = (peminjaman) => {
    setSelectedPeminjaman(peminjaman);
    setOpenDetailDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nama_peminjam ||
      !formData.tanggal_pinjam ||
      !formData.rencana_kembali ||
      !formData.barang_id
    ) {
      setError("Semua field wajib diisi!");
      setSnackbarOpen(true);
      return;
    }
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

  function generatePDF(peminjaman) {
    const content = laporanPeminjamanTemplate({
      nama_barang: peminjaman.nama_barang,
      nama_peminjam: peminjaman.nama_peminjam,
      tanggal_pinjam: peminjaman.tanggal_pinjam,
      rencana_kembali: peminjaman.rencana_kembali,
      tanggal_kembali: peminjaman.tanggal_kembali
        ? peminjaman.tanggal_kembali
        : "",
      kondisi: peminjaman.kondisi,
      keterangan: peminjaman.keterangan,
    });
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.left = "-9999px";
    document.body.appendChild(printFrame);
    printFrame.contentDocument.write(`
    <html>
      <head>
        <title>Laporan Peminjaman Inventaris</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 20px; }
          @page { margin: 20mm; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
    printFrame.contentDocument.close();
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  }

  const laporanPeminjamanTemplate = (data) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <!-- Logo lebih kecil -->
      <img src="/images/coconut-logo.png" alt="COCONUT Logo" 
          style="width: 60px; height: auto; margin-right: 15px;" />

      <!-- Semua teks sejajar dengan logo -->
      <div style="text-align: center; flex: 1;">
        <div style="font-size: 10pt; font-weight: bold; margin-bottom: 0;">
          COMPUTER CLUB ORIENTED NETWORK, UTILITY AND TECHNOLOGY
        </div>
        <div style="font-size: 10pt; font-weight: bold; margin-bottom: 6px;">
          (COCONUT)
        </div>
        <div style="font-size: 10pt; margin-bottom: 2px;">
          Sekretariat: Jl. Monumen Emmy Saelan III No. 70 Karunrung, Kec. Rappocini, Makassar
        </div>
        <div style="font-size: 10pt; margin-bottom: 0;">
          Telp. 085240791254/0895801262897, Website: 
          <a href="https://www.coconut.or.id" style="color: #0000EE; text-decoration: underline;">
            www.coconut.or.id
          </a>, Email: hello@coconut.or.id
        </div>
      </div>
    </div>
    <div style="margin-top: 10px; margin-bottom: 10px;">
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
      <hr style="height:0;border:none;border-top:2px solid #000;margin:2px 0;" />
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
    </div>
    <div style="text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 16pt;">LAPORAN PEMINJAMAN BARANG INVENTARIS</h3>
    </div>
    <div style="margin: 20px 0;">
      <table style="width: 100%; font-size: 12pt; margin-bottom: 20px;">
        <tr>
          <td style="width: 120px;">Nama Barang</td>
          <td style="width: 20px;">:</td>
          <td>${data.nama_barang}</td>
        </tr>
        <tr>
          <td>Nama Peminjam</td>
          <td>:</td>
          <td>${data.nama_peminjam}</td>
        </tr>
        <tr>
          <td>Tanggal Pinjam</td>
          <td>:</td>
          <td>${data.tanggal_pinjam}</td>
        </tr>
        <tr>
          <td>Rencana Kembali</td>
          <td>:</td>
          <td>${data.rencana_kembali}</td>
        </tr>
        <tr>
          <td>Tanggal Kembali</td>
          <td>:</td>
          <td>${data.tanggal_kembali || "Belum dikembalikan"}</td>
        </tr>
        <tr>
          <td>Kondisi</td>
          <td>:</td>
          <td>${data.kondisi || "-"}</td>
        </tr>
        <tr>
          <td>Keterangan</td>
          <td>:</td>
          <td>${data.keterangan || "-"}</td>
        </tr>
      </table>
    </div>
    <div style="
      position: fixed; 
      bottom: 0; 
      left: 0; 
      margin: 10px; 
      font-size: 8pt; 
      color: #666;
    ">
    <p style="margin: 0;">Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
    <p style="margin: 0;">Sistem Inventaris COCONUT</p>
  </div>
  </div>
`;

  const handleDelete = async (id) => {
    try {
      if (
        !window.confirm("Apakah Anda yakin ingin menghapus peminjaman ini?")
      ) {
        return;
      }

      const response = await fetch(endpoints.PEMINJAMAN_DELETE(id), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
      });

      if (response.ok) {
        const updatedList = await getPeminjaman();
        setPeminjamanList(updatedList);

        setMessage("Peminjaman berhasil dihapus");
        setSnackbarOpen(true);
      } else {
        throw new Error("Gagal menghapus peminjaman");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Gagal menghapus peminjaman");
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
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
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
                minWidth: { xs: "100%", sm: 200 },
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
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr", // 1 column for mobile
                    sm: "repeat(3, 1fr)", // 3 columns for tablet
                    md: "repeat(4, 1fr)", // 4 columns for desktop
                    lg: "repeat(5, 1fr)", // 5 columns for large screens
                  },
                  gap: { xs: 2, sm: 2 },
                }}
              >
                {currentItems.map((barang) => (
                  <Card
                    key={barang.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" },
                      cursor: "pointer",
                      height: "100%",
                    }}
                    onClick={() => handleSelectBarang(barang)}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: {
                          xs: "280px", // Taller for mobile
                          sm: "240px", // Taller for tablet
                          md: "260px", // Taller for desktop
                          lg: "280px", // Taller for large screens
                        },
                        bgcolor: "background.neutral",
                      }}
                    >
                      <Avatar
                        src={
                          barang.Foto
                            ? `${API_BASE_URL}${barang.Foto}`
                            : barang.foto
                            ? `${API_BASE_URL}${barang.foto}`
                            : undefined
                        }
                        alt={barang.Namabarang}
                        variant="square"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          bgcolor: barang.Foto ? "transparent" : "#e2e8f0",
                          "& img": {
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                            padding: "12px", // Slightly larger padding
                          },
                        }}
                      >
                        {!barang.Foto && (
                          <ImageIcon
                            sx={{
                              fontSize: {
                                xs: 64, // Larger icon for mobile
                                sm: 56, // Larger icon for tablet
                                md: 64, // Larger icon for desktop
                              },
                            }}
                          />
                        )}
                      </Avatar>
                    </Box>
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2 },
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "1rem", // Larger font for mobile
                            sm: "0.9rem",
                            md: "1rem",
                          },
                          fontWeight: 500,
                          mb: 1,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: {
                            xs: "auto", // Auto height for mobile
                            sm: "2.6em",
                          },
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
                              fontSize: {
                                xs: "0.875rem", // Larger font for mobile
                                sm: "0.813rem",
                                md: "0.875rem",
                              },
                            }}
                          >
                            {barang.Jumlah} {barang.Satuan}
                          </Typography>
                          <Chip
                            label={barang.Kondisi}
                            size={isMobile ? "medium" : "small"}
                            color={
                              barang.Kondisi === "Baik" ? "success" : "warning"
                            }
                            sx={{
                              height: { xs: 28, sm: 24 }, // Larger chip for mobile
                              "& .MuiChip-label": {
                                px: 1.5,
                                fontSize: {
                                  xs: "0.875rem", // Larger font for mobile
                                  sm: "0.75rem",
                                  md: "0.8125rem",
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
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        <Typography variant="body2">{p.nama_barang}</Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <Typography variant="body2">
                          {formatDateDisplay(p.tanggal_pinjam)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            p.tanggal_kembali ? "Dikembalikan" : "Dipinjam"
                          }
                          color={p.tanggal_kembali ? "success" : "warning"}
                          size="small"
                          sx={{ minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          {isMobile ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, p)}
                                sx={{ color: "text.secondary" }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={
                                  Boolean(anchorEl) &&
                                  selectedPeminjamanForAction?.id === p.id
                                }
                                onClose={handleMenuClose}
                              >
                                {p.tanggal_kembali && (
                                  <MenuItem
                                    dense
                                    onClick={() => {
                                      handleOpenDetail(p);
                                      handleMenuClose();
                                    }}
                                  >
                                    Lihat Detail
                                  </MenuItem>
                                )}
                                {!p.tanggal_kembali && (
                                  <MenuItem
                                    dense
                                    onClick={() => {
                                      setSelectedPeminjaman(p);
                                      setOpenReturnDialog(true);
                                      handleMenuClose();
                                    }}
                                  >
                                    Kembalikan Barang
                                  </MenuItem>
                                )}
                                <MenuItem
                                  dense
                                  onClick={() => {
                                    generatePDF(p);
                                    handleMenuClose();
                                  }}
                                >
                                  Cetak Laporan
                                </MenuItem>
                                {p.tanggal_kembali && (
                                  <MenuItem
                                    dense
                                    onClick={() => {
                                      handleDelete(p.id);
                                      handleMenuClose();
                                    }}
                                    sx={{ color: "error.main" }}
                                  >
                                    Hapus
                                  </MenuItem>
                                )}
                              </Menu>
                            </>
                          ) : (
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
                                    minWidth: "auto",
                                    px: 2,
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
                                    minWidth: "auto",
                                    px: 2,
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
                                    minWidth: "auto",
                                    px: 2,
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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            backgroundImage:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
            m: isMobile ? 0 : 2,
            height: isMobile ? "100vh" : "auto",
            maxHeight: isMobile ? "100vh" : "90vh",
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            p: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="span"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
            }}
          >
            Form Peminjaman Barang
          </Box>
          {isMobile && (
            <IconButton
              onClick={() => setOpenFormDialog(false)}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "background.default",
            height: isMobile ? "calc(100vh - 120px)" : "auto",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedBarang && (
            <Box sx={{ p: { xs: 1, sm: 2 }, flex: 1 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="stretch">
                      <Box
                        sx={{
                          width: "40%",
                          minHeight: 200,
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: "background.neutral",
                          border: "1px solid",
                          borderColor: "divider",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Avatar
                          src={
                            selectedBarang.Foto
                              ? `${API_BASE_URL}${selectedBarang.Foto}`
                              : undefined
                          }
                          variant="square"
                          sx={{
                            width: "100%",
                            height: "100%",
                            minHeight: 200,
                            "& img": {
                              objectFit: "contain",
                              p: 2,
                            },
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 64 }} />
                        </Avatar>
                      </Box>

                      {/* Informasi Barang */}
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                            sx={{ fontSize: "1.1rem" }}
                          >
                            {selectedBarang.Namabarang}
                          </Typography>
                          <Stack direction="column" spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                              Kategori: {selectedBarang.Kategori}
                            </Typography>
                            <Box>
                              <Chip
                                label={selectedBarang.Kondisi}
                                color={
                                  selectedBarang.Kondisi === "Baik"
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                              />
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Form Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        mb: 2,
                      }}
                    >
                      Form Peminjaman
                    </Typography>

                    <Stack spacing={2.5}>
                      <TextField
                        label="Nama Peminjam"
                        name="nama_peminjam"
                        value={formData.nama_peminjam}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <TextField
                        label="Tanggal Pinjam"
                        name="tanggal_pinjam"
                        type="date"
                        value={formData.tanggal_pinjam}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="medium"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <TextField
                        label="Rencana Kembali"
                        name="rencana_kembali"
                        type="date"
                        value={formData.rencana_kembali}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="medium"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <TextField
                        label="Keterangan"
                        name="keterangan"
                        value={formData.keterangan}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {/* Informasi Barang */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: "background.neutral",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Avatar
                          src={
                            selectedBarang.Foto
                              ? `${API_BASE_URL}${selectedBarang.Foto}`
                              : undefined
                          }
                          variant="square"
                          sx={{
                            width: "100%",
                            height: "100%",
                            "& img": {
                              objectFit: "contain",
                              p: 1,
                            },
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          gutterBottom
                          sx={{ fontSize: "1.1rem" }}
                        >
                          {selectedBarang.Namabarang}
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Kategori: {selectedBarang.Kategori || "-"}
                          </Typography>
                          <Chip
                            label={selectedBarang.Kondisi}
                            color={
                              selectedBarang.Kondisi === "Baik"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Form Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 1.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      Form Peminjaman
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                          label="Nama Peminjam"
                          name="nama_peminjam"
                          value={formData.nama_peminjam}
                          onChange={handleChange}
                          fullWidth
                          required
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "background.paper",
                            },
                          }}
                        />

                        <Stack direction="row" spacing={1.5}>
                          <TextField
                            label="Tanggal Pinjam"
                            name="tanggal_pinjam"
                            type="date"
                            value={formData.tanggal_pinjam}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "background.paper",
                              },
                            }}
                          />
                          <TextField
                            label="Rencana Kembali"
                            name="rencana_kembali"
                            type="date"
                            value={formData.rencana_kembali}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "background.paper",
                              },
                            }}
                          />
                        </Stack>

                        <TextField
                          label="Keterangan"
                          name="keterangan"
                          value={formData.keterangan}
                          onChange={handleChange}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
              )}
            </Box>
          )}
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 0 },
            position: isMobile ? "sticky" : "relative",
            bottom: 0,
            zIndex: 1000,
            boxShadow: isMobile ? "0 -2px 8px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOpenFormDialog(false)}
            size="large"
            fullWidth={isMobile}
            sx={{
              px: 3,
              mr: { xs: 0, sm: 1 },
              color: "text.secondary",
              borderColor: "divider",
              height: { xs: 48, sm: 40 },
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            size="large"
            fullWidth={isMobile}
            sx={{
              px: 3,
              height: { xs: 48, sm: 40 },
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
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
            backgroundImage:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            py: isMobile ? 2 : 3,
            px: { xs: 2, sm: 3 },
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
            color: "white",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
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
              bgcolor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                mb: 2,
              }}
            >
              Update untuk pengembalian barang{" "}
              <Box
                component="span"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {selectedPeminjaman?.nama_barang}
              </Box>
              . Isi form berikut untuk melanjutkan proses pengembalian.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Tanggal Kembali"
                name="tanggal_kembali"
                type="date"
                value={
                  pengembalianData.tanggal_kembali ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  setPengembalianData({
                    ...pengembalianData,
                    tanggal_kembali:
                      selectedDate || new Date().toISOString().split("T")[0],
                  });
                }}
                fullWidth
                required
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                  },
                }}
              />
              <TextField
                label="Kondisi Barang"
                name="kondisi"
                select
                value={pengembalianData.kondisi}
                onChange={(e) =>
                  setPengembalianData({
                    ...pengembalianData,
                    kondisi: e.target.value,
                  })
                }
                fullWidth
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                  },
                }}
              >
                <MenuItem value="baik">Baik</MenuItem>
                <MenuItem value="rusak ringan">Rusak Ringan</MenuItem>
                <MenuItem value="rusak berat">Rusak Berat</MenuItem>
              </TextField>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: "background.paper" }}>
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
