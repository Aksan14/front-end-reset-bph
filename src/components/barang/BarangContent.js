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
import ProtectedRoute from "@/utils/protect_route";
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
      py: 2,
      borderTop: 1,
      borderColor: "divider",
      bgcolor: alpha(customColors.primary.lighter, 0.5),
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
          borderRadius: 1,
          mx: { xs: 0.2, sm: 0.5 },
          minWidth: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
          fontSize: { xs: "0.875rem", sm: "1rem" },
        },
      }}
    />
  </Box>
);

const tableContainerStyles = {
  overflowX: "auto",
  "& table": {
    minWidth: { xs: 650, sm: 800 },
    "& th, & td": {
      px: { xs: 1, sm: 2 },
      py: { xs: 1.5, sm: 2 },
      "&:first-of-type": {
        pl: { xs: 2, sm: 3 },
      },
      "&:last-of-type": {
        pr: { xs: 2, sm: 3 },
      },
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

export default function DataBarang() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const itemsPerPage = 10;
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const fetchBarang = async () => {
    try {
      setLoading(true);
      const result = await barangService.getAll();
      if (result.success) {
        setBarang(result.data);
        setSnackbar({
          open: true,
          message: "Data barang berhasil dimuat",
          severity: "success",
        });
      } else {
        setBarang([]);
        setSnackbar({
          open: true,
          message: result.message || "Gagal mengambil data barang",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching barang:", error);
      setBarang([]);
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

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        // Jika query kosong, fetch semua data
        await fetchBarang();
        return;
      }

      setLoading(true);
      const result = await barangService.search(searchQuery);
      if (result.success) {
        setBarang(result.data);
        setCurrentPage(1);
        setDimusnahkanPage(1);
        setSnackbar({
          open: true,
          message: "Pencarian berhasil",
          severity: "success",
        });
      } else {
        setBarang([]);
        setSnackbar({
          open: true,
          message: result.message || "Gagal mencari data barang",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error searching barang:", error);
      setBarang([]);
      setSnackbar({
        open: true,
        message: "Terjadi kesalahan saat mencari data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          ml: { xs: 1, sm: 2 },
          borderRadius: { xs: "16px", sm: "24px" },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Header Section */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                color: "primary.dark",
                mb: 1,
              }}
            >
              Data Inventaris
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              }}
            >
              Kelola data barang inventaris
            </Typography>
          </Box>

          {/* Search Section */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                width: '100%'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  width: '100%'
                }}>
                  <TextField
                    size="small"
                    placeholder="Cari barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(customColors.primary.lighter, 0.8)
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                      minWidth: { xs: '80px', sm: '100px' },
                      height: '40px',
                      borderRadius: 2,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isMobile ? 'Cari' : 'Cari Barang'}
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAdd}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    height: '40px',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Tambah Barang
                </Button>
              </Box>
            </Stack>
          </Card>

          {/* Mobile Search & Add Buttons */}
          {isMobile && !showMobileSearch && (
            <>
              <Fab
                color="primary"
                aria-label="search"
                onClick={() => setShowMobileSearch(true)}
                sx={{
                  position: "fixed",
                  right: 16,
                  top: 16,
                  zIndex: 1000,
                }}
              >
                <SearchIcon />
              </Fab>
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenAdd}
                sx={{
                  position: "fixed",
                  right: 16,
                  bottom: 16,
                  zIndex: 1000,
                }}
              >
                <AddIcon />
              </Fab>
            </>
          )}

          {/* Active Items Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                }}
              >
                Daftar Barang Aktif
              </Typography>
            </Box>

            <TableContainer sx={tableContainerStyles}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: alpha(customColors.primary.lighter, 0.5),
                    }}
                  >
                    {tableColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          ...tableHeaderCellStyles,
                          display: {
                            xs: column.mobile ? "table-cell" : "none",
                            sm: "table-cell",
                          },
                          minWidth: column.minWidth
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell 
                        colSpan={7} 
                        align="center" 
                        sx={{ 
                          py: 8,
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={32} />
                            <Typography sx={{ mt: 2 }}>Memuat data...</Typography>
                          </>
                        ) : (
                          <>
                            <ImageIcon sx={{ fontSize: 48, color: "#cbd5e0", mb: 2 }} />
                            <Typography>Tidak ada data barang</Typography>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <ImageIcon
                          sx={{ fontSize: 48, color: "#cbd5e0", mb: 1 }}
                        />
                        <Typography>Tidak ada data barang</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          {item.Foto ? (
                            <Avatar
                              src={`${API_BASE_URL}${item.Foto}`}
                              alt={item.Namabarang}
                              sx={{ width: 56, height: 56, cursor: "pointer" }}
                              onClick={() =>
                                handleImageClick(`${API_BASE_URL}${item.Foto}`)
                              }
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
                          <Chip label={item.Kategori || "-"} size="small" />
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <TablePaginationStyled
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
              />
            )}
          </Card>

          {/* Destroyed Items Table */}
          {barang?.some((item) => item.Kondisi === "Dimusnahkan") && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(customColors.error.main, 0.02),
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <WarningIcon color="error" sx={{ fontSize: 20 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1.1rem", sm: "1.2rem" },
                    color: customColors.error.dark,
                  }}
                >
                  Barang Dimusnahkan
                </Typography>
              </Box>

              <TableContainer
                sx={{
                  overflowX: "auto",
                  "& table": {
                    minWidth: { xs: 650, md: 800 },
                  },
                  "& td, & th": {
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1.5, sm: 2 },
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Foto
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Nama Barang
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Kategori
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Jumlah
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Satuan
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#4a5568" }}>
                        Kondisi
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDimusnahkanItems.map((item) => (
                      <TableRow key={item.id} sx={{ opacity: 0.7 }}>
                        <TableCell>
                          {item.Foto ? (
                            <Avatar
                              src={`${API_BASE_URL}${item.Foto}`}
                              alt={item.Namabarang}
                              sx={{ width: 56, height: 56, cursor: "pointer" }}
                              onClick={() =>
                                handleImageClick(`${API_BASE_URL}${item.Foto}`)
                              }
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
                          <Chip label={item.Kategori || "-"} size="small" />
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
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Dimusnahkan */}
              {!loading && totalDimusnahkanPages > 0 && (
                <TablePaginationStyled
                  count={totalDimusnahkanPages}
                  page={dimusnahkanPage}
                  onChange={(e, page) => setDimusnahkanPage(page)}
                />
              )}
            </Card>
          )}

          <Dialog
            open={openPopup}
            onClose={handleClosePopup}
            maxWidth="md"
            fullWidth
            sx={imageDialogStyles}
          >
            <DialogContent>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Gambar diperbesar"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/fallback-image.png";
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePopup} color="primary">
                Tutup
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openFormDialog}
            onClose={() => setOpenFormDialog(false)}
            maxWidth="sm"
            fullWidth
            sx={formDialogStyles}
          >
            <DialogTitle>
              {isEditMode ? "Form Edit Barang" : "Form Tambah Barang"}
            </DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
                <TextField
                  label="Namabarang"
                  name="Namabarang"
                  value={formData.Namabarang}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.Namabarang}
                  helperText={formErrors.Namabarang}
                  sx={formFieldStyles}
                />
                <TextField
                  label="Kategori"
                  name="Kategori"
                  value={formData.Kategori}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.Kategori}
                  helperText={formErrors.Kategori}
                  sx={formFieldStyles}
                />
                <TextField
                  label="Jumlah"
                  name="Jumlah"
                  type="number"
                  value={formData.Jumlah}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  error={!!formErrors.Jumlah}
                  helperText={formErrors.Jumlah}
                  sx={formFieldStyles}
                />
                <TextField
                  label="Satuan"
                  name="Satuan"
                  value={formData.Satuan}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formErrors.Satuan}
                  helperText={formErrors.Satuan}
                  sx={formFieldStyles}
                />
                <FormControl
                  fullWidth
                  required
                  error={!!formErrors.Kondisi}
                  sx={formFieldStyles}
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
                    <Typography color="error">{formErrors.Kondisi}</Typography>
                  )}
                </FormControl>
                <TextField
                  type="file"
                  label="Foto"
                  name="Foto"
                  onChange={handleFileChange}
                  fullWidth
                  inputProps={{ accept: "image/jpeg,image/png" }}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.Foto}
                  helperText={formErrors.Foto}
                  sx={formFieldStyles}
                />
                {previewImage && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Pratinjau Gambar:</Typography>
                    <img
                      src={previewImage}
                      alt="Pratinjau"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <DialogActions>
                  <Button
                    onClick={() => setOpenFormDialog(false)}
                    sx={{ borderRadius: 2 }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                  >
                    Simpan
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>
        </Stack>
      </Box>
    </ProtectedRoute>
  );
}