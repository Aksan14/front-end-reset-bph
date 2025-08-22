"use client";

import { useEffect, useState } from "react";
import { barangService } from "@/services/barangService";
import { API_BASE_URL, UPLOAD_URL } from "@/config/api";
import {
  Box,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slide,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Pagination,
  Chip,
  alpha,
  Divider,
  Avatar,
  Badge,
  InputAdornment,
  CardContent,
  Fab,
  isMobile,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useMediaQuery from "@mui/material/useMediaQuery";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const getConditionColor = (kondisi) => {
  switch (kondisi) {
    case "Baik":
      return "success";
    case "Rusak Ringan":
      return "warning";
    case "Rusak Berat":
      return "error";
    case "Dimusnahkan":
      return "default";
    default:
      return "info";
  }
};

const getConditionIcon = (kondisi) => {
  switch (kondisi) {
    case "Baik":
      return <CheckCircleIcon fontSize="small" />;
    case "Rusak Ringan":
      return <WarningIcon fontSize="small" />;
    case "Rusak Berat":
      return <WarningIcon fontSize="small" color="error" />;
    case "Dimusnahkan":
      return <DangerousIcon fontSize="small" />;
    default:
      return <InventoryIcon fontSize="small" />;
  }
};

// Custom color palette for consistent theming
const customColors = {
  primary: {
    lighter: "#EBF3FE",
    light: "#93c5fd",
    main: "#3b82f6",
    dark: "#1e40af",
  },
  error: {
    lighter: "#FEE7E7",
    light: "#fca5a5",
    main: "#ef4444",
    dark: "#dc2626",
  },
};

const TablePaginationStyled = ({ count, page, onChange }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      py: { xs: 1.5, sm: 2 },
      borderTop: 1,
      borderColor: "divider",
    }}
  >
    <Pagination
      count={count}
      page={page}
      onChange={onChange}
      color="primary"
      shape="rounded"
      size={isMobile ? "small" : "medium"}
      sx={{
        "& .MuiPaginationItem-root": {
          minWidth: { xs: 28, sm: 32 },
          height: { xs: 28, sm: 32 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          mx: { xs: 0.25, sm: 0.5 },
        },
      }}
    />
  </Box>
);

const tableContainerStyles = {
  overflowX: "auto",
  "& table": {
    minWidth: { xs: "100%", sm: 800 },
    "& th": {
      px: { xs: 1, sm: 2 },
      py: { xs: 1.5, sm: 2 },
      fontSize: { xs: "0.813rem", sm: "0.875rem" },
      fontWeight: 600,
    },
    "& td": {
      px: { xs: 1, sm: 2 },
      py: { xs: 1.5, sm: 2 },
      fontSize: { xs: "0.813rem", sm: "0.875rem" },
    },
    "& .MuiAvatar-root": {
      width: { xs: 40, sm: 56 },
      height: { xs: 40, sm: 56 },
    },
    "& .MuiChip-root": {
      height: { xs: 24, sm: 32 },
      fontSize: { xs: "0.75rem", sm: "0.813rem" },
    },
  },
};

const actionButtonStyles = {
  minWidth: { xs: 32, sm: "auto" },
  px: { xs: 1, sm: 2 },
  "& .MuiButton-startIcon": {
    mr: { xs: 0, sm: 1 },
  },
  "& .MuiButton-endIcon": {
    ml: { xs: 0, sm: 1 },
  },
  "& .MuiSvgIcon-root": {
    fontSize: { xs: 20, sm: 24 },
  },
  "& .MuiButton-text": {
    display: { xs: "none", sm: "inline" },
  },
};

const tableHeaderCellStyles = {
  fontWeight: 600,
  color: "#4a5568",
  whiteSpace: "nowrap",
  display: {
    xs: (column) => (column.mobile ? "table-cell" : "none"),
    sm: "table-cell",
  },
};

const tableColumns = [
  { id: "foto", label: "", mobile: true, minWidth: { xs: 60, sm: 80 } },
  { id: "namaBarang", label: "Nama Barang", mobile: true, minWidth: { xs: 120, sm: 150 } },
  { id: "kategori", label: "Kategori", mobile: false, minWidth: { xs: 100, sm: 120 } },
  { id: "jumlah", label: "Jumlah", mobile: true, minWidth: { xs: 70, sm: 80 } },
  { id: "satuan", label: "Satuan", mobile: false, minWidth: { xs: 80, sm: 100 } },
  { id: "kondisi", label: "Kondisi", mobile: true, minWidth: { xs: 100, sm: 120 } },
  { id: "aksi", label: "Aksi", mobile: true, minWidth: { xs: 120, sm: 160 } }
];

const mobileColumns = [
  { 
    id: 'foto', 
    label: '', 
    width: { xs: 50, sm: 80 } 
  },
  { 
    id: 'namaBarang', 
    label: 'Nama Barang',
    fontSize: { xs: '0.813rem', sm: '0.875rem' }
  }
];

const imageDialogStyles = {
  "& .MuiDialog-paper": {
    width: { xs: "95%", sm: "80%", md: "60%" },
    maxHeight: { xs: "80vh", sm: "85vh" },
    m: { xs: 1, sm: 2 },
  },
};

const formDialogStyles = {
  "& .MuiDialog-paper": {
    width: { xs: "95%", sm: "80%", md: "60%" },
    m: { xs: 1, sm: 2 },
    p: { xs: 2, sm: 3 },
  },
};

const formFieldStyles = {
  mb: 2,
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
  },
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
  },
};

// Available categories
const CATEGORIES = [
  "Semua",
  "Buku",
  "Algo",
  "Dapur",
  "Inventaris Coconut"
];

export default function DataBarang() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBarangId, setSelectedBarangId] = useState(null);
  const [formData, setFormData] = useState({
    Namabarang: "",
    Kategori: "",
    Jumlah: "",
    Satuan: "",
    Kondisi: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dimusnahkanPage, setDimusnahkanPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const itemsPerPage = 10;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  // Tambahkan state untuk menyimpan data asli
  const [originalBarang, setOriginalBarang] = useState([]);

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const result = await barangService.getAll();
      if (result.success) {
        setBarang(result.data);
        setOriginalBarang(result.data); // Simpan data asli
        setSnackbar({
          open: true,
          message: "Data barang berhasil dimuat",
          severity: "success",
        });
      } else {
        setBarang([]);
        setOriginalBarang([]); // Reset data asli juga
        setSnackbar({
          open: true,
          message: result.message || "Gagal mengambil data barang",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching barang:", error);
      setBarang([]);
      setOriginalBarang([]); // Reset data asli juga
      setSnackbar({
        open: true,
        message: "Terjadi kesalahan saat mengambil data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchBarang();

    return () => {
      isMounted = false;
    };
  }, []);

  // Effect to handle category changes
  useEffect(() => {
    filterBarang(searchQuery, selectedCategory);
  }, [selectedCategory]);

  // Combined search and filter function
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterBarang(value, selectedCategory);
  };

  // Filter function that handles both search and category
  const filterBarang = (searchValue, category) => {
    try {
      // Check if originalBarang is null, undefined or not an array
      let filtered = Array.isArray(originalBarang) ? [...originalBarang] : [];

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

      setBarang(filtered);
    } catch (error) {
      console.error("Error filtering:", error);
      setSnackbar({
        open: true,
        message: "Terjadi kesalahan saat memfilter data",
        severity: "error"
      });
    }
  };

  const handleMusnahkan = async (id) => {
    if (
      window.confirm(
        "Yakin ingin memusnahkan barang ini? Status tidak dapat dikembalikan setelah dimusnahkan!"
      )
    ) {
      try {
        const result = await barangService.delete(id);
        if (result.success) {
          await fetchBarang();
          setSnackbar({
            open: true,
            message: "Barang berhasil dimusnahkan ✓",
            severity: "success",
          });
          setCurrentPage(1);
          setDimusnahkanPage(1);
        } else {
          setSnackbar({
            open: true,
            message: result.message || "Gagal memusnahkan barang",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error musnahkan barang:", error);
        setSnackbar({
          open: true,
          message: "Terjadi kesalahan saat memusnahkan barang",
          severity: "error",
        });
      }
    }
  };

  const handleOpenEdit = async (id) => {
    try {
      const result = await barangService.getById(id);
      if (result.success) {
        setFormData({
          Namabarang: result.data.Namabarang || "",
          Kategori: result.data.Kategori || "",
          Jumlah: result.data.Jumlah?.toString() || "",
          Satuan: result.data.Satuan || "",
          Kondisi: result.data.Kondisi || "",
        });
        setPreviewImage(
          result.data.Foto ? `${API_BASE_URL}${result.data.Foto}` : null
        );
        setSelectedFile(null);
        setSelectedBarangId(id);
        setIsEditMode(true);
        setOpenFormDialog(true);
        setFormErrors({});
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Gagal mengambil data barang",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching barang by ID:", error);
      setSnackbar({
        open: true,
        message: "Terjadi kesalahan saat mengambil data barang",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason !== "clickaway") {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setFormErrors({
          ...formErrors,
          Foto: "Hanya file JPG atau PNG yang diperbolehkan",
        });
        setSelectedFile(null);
        setPreviewImage(null);
      } else if (file.size > 2 * 1024 * 1024) {
        setFormErrors({ ...formErrors, Foto: "Ukuran file maksimum 2MB" });
        setSelectedFile(null);
        setPreviewImage(null);
      } else {
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        setFormErrors({ ...formErrors, Foto: "" });
      }
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
      setFormErrors({ ...formErrors, Foto: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Namabarang.trim())
      errors.Namabarang = "Namabarang wajib diisi";
    if (!formData.Kategori.trim()) errors.Kategori = "Kategori wajib diisi";
    if (
      !formData.Jumlah ||
      isNaN(formData.Jumlah) ||
      Number(formData.Jumlah) <= 0
    )
      errors.Jumlah = "Jumlah harus angka positif";
    if (!formData.Satuan.trim()) errors.Satuan = "Satuan wajib diisi";
    if (!formData.Kondisi) errors.Kondisi = "Kondisi wajib dipilih";
    if (!isEditMode && !selectedFile)
      errors.Foto = "Foto wajib diisi untuk tambah barang";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbar({
        open: true,
        message: "Harap lengkapi semua field dengan benar",
        severity: "error",
      });
      return;
    }

    const submitData = {
      Namabarang: formData.Namabarang,
      Kategori: formData.Kategori,
      Jumlah: formData.Jumlah === "" ? "0" : Number(formData.Jumlah),
      Satuan: formData.Satuan,
      Kondisi: formData.Kondisi,
    };

    try {
      let result;
      if (isEditMode) {
        if (formData.Kondisi === "Dimusnahkan") {
          setSnackbar({
            open: true,
            message:
              "Tidak dapat mengubah status menjadi Dimusnahkan melalui Edit",
            severity: "error",
          });
          return;
        }
        result = await barangService.update(
          selectedBarangId,
          submitData,
          selectedFile
        );
      } else {
        result = await barangService.create(submitData, selectedFile);
      }
      if (result.success) {
        setFormData({
          Namabarang: "",
          Kategori: "",
          Jumlah: "",
          Satuan: "",
          Kondisi: "",
        });
        setSelectedFile(null);
        setPreviewImage(null);
        setOpenFormDialog(false);
        setIsEditMode(false);
        setSelectedBarangId(null);
        setFormErrors({});
        setSnackbar({
          open: true,
          message: isEditMode
            ? "Barang berhasil diperbarui ✓"
            : "Barang berhasil ditambahkan ✓",
          severity: "success",
        });
        await fetchBarang();
        setCurrentPage(1);
        setDimusnahkanPage(1);
        setSearchQuery("");
      } else {
        let userMessage = result.message;
        if (result.message && typeof result.message === "object") {
          userMessage = result.message.message || "Gagal menyimpan barang";
        }
        setSnackbar({
          open: true,
          message: userMessage,
          severity: "error",
        });
      }
    } catch (error) {
      let errorMessage = "Terjadi kesalahan pada server";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      Namabarang: "",
      Kategori: "",
      Jumlah: "",
      Satuan: "",
      Kondisi: "",
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setIsEditMode(false);
    setSelectedBarangId(null);
    setFormErrors({});
    setOpenFormDialog(true);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setSelectedImage(null);
  };

  const handleOpenDetail = (item) => {
    setSelectedBarang(item);
    setOpenDetailDialog(true);
  };

  // Paginasi Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = barang
    ?.filter((item) => item.Kondisi !== "Dimusnahkan")
    .slice(indexOfFirstItem, indexOfLastItem) || [];

  const indexOfLastDimusnahkan = dimusnahkanPage * itemsPerPage;
  const indexOfFirstDimusnahkan = indexOfLastDimusnahkan - itemsPerPage;
  const currentDimusnahkanItems = barang
    ?.filter((item) => item.Kondisi === "Dimusnahkan")
    .slice(indexOfFirstDimusnahkan, indexOfLastDimusnahkan) || [];

  const totalPages = Math.ceil(
    (barang?.filter((item) => item.Kondisi !== "Dimusnahkan").length || 0) /
      itemsPerPage
  );
  const totalDimusnahkanPages = Math.ceil(
    (barang?.filter((item) => item.Kondisi === "Dimusnahkan").length || 0) /
      itemsPerPage
  );

  return (
    <ProtectedRoute>
      <Box sx={{ 
  width: '100%',
  bgcolor: { xs: '#f8fafc', sm: 'transparent' },
  px: { xs: 0, sm: 2 },
  py: { xs: 1, sm: 2 }
}}>
        <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
          {/* Header */}
          <Box sx={{ px: { xs: 2, sm: 0 } }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 800,
                color: 'primary.dark',
                mb: 0.5
              }}
            >
              Data Inventaris
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Kelola data barang inventaris
            </Typography>
          </Box>

          {/* Search & Add Section */}
          <Card
            elevation={0}
            sx={{
              mx: { xs: 2, sm: 0 },
              p: { xs: 1.5, sm: 2 },
              borderRadius: { xs: 2, sm: 2 },
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cari barang..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      borderRadius: 1.5
                    }
                  }}
                />
                <FormControl 
                  size="small"
                  sx={{ 
                    minWidth: { xs: '100%', sm: 200 },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      borderRadius: 1.5
                    }
                  }}
                >
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1); // Reset to first page when changing category
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
              </Stack>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{
                  height: 40,
                  bgcolor: 'primary.dark',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Tambah Barang
              </Button>
            </Stack>
          </Card>

          {/* Active Items List */}
          <Card
            elevation={0}
            sx={{
              mx: { xs: 2, sm: 0 },
              borderRadius: { xs: 2, sm: 2 },
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Daftar Barang Aktif
              </Typography>
            </Box>

            {/* Mobile List View */}
            {isMobile ? (
              <Stack divider={<Divider />}>
                {currentItems.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      '&:active': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={item.Foto ? `${API_BASE_URL}${item.Foto}` : undefined}
                        variant="rounded"
                        sx={{
                          width: 90,
                          height: 90,
                          bgcolor: item.Foto ? 'transparent' : '#e2e8f0'
                        }}
                      >
                        {!item.Foto && <ImageIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          fontWeight={500}
                          sx={{ fontSize: '0.9rem', mb: 0.5 }}
                        >
                          {item.Namabarang}
                        </Typography>
                        <Chip
                          icon={getConditionIcon(item.Kondisi)}
                          label={item.Kondisi}
                          color={getConditionColor(item.Kondisi)}
                          size="small"
                          sx={{ 
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              // Existing table view for desktop
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: alpha(customColors.primary.lighter, 0.5),
                      }}
                    >
                      {isMobile ? (
                        mobileColumns.map((column) => (
                          <TableCell
                            key={column.id}
                            sx={{
                              fontWeight: 600,
                              color: '#4a5568',
                              width: column.width,
                              flex: column.flex
                            }}
                          >
                            {column.label}
                          </TableCell>
                        ))
                      ) : (
                        // existing desktop columns
                        tableColumns.map((column) => (
                          <TableCell
                            key={column.id}
                            sx={{
                              ...tableHeaderCellStyles,
                              minWidth: column.minWidth
                            }}
                          >
                            {column.label}
                          </TableCell>
                        ))
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        onClick={() => isMobile && handleOpenDetail(item)}
                        sx={{ 
                          cursor: isMobile ? 'pointer' : 'default',
                          '&:hover': {
                            bgcolor: alpha(customColors.primary.lighter, 0.1)
                          }
                        }}
                      >
                        {isMobile ? (
                          <>
                            <TableCell sx={{ width: { xs: 50, sm: 80 }, p: { xs: 1, sm: 2 } }}>
                              <Avatar
                                src={item.Foto ? `${API_BASE_URL}${item.Foto}` : undefined}
                                variant="rounded"
                                sx={{
                                  width: { xs: 40, sm: 56 },
                                  height: { xs: 40, sm: 56 },
                                  bgcolor: item.Foto ? 'transparent' : '#e2e8f0'
                                }}
                              >
                                {!item.Foto && <ImageIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography 
                                  fontWeight={500}
                                  sx={{ 
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    lineHeight: 1.2
                                  }}
                                >
                                  {item.Namabarang || "-"}
                                </Typography>
                                <Chip
                                  icon={getConditionIcon(item.Kondisi)}
                                  label={item.Kondisi}
                                  color={getConditionColor(item.Kondisi)}
                                  size="small"
                                  sx={{ 
                                    alignSelf: 'flex-start',
                                    height: { xs: 24, sm: 32 },
                                    '& .MuiChip-label': {
                                      px: { xs: 1, sm: 1.5 },
                                      fontSize: { xs: '0.75rem', sm: '0.813rem' }
                                    }
                                  }}
                                />
                              </Stack>
                            </TableCell>
                          </>
                        ) : (
                          // existing desktop view cells
                          <>
                            <TableCell>
                              {item.Foto ? (
                                <Avatar
                                  src={`${API_BASE_URL}${item.Foto}`}
                                  alt={item.Namabarang}
                                  sx={{ 
                                    width: 100, 
                                    height: 100, 
                                    cursor: "pointer",
                                    '&:hover': {
                                      opacity: 0.8,
                                      transform: 'scale(1.05)',
                                      transition: 'all 0.2s ease-in-out'
                                    }
                                  }}
                                  onClick={() => handleImageClick(`${API_BASE_URL}${item.Foto}`)}
                                  variant="rounded"
                                />
                              ) : (
                                <Avatar
                                  sx={{ width: 56, height: 56, bgcolor: "#e2e8f0" }}
                                  variant="rounded"
                                >
                                  <ImageIcon sx={{ color: "#94a3b8" }} />
                                </Avatar>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>
                                {item.Namabarang || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={item.Kategori || "-"} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>
                                {item.Jumlah || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.Satuan || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getConditionIcon(item.Kondisi)}
                                label={item.Kondisi || "-"}
                                color={getConditionColor(item.Kondisi)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack 
                                direction="row" 
                                spacing={1}
                                sx={{
                                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                  gap: { xs: 1 }
                                }}
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditIcon fontSize="small" />}
                                  onClick={() => handleOpenEdit(item.id)}
                                  sx={{
                                    borderRadius: 2,
                                    minWidth: { xs: '100%', sm: 'auto' },
                                    mb: { xs: 1, sm: 0 }
                                  }}
                                >
                                  {!isMobile && "Edit"}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<DeleteIcon fontSize="small" />}
                                  onClick={() => handleMusnahkan(item.id)}
                                  sx={{
                                    borderRadius: 2,
                                    minWidth: { xs: '100%', sm: 'auto' }
                                  }}
                                >
                                  {!isMobile && "Musnahkan"}
                                </Button>
                              </Stack>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <Box
                sx={{
                  py: 2,
                  px: { xs: 2, sm: 0 },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      mx: 0.5
                    }
                  }}
                />
              </Box>
            )}
          </Card>

          {/* Dimusnahkan Items List */}
          <Card
            elevation={0}
            sx={{
              mx: { xs: 2, sm: 0 },
              borderRadius: { xs: 2, sm: 2 },
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Daftar Barang Dimusnahkan
              </Typography>
            </Box>

            {/* Mobile List View */}
            {isMobile ? (
              <Stack divider={<Divider />}>
                {currentDimusnahkanItems.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      '&:active': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={item.Foto ? `${API_BASE_URL}${item.Foto}` : undefined}
                        variant="rounded"
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: item.Foto ? 'transparent' : '#e2e8f0',
                          opacity: 0.7 // Add opacity for dimusnahkan items
                        }}
                      >
                        {!item.Foto && <ImageIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          fontWeight={500}
                          sx={{ 
                            fontSize: '0.9rem',
                            mb: 0.5,
                            textDecoration: 'line-through', // Add strikethrough for dimusnahkan items
                            color: 'text.secondary'
                          }}
                        >
                          {item.Namabarang}
                        </Typography>
                        <Chip
                          icon={getConditionIcon(item.Kondisi)}
                          label={item.Kondisi}
                          color={getConditionColor(item.Kondisi)}
                          size="small"
                          sx={{ 
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1,
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              // Desktop Table View
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(customColors.primary.lighter, 0.5) }}>
                      {tableColumns.slice(0, -1).map((column) => ( // Remove action column
                        <TableCell
                          key={column.id}
                          sx={{
                            ...tableHeaderCellStyles,
                            minWidth: column.minWidth
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDimusnahkanItems.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        sx={{ 
                          opacity: 0.8,
                          bgcolor: alpha(customColors.error.lighter, 0.1)
                        }}
                      >
                        <TableCell>
                          {item.Foto ? (
                            <Avatar
                              src={`${API_BASE_URL}${item.Foto}`}
                              alt={item.Namabarang}
                              sx={{ 
                                width: 56, 
                                height: 56,
                                cursor: "pointer",
                                opacity: 0.7,
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                              onClick={() => handleImageClick(`${API_BASE_URL}${item.Foto}`)}
                              variant="rounded"
                            />
                          ) : (
                            <Avatar
                              sx={{ width: 56, height: 56, bgcolor: "#e2e8f0" }}
                              variant="rounded"
                            >
                              <ImageIcon sx={{ color: "#94a3b8" }} />
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            fontWeight={500}
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {item.Namabarang || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.Kategori || "-"} 
                            size="small"
                            sx={{ opacity: 0.7 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {item.Jumlah || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.Satuan || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getConditionIcon(item.Kondisi)}
                            label={item.Kondisi || "-"}
                            color={getConditionColor(item.Kondisi)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination for Dimusnahkan Items */}
            {!loading && totalDimusnahkanPages > 0 && (
              <Box
                sx={{
                  py: 2,
                  px: { xs: 2, sm: 0 },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Pagination
                  count={totalDimusnahkanPages}
                  page={dimusnahkanPage}
                  onChange={(e, page) => setDimusnahkanPage(page)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      mx: 0.5
                    }
                  }}
                />
              </Box>
            )}
          </Card>
        </Stack>

        {/* Image Preview Dialog */}
        <Dialog
          open={openPopup}
          onClose={handleClosePopup}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: { xs: '100%', sm: '90%', md: '80%' },
              m: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: 2 },
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    borderBottom: '1px solid',
    borderColor: 'divider'
  }}>
    <Typography 
      component="div" 
      sx={{ 
        fontSize: '1.125rem',
        fontWeight: 600 
      }}
    >
      Preview Gambar
    </Typography>
    <IconButton onClick={handleClosePopup} size="small">
      <CloseIcon />
    </IconButton>
  </Box>
  <DialogContent sx={{ p: 0 }}>
    <Box
      component="img"
      src={selectedImage}
      alt="Preview"
      sx={{
        width: '100%',
        height: 'auto',
        maxHeight: '80vh',
        objectFit: 'contain'
      }}
    />
  </DialogContent>
        </Dialog>

        {/* Detail Dialog - Mobile */}
        <Dialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          fullScreen={isMobile}
          TransitionComponent={SlideTransition}
          PaperProps={{
            sx: {
              m: isMobile ? 0 : 2,
              width: { sm: '600px', md: '800px' },
              height: isMobile ? '100%' : 'auto',
              maxHeight: { sm: '85vh' },
              borderRadius: { xs: 0, sm: 2 }
            }
          }}
        >
          <Box sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3
      }}>
        <Typography 
          component="div" 
          sx={{ 
            fontSize: '1.125rem',
            fontWeight: 600 
          }}
        >
          Detail Barang
        </Typography>
        <IconButton
          onClick={() => setOpenDetailDialog(false)}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
              
              {selectedBarang && (
                <Stack spacing={2.5}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ mb: 1, color: 'text.secondary' }}
                    >
                      Foto Barang
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        bgcolor: 'background.neutral',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {selectedBarang.Foto ? (
                        <Box
                          component="img"
                          src={`${API_BASE_URL}${selectedBarang.Foto}`}
                          alt={selectedBarang.Namabarang}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onClick={() => handleImageClick(`${API_BASE_URL}${selectedBarang.Foto}`)}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <ImageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Tidak ada foto
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Nama Barang
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedBarang.Namabarang}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Kategori
                    </Typography>
                    <Chip 
                      label={selectedBarang.Kategori} 
                      size="small"
                      sx={{ 
                        borderRadius: 1,
                        bgcolor: 'background.neutral'
                      }}
                    />
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box flex={1}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Jumlah
                      </Typography>
                      <Typography variant="body1">
                        {selectedBarang.Jumlah}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Satuan
                      </Typography>
                      <Typography variant="body1">
                        {selectedBarang.Satuan}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Kondisi
                    </Typography>
                    <Chip
                      icon={getConditionIcon(selectedBarang.Kondisi)}
                      label={selectedBarang.Kondisi}
                      color={getConditionColor(selectedBarang.Kondisi)}
                      size="small"
                      sx={{ 
                        borderRadius: 1,
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  </Box>

                  {selectedBarang.Kondisi !== 'Dimusnahkan' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          handleMusnahkan(selectedBarang.id);
                          setOpenDetailDialog(false);
                        }}
                      >
                        Musnahkan
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          handleOpenEdit(selectedBarang.id);
                          setOpenDetailDialog(false);
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Dialog>

        {/* Form Dialog */}
        <Dialog
          open={openFormDialog}
          onClose={() => {
            setOpenFormDialog(false);
            setFormErrors({});
          }}
          maxWidth="sm"
          fullWidth
          TransitionComponent={SlideTransition}
        >
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 3
    }}>
      <Typography 
        component="div" 
        sx={{ 
          fontSize: '1.125rem',
          fontWeight: 600 
        }}
      >
        {isEditMode ? "Edit Barang" : "Tambah Barang"}
      </Typography>
      <IconButton
        onClick={() => {
          setOpenFormDialog(false);
          setFormErrors({});
        }}
        size="small"
      >
        <CloseIcon />
      </IconButton>
    </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    Foto Barang
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      bgcolor: 'background.neutral'
                    }}
                  >
                    {previewImage ? (
                      <Box
                        component="img"
                        src={previewImage}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Klik untuk pilih foto
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                  {formErrors.Foto && (
                    <Typography color="error" variant="caption">
                      {formErrors.Foto}
                    </Typography>
                  )}
                </Box>

                <TextField
                  label="Nama Barang"
                  name="Namabarang"
                  value={formData.Namabarang}
                  onChange={handleChange}
                  error={Boolean(formErrors.Namabarang)}
                  helperText={formErrors.Namabarang}
                  fullWidth
                  required
                />

                <FormControl 
                  fullWidth 
                  error={Boolean(formErrors.Kategori)}
                  required
                >
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    name="Kategori"
                    value={formData.Kategori}
                    onChange={handleChange}
                    label="Kategori"
                  >
                    <MenuItem value="Buku">Buku</MenuItem>
                    <MenuItem value="Algo">Algo</MenuItem>
                    <MenuItem value="Dapur">Dapur</MenuItem>
                    <MenuItem value="Inventaris Coconut">Inventaris Coconut</MenuItem>
                  </Select>
                  {formErrors.Kategori && (
                    <FormHelperText>{formErrors.Kategori}</FormHelperText>
                  )}
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Jumlah"
                    name="Jumlah"
                    type="number"
                    value={formData.Jumlah}
                    onChange={handleChange}
                    error={Boolean(formErrors.Jumlah)}
                    helperText={formErrors.Jumlah}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Satuan"
                    name="Satuan"
                    value={formData.Satuan}
                    onChange={handleChange}
                    error={Boolean(formErrors.Satuan)}
                    helperText={formErrors.Satuan}
                    fullWidth
                    required
                  />
                </Stack>

                <FormControl 
                  fullWidth 
                  error={Boolean(formErrors.Kondisi)}
                  required
                >
                  <InputLabel>Kondisi</InputLabel>
                  <Select
                    name="Kondisi"
                    value={formData.Kondisi}
                    onChange={handleChange}
                    label="Kondisi"
                  >
                    <MenuItem value="Baik">Baik</MenuItem>
                    <MenuItem value="Rusak Ringan">Rusak Ringan</MenuItem>
                    <MenuItem value="Rusak Berat">Rusak Berat</MenuItem>
                  </Select>
                  {formErrors.Kondisi && (
                    <Typography color="error" variant="caption">
                      {formErrors.Kondisi}
                    </Typography>
                  )}
                </FormControl>

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenFormDialog(false);
                      setFormErrors({});
                    }}
                    fullWidth
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained"
                    fullWidth
                  >
                    {isEditMode ? "Simpan" : "Tambah"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Box>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}