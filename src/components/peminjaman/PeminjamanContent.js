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
  CardMedia,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { id } from "date-fns/locale";

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
    jumlah: 1,
    keterangan: "",
  });

  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [pengembalianData, setPengembalianData] = useState({
    tgl_kembali: "",
    kondisi_setelah: "Baik",
    foto_bukti_kembali: null,
    keterangan_kembali: "",
  });

  // State untuk preview foto
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [openFotoDialog, setOpenFotoDialog] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState(null);

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

  // Handler untuk membuka dialog foto
  const handleOpenFoto = (fotoUrl) => {
    setSelectedFoto(fotoUrl);
    setOpenFotoDialog(true);
  };

  // Handler untuk upload foto bukti kembali
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validasi file
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("Ukuran file terlalu besar! Maksimal 5MB");
        setSnackbarOpen(true);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("File harus berupa gambar!");
        setSnackbarOpen(true);
        return;
      }

      setPengembalianData(prev => ({
        ...prev,
        foto_bukti_kembali: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setPengembalianData(prev => ({
      ...prev,
      foto_bukti_kembali: null
    }));
    setFotoPreview(null);
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
      Jumlah: item.jumlah,
      JumlahTersedia: item.jumlah_tersedia, // Ini akan mengambil dari jumlah API
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
    if ((barang.JumlahTersedia || 0) === 0) {
      setError("Barang ini sedang tidak tersedia untuk dipinjam");
      setSnackbarOpen(true);
      return;
    }
    
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
      !formData.barang_id ||
      !formData.jumlah ||
      formData.jumlah < 1
    ) {
      setError("Semua field wajib diisi dengan benar!");
      setSnackbarOpen(true);
      return;
    }

    // Validasi jumlah tersedia
    const selectedBarangData = originalBarangList.find(b => b.id == formData.barang_id);
    if (selectedBarangData && formData.jumlah > (selectedBarangData.JumlahTersedia || 0)) {
      setError(`Jumlah yang diminta (${formData.jumlah}) melebihi stok tersedia (${selectedBarangData.JumlahTersedia || 0})`);
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
      
      // Reset form
      setFormData({
        barang_id: "",
        nama_peminjam: "",
        tanggal_pinjam: "",
        rencana_kembali: "",
        jumlah: 1,
        keterangan: "",
      });
      setSelectedBarang(null);
      
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

  // Updated handlePengembalian function using service
  const handlePengembalian = async () => {
    if (
      !pengembalianData.foto_bukti_kembali ||
      !pengembalianData.keterangan_kembali
    ) {
      setError("Foto bukti and keterangan pengembalian wajib diisi!");
      setSnackbarOpen(true);
      return;
    }

    try {
      setUploadLoading(true);
      
      // Use the service function
      await updatePengembalian(selectedPeminjaman.id, {
        tgl_kembali: formatDateForAPI(pengembalianData.tgl_kembali),
        kondisi_setelah: pengembalianData.kondisi_setelah,
        keterangan_kembali: pengembalianData.keterangan_kembali || '',
        foto_bukti_kembali: pengembalianData.foto_bukti_kembali
      });

      setOpenReturnDialog(false);
      
      // Reset form
      setPengembalianData({
        tgl_kembali: "",
        kondisi_setelah: "Baik",
        foto_bukti_kembali: null,
        keterangan_kembali: "",
      });
      setFotoPreview(null);
      
      await Promise.all([
        fetchBarangTersedia(),
        getPeminjaman().then(setPeminjamanList),
      ]);
      
      setMessage(pengembalianData.foto_bukti_kembali ? "Pengembalian berhasil" : "Pengembalian berhasil");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Gagal mengembalikan");
      setSnackbarOpen(true);
    } finally {
      setUploadLoading(false);
    }
  };

  // Reset return dialog when opening
  const handleOpenReturnDialog = (peminjaman) => {
    setSelectedPeminjaman(peminjaman);
    setPengembalianData({
      tgl_kembali: new Date().toISOString().split("T")[0],
      kondisi_setelah: "Baik",
      foto_bukti_kembali: null,
      keterangan_kembali: "",
    });
    setFotoPreview(null);
    setOpenReturnDialog(true);
  };

  const laporanPeminjamanTemplate = (data) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; max-width: 900px; margin: 0 auto; padding: 20px; position: relative;">
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

    <!-- Garis Pemisah -->
    <div style="margin: 15px 0;">
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
      <hr style="height:0;border:none;border-top:3px solid #000;margin:2px 0;" />
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
    </div>

    <!-- Judul Laporan -->
    <div style="text-align: center; margin: 25px 0;">
      <h2 style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">
        LAPORAN PEMINJAMAN BARANG INVENTARIS
      </h2>
      <div style="font-size: 12pt; margin-top: 8px; color: #666; font-weight: 500;">
        ${data.tanggal_kembali ? 'BARANG TELAH DIKEMBALIKAN' : 'BARANG MASIH DIPINJAM'}
      </div>
    </div>
    
    <!-- Konten Utama -->
    <div style="margin: 30px 0;">
      <!-- Informasi Peminjaman -->
      <div style="margin-bottom: 35px;">
        <h3 style="margin: 0 0 15px 0; font-size: 12pt; color: #000000ff; border-bottom: 3px solid #000000ff; padding-bottom: 8px; text-transform: uppercase;">
          INFORMASI PEMINJAMAN
        </h3>
        <table style="width: 100%; font-size: 12pt; margin-bottom: 20px; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="width: 180px; padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">Nama Barang</td>
            <td style="width: 20px; padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">:</td>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 500; border-bottom: 1px solid #dee2e6;">${data.nama_barang}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">Nama Peminjam</td>
            <td style="padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">:</td>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 500; border-bottom: 1px solid #dee2e6;">${data.nama_peminjam}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">Tanggal Pinjam</td>
            <td style="padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">:</td>
            <td style="padding: 12px 15px; vertical-align: top; border-bottom: 1px solid #dee2e6;">${formatDateDisplay(data.tanggal_pinjam)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">Rencana Kembali</td>
            <td style="padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #dee2e6;">:</td>
            <td style="padding: 12px 15px; vertical-align: top; border-bottom: 1px solid #dee2e6;">${formatDateDisplay(data.rencana_kembali)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; vertical-align: top; font-weight: 600;">Keterangan Pinjam</td>
            <td style="padding: 12px 5px; vertical-align: top; font-weight: 600;">:</td>
            <td style="padding: 12px 15px; vertical-align: top; font-style: ${data.keterangan ? 'normal' : 'italic'}; color: ${data.keterangan ? '#000' : '#666'};">
              ${data.keterangan || "Tidak ada keterangan"}
            </td>
          </tr>
        </table>
      </div>

      <!-- Informasi Pengembalian -->
      <div style="margin-bottom: 35px;">
        <h3 style="margin: 0 0 15px 0; font-size: 12pt; color: ${data.tanggal_kembali ? '#28a745' : '#6c757d'}; border-bottom: 3px solid ${data.tanggal_kembali ? '#28a745' : '#6c757d'}; padding-bottom: 8px; text-transform: uppercase;">
          ${data.tanggal_kembali ? 'INFORMASI PENGEMBALIAN' : 'INFORMASI PENGEMBALIAN'}
        </h3>
        
        ${data.tanggal_kembali ? `
          <table style="width: 100%; font-size: 12pt; margin-bottom: 20px; border-collapse: collapse; background-color: #f0f9ff; border-radius: 8px;">
            <tr>
              <td style="width: 180px; padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">Tanggal Kembali</td>
              <td style="width: 20px; padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">:</td>
              <td style="padding: 12px 15px; vertical-align: top; font-weight: 500; border-bottom: 1px solid #bee5eb;">${formatDateDisplay(data.tanggal_kembali)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">Kondisi Setelah</td>
              <td style="padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">:</td>
              <td style="padding: 12px 15px; vertical-align: top; border-bottom: 1px solid #bee5eb;">
                <span style="background-color: ${
                  data.kondisi_setelah === 'Baik' ? '#d4edda' : 
                  data.kondisi_setelah === 'Rusak Ringan' ? '#fff3cd' : '#f8d7da'
                }; 
                           color: ${
                  data.kondisi_setelah === 'Baik' ? '#155724' : 
                  data.kondisi_setelah === 'Rusak Ringan' ? '#856404' : '#721c24'
                }; 
                           padding: 4px 12px; border-radius: 6px; font-size: 11pt; font-weight: 600;">
                  ${data.kondisi_setelah || "Tidak ada data"}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">Keterangan Kembali</td>
              <td style="padding: 12px 5px; vertical-align: top; font-weight: 600; border-bottom: 1px solid #bee5eb;">:</td>
              <td style="padding: 12px 15px; vertical-align: top; font-style: ${data.keterangan_kembali ? 'normal' : 'italic'}; color: ${data.keterangan_kembali ? '#000' : '#666'}; border-bottom: 1px solid #bee5eb;">
                ${data.keterangan_kembali || "Tidak ada keterangan"}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; vertical-align: top; font-weight: 600;">Foto Bukti</td>
              <td style="padding: 12px 5px; vertical-align: top; font-weight: 600;">:</td>
              <td style="padding: 12px 15px; vertical-align: top;">
                ${data.foto_bukti_kembali ? 
                  `<span style="color: #28a745; font-weight: 600;">✓ Foto bukti tersedia (lihat di bawah)</span>` : 
                  `<span style="color: #6c757d; font-style: italic;">Tidak ada foto bukti</span>`
                }
              </td>
            </tr>
          </table>

          <!-- Foto Bukti Pengembalian -->
          ${data.foto_bukti_kembali ? `
            <div style="margin-top: 25px; page-break-inside: avoid;">
              <h4 style="margin: 0 0 15px 0; font-size: 14pt; color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 5px;">
                FOTO BUKTI PENGEMBALIAN
              </h4>
              <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #dee2e6;">
                <img src="${API_BASE_URL}${data.foto_bukti_kembali}" 
                     alt="Foto Bukti Pengembalian" 
                     style="max-width: 100%; max-height: 400px; width: auto; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 2px solid #ffffff;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; padding: 40px; color: #6c757d; font-style: italic;">
                  <div style="font-size: 48px; margin-bottom: 10px;"></div>
                  <div>Foto tidak dapat ditampilkan</div>
                </div>
                <p style="margin: 15px 0 0 0; font-size: 11pt; color: #6c757d; font-style: italic;">
                  Foto bukti pengembalian barang inventaris
                </p>
              </div>
            </div>
          ` : ''}
        ` : `
          <div style="text-align: center; padding: 30px; background-color: #fff3cd; border-radius: 8px; margin: 20px 0; border: 2px solid #ffeaa7;">
            <div style="font-size: 12px; margin-bottom: 15px;">⏳</div>
            <h4 style="margin: 0 0 8px 0; font-size: 16pt; color: #856404; font-weight: 600;">
              BARANG BELUM DIKEMBALIKAN
            </h4>
            <p style="margin: 0; font-size: 12pt; color: #856404;">
              Status: Masih Dipinjam
            </p>
          </div>
        `}
      </div>

      <!-- Ringkasan -->
      <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-left: 6px solid #007bff; border-radius: 8px; page-break-inside: avoid;">
        <h4 style="margin: 0 0 15px 0; font-size: 14pt; color: #007bff; font-weight: 600;">RINGKASAN PEMINJAMAN</h4>
        <table style="width: 100%; font-size: 11pt; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 200px;">Status Peminjaman:</td>
            <td style="padding: 8px 0; font-weight: 500;">
              ${data.tanggal_kembali ? 
                `<span style="color: #28a745; font-weight: 600;">Sudah Dikembalikan</span>` : 
                `<span style="color: #dc3545; font-weight: 600;">Masih Dipinjam</span>`
              }
            </td>
          </tr>
          ${data.tanggal_kembali ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Durasi Peminjaman:</td>
              <td style="padding: 8px 0; font-weight: 500;">
                ${(() => {
                  const pinjam = new Date(data.tanggal_pinjam);
                  const kembali = new Date(data.tanggal_kembali);
                  const diffTime = Math.abs(kembali - pinjam);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `<span style="font-weight: 600;">${diffDays} hari</span>`;
                })()}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Kondisi Barang:</td>
              <td style="padding: 8px 0; font-weight: 500;">
                <span style="font-weight: 600;">${data.kondisi_setelah}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Dokumentasi:</td>
              <td style="padding: 8px 0; font-weight: 500;">
                ${data.foto_bukti_kembali ? 
                  '<span style="color: #28a745; font-weight: 600;">Foto bukti tersedia</span>' : 
                  '<span style="color: #dc3545; font-weight: 600;">Tanpa foto bukti</span>'
                }
              </td>
            </tr>
          ` : `
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Jatuh Tempo:</td>
              <td style="padding: 8px 0; font-weight: 500;">
                ${formatDateDisplay(data.rencana_kembali)}
                ${(() => {
                  const today = new Date();
                  const dueDate = new Date(data.rencana_kembali);
                  const diffTime = dueDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) {
                    return `<span style="color: #dc3545; font-weight: 600;"> (Terlambat ${Math.abs(diffDays)} hari)</span>`;
                  } else if (diffDays <= 3) {
                    return `<span style="color: #ffc107; font-weight: 600;"> (${diffDays} hari lagi)</span>`;
                  } else {
                    return `<span style="color: #28a745; font-weight: 600;"> (✓ ${diffDays} hari lagi)</span>`;
                  }
                })()}
              </td>
            </tr>
          `}
        </table>
      </div>
    </div>

    <!-- Tanda Tangan -->
    <div style="margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid;">
      <div style="text-align: center; width: 250px;">
        <div style="margin-bottom: 80px; font-weight: 600; font-size: 12pt;">Peminjam,</div>
        <div style="border-bottom: 2px solid #000; margin-bottom: 8px; width: 200px; margin-left: auto; margin-right: auto;"></div>
        <div style="font-size: 11pt; font-weight: 600;">${data.nama_peminjam}</div>
      </div>
      <div style="text-align: center; width: 250px;">
        <div style="margin-bottom: 80px; font-weight: 600; font-size: 12pt;">Mengetahui,</div>
        <div style="border-bottom: 2px solid #000; margin-bottom: 8px; width: 200px; margin-left: auto; margin-right: auto;"></div>
        <div style="font-size: 11pt; font-weight: 600;">Keorganisasian COCONUT</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 9pt; color: #6c757d; text-align: center;">
      <p style="margin: 5px 0;">
        <strong>Dicetak pada:</strong> ${new Date().toLocaleString("id-ID", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
      <p style="margin: 5px 0;">
        <strong>Sistem Inventaris COCONUT</strong> - Laporan Peminjaman Lengkap
      </p>
      ${data.foto_bukti_kembali ? '<p style="margin: 5px 0; font-style: italic;">* Foto bukti pengembalian disertakan dalam laporan ini</p>' : ''}
      <p style="margin: 5px 0; font-style: italic;">
        Dokumen ini digenerate secara otomatis oleh sistem
      </p>
    </div>
  </div>
`;

  function generatePDF(peminjaman) {
    const content = laporanPeminjamanTemplate({
      nama_barang: peminjaman.nama_barang,
      nama_peminjam: peminjaman.nama_peminjam,
      tanggal_pinjam: peminjaman.tanggal_pinjam,
      rencana_kembali: peminjaman.rencana_kembali,
      tanggal_kembali: peminjaman.tanggal_kembali || null,
      kondisi_setelah: peminjaman.kondisi_setelah,
      keterangan: peminjaman.keterangan,
      keterangan_kembali: peminjaman.keterangan_kembali,
      foto_bukti_kembali: peminjaman.foto_bukti_kembali,
    });

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.left = "-9999px";
    document.body.appendChild(printFrame);
    
    printFrame.contentDocument.write(`
      <html>
        <head>
          <title>Laporan Peminjaman Inventaris - ${peminjaman.nama_barang}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              font-size: 12pt; 
              line-height: 1.6; 
              margin: 0;
              padding: 20px;
              color: #333;
              background-color: #ffffff;
            }
            @page { 
              margin: 15mm; 
              size: A4;
            }
            @media print { 
              body { 
                margin: 0;
                padding: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
              .page-break-inside-avoid { page-break-inside: avoid; }
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10pt;
              font-weight: 600;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            img {
              max-width: 100%;
              height: auto;
              page-break-inside: avoid;
            }
            .header-section {
              page-break-inside: avoid;
            }
            .content-section {
              page-break-inside: avoid;
              margin-bottom: 25px;
            }
            .signature-section {
              page-break-inside: avoid;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    
    printFrame.contentDocument.close();
    
    // Wait for images to load before printing
    const images = printFrame.contentDocument.images;
    let loadedImages = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
      // No images, print immediately
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    } else {
      // Wait for all images to load
      for (let i = 0; i < totalImages; i++) {
        images[i].onload = images[i].onerror = () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            setTimeout(() => {
              printFrame.contentWindow.focus();
              printFrame.contentWindow.print();
              setTimeout(() => {
                document.body.removeChild(printFrame);
              }, 1000);
            }, 500);
          }
        };
      }
    }
  }

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
                            xs: "1rem",
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
                            xs: "auto",
                            sm: "2.6em",
                          },
                        }}
                      >
                        {barang.Namabarang}
                      </Typography>
                      <Box sx={{ mt: "auto" }}>
                        <Stack spacing={1}>
                          {/* Informasi Jumlah */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: {
                                    xs: "0.875rem",
                                    sm: "0.813rem",
                                    md: "0.875rem",
                                  },
                                  fontWeight: 600,
                                  color: (barang.JumlahTersedia || 0) > 0 ? "success.main" : "error.main",
                                }}
                              >
                                Jmlh tersedia: {barang.JumlahTersedia || 0}
                              </Typography>
                              <Chip
                                label={barang.Kondisi}
                                size={isMobile ? "medium" : "small"}
                                color={
                                  barang.Kondisi === "Baik" ? "success" : "warning"
                                }
                                sx={{
                                  height: { xs: 28, sm: 24 },
                                  "& .MuiChip-label": {
                                    px: 1.5,
                                    fontSize: {
                                      xs: "0.875rem",
                                      sm: "0.75rem",
                                      md: "0.8125rem",
                                    },
                                  },
                                }}
                              />
                            </Stack>
                            
                            {/* Status indicators berdasarkan stok */}
                            {(barang.JumlahTersedia || 0) === 0 && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip
                                  label="Habis"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{
                                    height: 20,
                                    "& .MuiChip-label": {
                                      px: 1,
                                      fontSize: "0.75rem",
                                    },
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
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
                    Jumlah
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
                    <TableCell colSpan={6} align="center">
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
                          {p.jumlah || 0}
                        </Typography>
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
                                      handleOpenReturnDialog(p);
                                      handleMenuClose();
                                    }}
                                  >
                                    Kembalikan Barang
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
                                  onClick={() => handleOpenReturnDialog(p)}
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
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: (selectedBarang.JumlahTersedia || 0) > 0 ? "success.main" : "error.main",
                                fontWeight: 600 
                              }}
                            >
                              Jumlah barang yang tersedia: {selectedBarang.JumlahTersedia || 0} {selectedBarang.Satuan}
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

                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DatePicker
                          label="Tanggal Pinjam"
                          value={formData.tanggal_pinjam ? new Date(formData.tanggal_pinjam) : null}
                          onChange={(newValue) => {
                            setFormData({
                              ...formData,
                              tanggal_pinjam: newValue ? newValue.toISOString().split("T")[0] : "",
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              required
                              size="medium"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "background.paper",
                                  "& .MuiInputBase-input": {
                                    padding: "10px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#1976d2", // Blue label to match the image
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: "#1976d2",
                                },
                              }}
                            />
                          )}
                          InputProps={{
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DatePicker
                          label="Rencana Kembali"
                          value={formData.rencana_kembali ? new Date(formData.rencana_kembali) : null}
                          onChange={(newValue) => {
                            setFormData({
                              ...formData,
                              rencana_kembali: newValue ? newValue.toISOString().split("T")[0] : "",
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              required
                              size="medium"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "background.paper",
                                  "& .MuiInputBase-input": {
                                    padding: "10px",
                                  },
                                },
                                "& .MuiInputLabel-root": {
                                  color: "#1976d2",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: "#1976d2",
                                },
                              }}
                            />
                          )}
                          InputProps={{
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "4px",
                                backgroundColor: "#fff",
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>

                      <TextField
                        label="Jumlah"
                        name="jumlah"
                        type="number"
                        value={formData.jumlah}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="medium"
                        inputProps={{ min: 1, max: selectedBarang?.JumlahTersedia || 999 }}
                        helperText={selectedBarang ? `Barang yang tersedia: ${selectedBarang.JumlahTersedia || 0}` : ""}
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
                        
                        <Stack direction="column" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Kategori: {selectedBarang.Kategori || "-"}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: (selectedBarang.JumlahTersedia || 0) > 0 ? "success.main" : "error.main",
                              fontWeight: 600 
                            }}
                          >
                            Jumlah barang yang tersedia: {selectedBarang.JumlahTersedia || 0} {selectedBarang.Satuan}
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
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                          <DatePicker
                            label="Tanggal Pinjam"
                            value={formData.tanggal_pinjam ? new Date(formData.tanggal_pinjam) : null}
                            onChange={(newValue) => {
                              setFormData({
                                ...formData,
                                tanggal_pinjam: newValue ? newValue.toISOString().split("T")[0] : "",
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "background.paper",
                                    "& .MuiInputBase-input": {
                                      padding: "8px",
                                    },
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#1976d2",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1976d2",
                                  },
                                  "& .MuiSvgIcon-root": {
                                    color: "#1976d2",
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                          <DatePicker
                            label="Rencana Kembali"
                            value={formData.rencana_kembali ? new Date(formData.rencana_kembali) : null}
                            onChange={(newValue) => {
                              setFormData({
                                ...formData,
                                rencana_kembali: newValue ? newValue.toISOString().split("T")[0] : "",
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "background.paper",
                                    "& .MuiInputBase-input": {
                                      padding: "8px",
                                    },
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#1976d2",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1976d2",
                                  },
                                  "& .MuiSvgIcon-root": {
                                    color: "#1976d2",
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Stack>

                      <TextField
                        label="Jumlah"
                        name="jumlah"
                        type="number"
                        value={formData.jumlah}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="small"
                        inputProps={{ 
                          min: 1, 
                          max: selectedBarang?.JumlahTersedia || 999 
                        }}
                        helperText={selectedBarang ? `Barang yang tersedia: ${selectedBarang.JumlahTersedia || 0}` : ""}
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

      {/* Enhanced Return Dialog with Photo Upload */}
      <Dialog
        open={openReturnDialog}
        onClose={() => setOpenReturnDialog(false)}
        fullScreen={isMobile}
        maxWidth="md"
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
              `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
            color: "white",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >

          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 'inherit' }}>
              Pengembalian Barang
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {selectedPeminjaman?.nama_barang}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton
              onClick={() => setOpenReturnDialog(false)}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Informasi Peminjaman */}
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
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Informasi Peminjaman
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Peminjam:</strong> {selectedPeminjaman?.nama_peminjam}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Tanggal Pinjam:</strong> {formatDateDisplay(selectedPeminjaman?.tanggal_pinjam)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Form Pengembalian */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
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
                  color: "text.primary",
                  mb: 2,
                }}
              >
                Form Pengembalian
              </Typography>

              <Stack spacing={3}>
                {/* Tanggal dan Kondisi */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                    <DatePicker
                      label="Tanggal Kembali"
                      value={pengembalianData.tgl_kembali ? new Date(pengembalianData.tgl_kembali) : null}
                      onChange={(newValue) => {
                        setPengembalianData({
                          ...pengembalianData,
                          tgl_kembali: newValue ? newValue.toISOString().split("T")[0] : "",
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "background.paper",
                              "& .MuiInputBase-input": {
                                padding: "8px",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#1976d2",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1976d2",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#1976d2",
                            },
                          }}
                        />
                      )}
                      InputProps={{
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.paper",
                      },
                    }}
                  >
                    <InputLabel>Kondisi Setelah</InputLabel>
                    <Select
                      value={pengembalianData.kondisi_setelah}
                      onChange={(e) =>
                        setPengembalianData({
                          ...pengembalianData,
                          kondisi_setelah: e.target.value,
                        })
                      }
                      label="Kondisi Setelah"
                      required
                    >
                      <MenuItem value="Baik">Baik</MenuItem>
                      <MenuItem value="Rusak Ringan">Rusak Ringan</MenuItem>
                      <MenuItem value="Rusak Berat">Rusak Berat</MenuItem>
                      <MenuItem value="Hilang">Hilang</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {/* Upload Foto Bukti */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Foto Bukti Pengembalian <span style={{ color: "red" }}>*</span>
                  </Typography>
                  
                  {!fotoPreview ? (
                    <Paper
                      sx={{
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                        },
                      }}
                      onClick={() => document.getElementById('foto-upload').click()}
                    >
                      <PhotoCameraIcon 
                        sx={{ 
                          fontSize: 48, 
                          color: "text.secondary", 
                          mb: 1 
                        }} 
                      />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Upload foto bukti pengembalian
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Klik untuk memilih foto (Maks. 5MB)
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                        component="label"
                      >
                        Pilih Foto
                        <input
                          id="foto-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </Button>
                    </Paper>
                  ) : (
                    <Box sx={{ position: "relative" }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "background.paper",
                        }}
                      >
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            maxHeight: 300,
                            objectFit: "contain",
                            borderRadius: 8,
                          }}
                        />
                        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            {pengembalianData.foto_bukti_kembali?.name}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={handleRemoveFoto}
                            startIcon={<DeleteIcon />}
                          >
                            Hapus
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </Box>

                {/* Keterangan */}
                <TextField
                  label="Keterangan Pengembalian"
                  name="keterangan_kembali"
                  value={pengembalianData.keterangan_kembali}
                  onChange={(e) =>
                   setPengembalianData({
                      ...pengembalianData,
                      keterangan_kembali: e.target.value,
                    })
                  }
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                    },
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: "background.paper" }}>
          <Button
            variant="outlined"
            onClick={() => setOpenReturnDialog(false)}
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
            onClick={handlePengembalian}
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
            {uploadLoading ? <CircularProgress size={24} color="inherit" /> : "Simpan Pengembalian"}
          </Button>
        </DialogActions>
      </Dialog>

           {/* Enhanced Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2,
            px: 3,
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            fontWeight: 600,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: "inherit" }}>
            Detail Peminjaman
          </Typography>
          {isMobile && (
            <IconButton
              onClick={() => setOpenDetailDialog(false)}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {selectedPeminjaman && (
            <Box>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  Informasi Peminjaman
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Peminjam</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedPeminjaman.nama_peminjam}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Barang</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedPeminjaman.nama_barang}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Jumlah</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedPeminjaman.jumlah || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Tanggal Pinjam</Typography>
                    <Typography variant="body1">{formatDateDisplay(selectedPeminjaman.tanggal_pinjam)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Rencana Kembali</Typography>
                    <Typography variant="body1">{formatDateDisplay(selectedPeminjaman.rencana_kembali)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Keterangan</Typography>
                    <Typography variant="body1">{selectedPeminjaman.keterangan || '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: selectedPeminjaman.tanggal_kembali ? 'success.200' : 'divider', bgcolor: selectedPeminjaman.tanggal_kembali ? 'success.50' : 'grey.50', boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: selectedPeminjaman.tanggal_kembali ? 'success.main' : 'text.secondary' }}>
                  Informasi Pengembalian
                </Typography>
                {selectedPeminjaman.tanggal_kembali ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Tanggal Kembali</Typography>
                      <Typography variant="body1" fontWeight={500}>{formatDateDisplay(selectedPeminjaman.tanggal_kembali)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Kondisi Setelah Pengembalian</Typography>
                      <Chip label={selectedPeminjaman.kondisi_setelah || 'Tidak ada data'} color={selectedPeminjaman.kondisi_setelah === 'Baik' ? 'success' : selectedPeminjaman.kondisi_setelah === 'Rusak Ringan' ? 'warning' : 'error'} size="small" sx={{ mt: 0.5 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Keterangan Pengembalian</Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', fontStyle: selectedPeminjaman.keterangan_kembali ? 'normal' : 'italic', color: selectedPeminjaman.keterangan_kembali ? '#000' : '#666' }}>{selectedPeminjaman.keterangan_kembali || 'Tidak ada keterangan'}</Typography>
                    </Grid>
                    {selectedPeminjaman.foto_bukti_kembali && (
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Foto Bukti Pengembalian</Typography>
                        <Paper elevation={1} sx={{ p: 1, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 2 } }} onClick={() => handleOpenFoto(`${API_BASE_URL}${selectedPeminjaman.foto_bukti_kembali}`)}>
                          <Box sx={{ position: 'relative', width: '100%', height: 200, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.neutral' }}>
                            <img src={`${API_BASE_URL}${selectedPeminjaman.foto_bukti_kembali}`} alt="Bukti Pengembalian" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                            <Box sx={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                            </Box>
                            <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 1, p: 0.5 }}>
                              <ZoomInIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>Klik untuk memperbesar</Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" fontStyle="italic">Barang belum dikembalikan</Typography>
                    <Chip label="Masih Dipinjam" color="warning" size="small" sx={{ mt: 1 }} />
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>

        {!isMobile && (
          <DialogActions sx={{ p: 2 }}>
            {selectedPeminjaman && selectedPeminjaman.tanggal_kembali && (
              <Button
                onClick={() => generatePDF(selectedPeminjaman)}
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                size="large"
                sx={{ mr: 2 }}
              >
                Cetak
              </Button>
            )}
            <Button
              onClick={() => setOpenDetailDialog(false)}
              variant="outlined"
              size="large"
            >
              Tutup
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Dialog untuk Zoom Foto */}
      <Dialog
        open={openFotoDialog}
        onClose={() => setOpenFotoDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setOpenFotoDialog(false)}
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              bgcolor: "rgba(0,0,0,0.7)",
              color: "white",
              zIndex: 1,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.9)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedFoto && (
            <img
              src={selectedFoto}
              alt="Foto Bukti"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}