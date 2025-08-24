"use client";

// Available categories
const CATEGORIES = [
  "Semua",
  "Buku",
  "Algo", 
  "Dapur",
  "Lainnya"
];

import { useEffect, useState, useRef } from "react";
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
  CircularProgress,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { getBarangTersedia } from "@/services/peminjamanService";
import {
  startReport,
  getReports,
  getReportDetail,
  addCheck,
  updateCheck,
  deleteCheck,
  finalizeReport,
} from "@/services/pengecekanService";
import { API_BASE_URL } from "@/config/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";

// Fungsi untuk memformat tanggal ke format Indonesia
const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return "...........................";
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return "...........................";
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

const safeString = (value) => {
  if (value == null) return "...........................";
  if (typeof value === "object") {
    return value.name ? String(value.name) : "...........................";
  }
  return String(value);
};

// Template untuk Laporan Pengecekan Inventaris
const laporanTemplate = (data) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: center;">
        <img src="/images/coconut-logo.png" alt="COCONUT Logo" style="width: 70px; height: auto; margin-right: 20px;" />
        <div>
          <h2 style="margin: 0; font-size: 14pt;">COMPUTER CLUB ORIENTED NETWORK, UTILITY AND TECHNOLOGY (COCONUT)</h2>
          <p style="margin: 0; font-size: 10pt;">Jl. Monumen Emmy Saelan III No. 70 Karunrung, Kec. Rappocini, Makassar</p>
          <p style="margin: 0; font-size: 10pt;">Telp. 085240791254/0895801262897, Website: www.coconut.or.id, Email: hello@coconut.or.id</p>
        </div>
      </div>
      <!-- Tiga garis horizontal -->
        <div style="margin-top: 10px; margin-bottom: 10px;">
          <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
          <hr style="height:0;border:none;border-top:3px solid #000;margin:2px 0;" />
          <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
        </div>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <h3 style="margin: 0; font-size: 16pt; text-decoration: underline;">LAPORAN PENGECEKAN INVENTARIS BULANAN</h3>
    </div>
    
    <div style="margin: 20px 0;">
      <table style="width: 100%; font-size: 12pt; margin-bottom: 20px;">
        <tr>
          <td style="width: 120px;">Petugas</td>
          <td style="width: 20px;">:</td>
          <td>${safeString(data.petugas)}</td>
          <td style="width: 120px;">Item Dicek</td>
          <td style="width: 20px;">:</td>
          <td>${data.itemsDicek || 0}</td>
        </tr>
        <tr>
          <td>Tanggal</td>
          <td>:</td>
          <td>${formatTanggalIndonesia(data.tanggal)}</td>
          <td>Kondisi Baik</td>
          <td>:</td>
          <td>${data.kondisiBaik || 0}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>:</td>
          <td>${safeString(data.status).toUpperCase()}</td>
          <td>Kondisi Rusak</td>
          <td>:</td>
          <td>${data.kondisiRusak || 0}</td>
        </tr>
        <tr>
          <td>Total Item</td>
          <td>:</td>
          <td>${data.totalItem || 0}</td>
          <td>Hilang</td>
          <td>:</td>
          <td>${data.hilang || 0}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0; color: #2e7d32;">BARANG YANG SUDAH DICEK</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
        <thead>
          <tr style="background-color: #46a3ba; color: white;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Barang</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Gambar</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Kondisi</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${data.checkedItems?.map((item, index) => `
            <tr style="${index % 2 === 1 ? 'background-color: #f5f5f5;' : ''}">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(item.Namabarang || item.nama)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                ${item.image_url ? `<img src='${item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}`}' alt='Gambar' style='max-width:90px;max-height:90px;object-fit:contain;' />` : '-'}
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; color: ${
                item.kondisi === 'baik' ? '#2e7d32' : 
                item.kondisi === 'rusak' ? '#f57c00' : 
                item.kondisi === 'hilang' ? '#d32f2f' : '#000'
              }; font-weight: bold;">${safeString(item.kondisi).toUpperCase()}</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(item.keterangan)}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" style="border: 1px solid #000; padding: 12px; text-align: center; color: #666;">Tidak ada barang yang sudah dicek</td></tr>'}
        </tbody>
      </table>
    </div>
    
    ${data.uncheckedItems?.length > 0 ? `
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0; color: #d32f2f;">BARANG YANG BELUM DICEK</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
        <thead>
          <tr style="background-color: #f44336; color: white;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Barang</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Gambar</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.uncheckedItems.map((item, index) => `
            <tr style="${index % 2 === 1 ? 'background-color: #fff5f5;' : ''}">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(item.Namabarang || item.nama)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                ${item.image_url ? `<img src='${item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}`}' alt='Gambar' style='max-width:90px;max-height:90px;object-fit:contain;' />` : '-'}
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #d32f2f; font-weight: bold;">BELUM DICEK</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div style="margin-top: 60px; text-align: right;">
      <p style="margin: 0;">Makassar, ${formatTanggalIndonesia(new Date())}</p>
      <p style="margin: 10px 0; font-weight: bold;">Petugas Pengecekan,</p>
      <p style="margin-top: 60px; font-weight: bold; text-decoration: underline;">${safeString(data.petugas)}</p>
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
`;

export default function PengecekanPage() {
  const [petugas, setPetugas] = useState("");
  const [barangList, setBarangList] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportId, setReportId] = useState(null);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [barang, setBarang] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [editIndex, setEditIndex] = useState(null);
  const [checkIndex, setCheckIndex] = useState(null);
  const [formData, setFormData] = useState({
    inventaris_id: "",
    kondisi: "baik",
    keterangan: "",
  });
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewedItem, setViewedItem] = useState(null);
  const [openCheckDialog, setOpenCheckDialog] = useState(false);
  const [openWorkspaceDialog, setOpenWorkspaceDialog] = useState(false);
  
  // State untuk dialog print dan preview
  const [viewContentOpen, setViewContentOpen] = useState(false);
  const [viewContent, setViewContent] = useState("");
  const printRef = useRef(null);

  // Update state untuk menyimpan data asli
  const [originalBarangList, setOriginalBarangList] = useState([]);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateTimeDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchBarangTersedia = async () => {
    try {
      setLoading(true);
      const data = await getBarangTersedia();
      // Transform the data to match the expected structure
      const transformedData = data.map(item => ({
        id: item.id,
        Namabarang: item.nama_barang,
        Kategori: item.kategori,
        Satuan: item.satuan,
        Kondisi: item.kondisi,
        Foto: item.foto
      }));
      
      setBarangList(transformedData);
      setOriginalBarangList(transformedData); // Simpan data asli
      setMessage("Data barang tersedia berhasil dimuat");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error fetching barang tersedia:", error);
      setBarangList([]);
      setOriginalBarangList([]); // Reset data asli
      setError(error.message || "Terjadi kesalahan saat mengambil data barang");
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
      updateBarangTable(filtered); // Update tabel barang dengan hasil filter
    } catch (error) {
      console.error("Error filtering:", error);
      setError("Terjadi kesalahan saat memfilter data");
      setSnackbarOpen(true);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    filterBarang(value, selectedCategory);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await barangService.search(searchQuery);
      console.log("Search results:", result.data); // Log debug
      if (result.success) {
        const tersedia = result.data.filter(
          (item) => item.Kondisi !== "Dimusnahkan"
        );
        setBarangList(tersedia);
        updateBarangTable(tersedia);
        setMessage("Pencarian berhasil");
        setSnackbarOpen(true);
      } else {
        setBarangList([]);
        setError(result.message || "Gagal mencari data barang");
      }
    } catch (error) {
      console.error("Error searching barang:", error);
      setBarangList([]);
      setError("Terjadi kesalahan saat mencari data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getReports();
      console.log("Fetched reports:", response.data); // Log debug
      setReports(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReport = async (petugas) => {
    try {
      setLoading(true);
      const response = await startReport(petugas);
      setReportId(response.data.id);
      setStatus("draft");
      setMessage(response.message || "Sesi pengecekan berhasil dimulai");
      setSnackbarOpen(true);
      fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await getReportDetail(reportId);
      console.log("Report detail response:", response.data); // Log debug
      setReportId(reportId);
      setSelectedReport(response.data.report);
      setStatus(response.data.report.status);
      const enrichedChecks = (response.data.checks || []).map((check) => {
        const item = barangList.find((item) => item.id === check.inventaris_id);
        return {
          ...check,
          nama: item ? item.Namabarang : `Item ${check.inventaris_id}`,
          image_url: item
            ? `${API_BASE_URL}${item.Foto}`
            : `https://via.placeholder.com/50?text=Item+${check.inventaris_id}`,
          checked: true,
        };
      });
      console.log("Enriched checks:", enrichedChecks); // Log debug
      const allBarang = barangList.map((item) => {
        const check = enrichedChecks.find((c) => c.inventaris_id === item.id);
        return {
          id: item.id,
          inventaris_id: item.id,
          nama: item.Namabarang || `Item ${item.id}`,
          image_url: item.Foto
            ? `${API_BASE_URL}${item.Foto}`
            : `https://via.placeholder.com/50?text=Item+${item.id}`,
          checked: !!check,
          checkId: check ? check.id : null,
          kondisi: check ? check.kondisi : "",
          keterangan: check ? check.keterangan : "",
        };
      });
      setBarang(allBarang);
      console.log("Updated barang state:", allBarang); // Log debug
      setMessage(response.message || "Detail laporan dimuat");
      setSnackbarOpen(true);
      setOpenWorkspaceDialog(true); // Open the popup dialog
    } catch (err) {
      console.error("Error fetching report detail:", err);
      setError(err.message || "Gagal memuat detail laporan");
    } finally {
      setLoading(false);
    }
  };

  const updateBarangTable = (newBarangList) => {
    console.log("Updating barang table with:", newBarangList); // Log debug
    if (reportId && selectedReport) {
      const allBarang = newBarangList.map((item) => {
        const existing = barang.find((b) => b.inventaris_id === item.id);
        return {
          id: item.id,
          inventaris_id: item.id,
          nama: item.Namabarang || `Item ${item.id}`,
          kategori: item.Kategori || "-",
          image_url: item.Foto
            ? `${API_BASE_URL}${item.Foto}`
            : `https://via.placeholder.com/50?text=Item+${item.id}`,
          checked: existing ? existing.checked : false,
          checkId: existing ? existing.checkId : null,
          kondisi: existing ? existing.kondisi : "",
          keterangan: existing ? existing.keterangan : "",
        };
      });
      setBarang(allBarang);
      console.log("Updated barang table:", allBarang); // Log debug
    }
  };

  const handleAddCheck = async () => {
    if (status !== "draft") {
      setError("Tidak bisa menambahkan check, status bukan draft");
      setCheckIndex(null);
      setOpenCheckDialog(false);
      return;
    }
    const item = barang[checkIndex];
    if (!item.inventaris_id) {
      setError("Pilih barang terlebih dahulu");
      setCheckIndex(null);
      setOpenCheckDialog(false);
      return;
    }
    try {
      setLoading(true);
      const response = await addCheck(
        reportId,
        item.inventaris_id,
        formData.kondisi,
        formData.keterangan
      );
      await handleContinueReport(reportId);
      setMessage(response.message || "Data pengecekan berhasil ditambahkan");
      setSnackbarOpen(true);
      setCheckIndex(null);
      setOpenCheckDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCheck = async (checkId, kondisi, keterangan) => {
    if (status !== "draft") {
      setError("Tidak bisa mengupdate check, status bukan draft");
      return;
    }
    try {
      setLoading(true);
      const inventarisId = barang.find(
        (item) => item.checkId === checkId
      )?.inventaris_id;
      if (!inventarisId) {
        throw new Error("Inventaris ID tidak ditemukan untuk check ini");
      }
      const payload = {
        inventaris_id: inventarisId,
        kondisi,
        keterangan,
      };
      const response = await updateCheck(checkId, payload);
      await handleContinueReport(reportId);
      setMessage(response.message || "Data pengecekan berhasil diperbarui");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating check:", err);
      setError(`Gagal memperbarui: ${err.message || "Internal Server Error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheck = async (checkId) => {
    if (status !== "draft") {
      setError("Tidak bisa menghapus check, status bukan draft");
      return;
    }
    try {
      setLoading(true);
      const response = await deleteCheck(checkId);
      const updatedBarang = barang.map((item) =>
        item.checkId === checkId
          ? {
              ...item,
              checked: false,
              checkId: null,
              kondisi: "",
              keterangan: "",
            }
          : item
      );
      setBarang(updatedBarang);
      setMessage(response.message || "Data pengecekan berhasil dihapus");
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeReport = async () => {
    if (status !== "draft") {
      setError("Sesi sudah difinalisasi");
      return;
    }
    try {
      setLoading(true);
      const response = await finalizeReport(reportId);
      setStatus("final");
      await handleContinueReport(reportId);
      setMessage(response.message || "Sesi pengecekan berhasil difinalisasi");
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...barang];
    updated[index][field] = value;
    setBarang(updated);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData({
      inventaris_id: barang[index].inventaris_id,
      kondisi: barang[index].kondisi || "baik",
      keterangan: barang[index].keterangan || "",
    });
    setOpenCheckDialog(true);
  };

  const handleCheck = (index) => {
    setCheckIndex(index);
    setFormData({
      inventaris_id: barang[index].inventaris_id,
      kondisi: "baik",
      keterangan: "",
    });
    setOpenCheckDialog(true);
  };

  const handleViewItem = (item) => {
    setViewedItem(item);
    setOpenViewDialog(true);
  };

  const handleSaveEdit = async () => {
    if (status !== "draft") {
      setError("Tidak bisa mengedit check, status bukan draft");
      setEditIndex(null);
      setCheckIndex(null);
      setOpenCheckDialog(false);
      return;
    }
    // Validasi semua field wajib diisi
    if (!formData.inventaris_id || !formData.kondisi || !formData.keterangan) {
      setError("Semua field wajib diisi!");
      setSnackbarOpen(true);
      return;
    }
    if (editIndex !== null) {
      const checkId = barang[editIndex].checkId;
      if (checkId) {
        await handleUpdateCheck(checkId, formData.kondisi, formData.keterangan);
      } else {
        setError("ID check tidak ditemukan");
      }
    } else if (checkIndex !== null) {
      await handleAddCheck();
    }
    setEditIndex(null);
    setCheckIndex(null);
    setOpenCheckDialog(false);
  };

  const generatePDF = () => {
    try {
      // Siapkan data untuk template
      const selectedReportData = reports.find(r => r.id === reportId);
      const checkedItems = barang.filter(item => item.checked);
      const uncheckedItems = barang.filter(item => !item.checked);
      
      const baikCount = checkedItems.filter(item => item.kondisi === "baik").length;
      const rusakCount = checkedItems.filter(item => item.kondisi === "rusak").length;
      const hilangCount = checkedItems.filter(item => item.kondisi === "hilang").length;

      const reportData = {
        petugas: selectedReportData?.petugas || petugas,
        tanggal: selectedReportData?.tanggal_laporan || new Date(),
        status: selectedReportData?.status || "DRAFT",
        totalItem: barang.length,
        itemsDicek: checkedItems.length,
        kondisiBaik: baikCount,
        kondisiRusak: rusakCount,
        hilang: hilangCount,
        checkedItems: checkedItems,
        uncheckedItems: uncheckedItems.length > 0 ? uncheckedItems : null
      };

      // Generate HTML content
      const content = laporanTemplate(reportData);
      setViewContent(content);
      setViewContentOpen(true);
      
      setMessage("Laporan berhasil digenerate. Silakan print atau simpan.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError(`Gagal membuat laporan: ${error.message || "Terjadi kesalahan"}`);
      setSnackbarOpen(true);
    }
  };

  const handlePrint = () => {
    if (!viewContent) {
      setError("Konten laporan tidak tersedia. Silakan generate laporan terlebih dahulu.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "absolute";
      printFrame.style.left = "-9999px";
      document.body.appendChild(printFrame);
      
      printFrame.contentDocument.write(`
        <html>
          <head>
            <title>Laporan Pengecekan Inventaris</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12pt;
                line-height: 1.5; 
                margin: 20px;
              }
              @page { margin: 20mm; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${viewContent}
          </body>
        </html>
      `);
      
      printFrame.contentDocument.close();
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      
      setMessage("🖨️ Dialog print telah dibuka. Silakan pilih printer dan cetak laporan.");
      setSnackbarOpen(true);
      
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    } catch (error) {
      console.error("Error printing:", error);
      setError("Gagal membuka dialog print. Silakan coba lagi.");
      setSnackbarOpen(true);
    }
  };

  const ReportCard = ({ report }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        borderLeft: `4px solid ${
          report.status === "final"
            ? "#4CAF50"
            : report.status === "draft"
            ? "#FFC107"
            : "#9E9E9E"
        }`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: "16px !important" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: report.status === "final" ? "#4CAF50" : "#FFC107",
                  width: 40,
                  height: 40,
                  fontSize: "1rem",
                }}
              >
                {report.kode_report.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {report.kode_report}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTimeDisplay(report.tanggal_report)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ display: "flex", gap: 1 }}>
              <span style={{ fontWeight: "500", color: "#616161" }}>
                Petugas:
              </span>
              <span>{report.petugas}</span>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Chip
              label={report.status.toUpperCase()}
              size="small"
              sx={{
                fontWeight: "600",
                backgroundColor:
                  report.status === "final"
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(255, 193, 7, 0.1)",
                color: report.status === "final" ? "#2E7D32" : "#FF8F00",
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            {report.status === "draft" ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleContinueReport(report.id)}
                sx={{
                  borderRadius: "8px",
                  px: 2,
                  textTransform: "none",
                }}
              >
                Lanjutkan
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon fontSize="small" />}
                onClick={() => handleContinueReport(report.id)}
                sx={{
                  borderRadius: "8px",
                  px: 2,
                  textTransform: "none",
                }}
              >
                Detail
              </Button>
            )}
            <Tooltip
              title={
                report.status !== "final"
                  ? "Hanya tersedia untuk laporan final"
                  : "Download PDF"
              }
              arrow
            >
              {/* <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<PrintIcon fontSize="small" />}
                onClick={() => {
                  handleContinueReport(report.id);
                  setTimeout(generatePDF, 500); // Tunggu hingga data dimuat
                }}
                disabled={report.status !== "final"}
                sx={{
                  borderRadius: "8px",
                  px: 2,
                  textTransform: "none",
                }}
              >
                PDF
              </Button> */}
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchBarangTersedia();
        await fetchReports();
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message || "Gagal memuat data");
      }
    };
    if (isMounted) loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Effect untuk handle perubahan kategori
  useEffect(() => {
    if (originalBarangList.length > 0) {
      filterBarang(searchQuery, selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <ProtectedRoute>
      <Box
        sx={{
          width: "100%",
          backgroundColor: '#f8fafc',
          px: { xs: 0, sm: 2 }, // Reduced padding
          py: { xs: 1, sm: 2 },
          ml: {
            xs: 0,
            sm: "0px",
            md: "20px",
          },
          mr: { xs: 0, sm: 2 }, // Added right margin
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={error ? "error" : "success"}
            sx={{ width: "100%" }}
          >
            {error || message}
          </Alert>
        </Snackbar>

        <Card
          sx={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            p: 3,
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" }, // Stretch on mobile, center on desktop
              gap: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 800,
                color: "primary.dark",
                mb: 0.5,
              }}
            >
              Halaman Pengecekan Inventaris
            </Typography>

            {!reportId && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <TextField
                  label="Nama Petugas"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  required
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: 200 }, // Fixed width on desktop, full width on mobile
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleStartReport(petugas)}
                  disabled={loading || !petugas.trim()}
                  sx={{
                    height: 40,
                    width: { xs: "100%", sm: "auto" }, // Full width on mobile, auto on desktop
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: "0.875rem",
                  }}
                >
                  Buat Laporan Baru
                </Button>
              </Box>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !reports || reports.length === 0 ? (
            // Added !reports || to check if reports is null or undefined
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "background.default",
                borderRadius: "8px",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Tidak ada data laporan.
              </Typography>
            </Box>
          ) : (
            reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </Card>

        <Dialog
          open={openWorkspaceDialog}
          onClose={() => setOpenWorkspaceDialog(false)}
          maxWidth="lg" // Changed from xl to lg
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              width: { xs: "100%", sm: "90%", md: "80%" },
              m: { xs: 0, sm: 2 },
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle>
            Workspace Pengecekan: {selectedReport?.kode_report} (
            {status.toUpperCase()})
          </DialogTitle>
          <DialogContent>
            {reportId && selectedReport && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Petugas:</strong> {selectedReport.petugas}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Tanggal Cek:</strong>{" "}
                        {formatDateDisplay(selectedReport.tanggal_report)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Kode Report:</strong>{" "}
                        {selectedReport.kode_report || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}></Grid>
                  </Grid>
                </Box>

                <Box sx={{ mb: 3, display: "flex", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    label="Cari Barang"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              setSearchQuery('');
                              filterBarang('', selectedCategory);
                            }}
                            edge="end"
                            size="small"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormControl 
                    size="small" 
                    sx={{ 
                      minWidth: { xs: '100%', sm: 200 }
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
                  {/* <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                  >
                    Cari
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchQuery("");
                      fetchBarangTersedia();
                    }}
                    startIcon={<RefreshIcon />}
                  >
                    Reset
                  </Button> */}
                </Box>

                <TableContainer
                  component={Paper}
                  sx={{
                    "& .MuiTable-root": {
                      minWidth: { xs: "100%", sm: 650 }, // Reduced from 800 to 650
                    },
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "10%" }}>Gambar</TableCell>
                        <TableCell sx={{ width: "15%" }}>Nama Barang</TableCell>
                        <TableCell sx={{ width: "10%" }}>Kategori</TableCell>
                        <TableCell sx={{ width: "10%" }}>Status</TableCell>
                        <TableCell sx={{ width: "10%" }}>Kondisi</TableCell>
                        <TableCell sx={{ width: "20%" }}>Keterangan</TableCell>
                        {status === "draft" && (
                          <TableCell sx={{ width: "20%" }}>Aksi</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={status === "draft" ? 6 : 5}
                            align="center"
                          >
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : barang.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={status === "draft" ? 6 : 5}
                            align="center"
                          >
                            Tidak ada data barang.
                          </TableCell>
                        </TableRow>
                      ) : (
                        barang.map((item, idx) => (
                          <TableRow
                            key={item.id}
                            sx={{
                              backgroundColor: item.checked
                                ? "rgba(76, 175, 80, 0.05)"
                                : status === "final"
                                ? "rgba(244, 67, 54, 0.05)"
                                : "inherit",
                            }}
                          >
                            <TableCell>
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.nama || 'Gambar barang'} // Tambahkan alt text
                                  width={64}
                                  height={64}
                                  style={{ objectFit: "cover" }}
                                  priority={true}
                                />
                              ) : (
                                <Avatar
                                  variant="square"
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    cursor: "pointer",
                                    bgcolor: "grey.300",
                                  }}
                                  onClick={() => handleViewItem(item)}
                                >
                                  {item.nama?.charAt(0) || '?'}
                                </Avatar>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                sx={{
                                  cursor: "pointer",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                                onClick={() => handleViewItem(item)}
                              >
                                {item.nama}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.kategori || "-"}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </TableCell>
                            <TableCell>
                              {item.checked ? (
                                <Chip
                                  label="Sudah Dicek"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  label="Belum Dicek"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {item.checked ? (
                                <Chip
                                  label={item.kondisi || "-"}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      item.kondisi === "baik"
                                        ? "rgba(76, 175, 80, 0.1)"
                                        : item.kondisi === "rusak"
                                        ? "rgba(244, 67, 54, 0.1)"
                                        : "rgba(255, 152, 0, 0.1)",
                                    color:
                                      item.kondisi === "baik"
                                        ? "#2E7D32"
                                        : item.kondisi === "rusak"
                                        ? "#C62828"
                                        : "#EF6C00",
                                  }}
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {item.keterangan || "-"}
                              </Typography>
                            </TableCell>
                            {status === "draft" && (
                              <TableCell>
                                <Tooltip title="Edit">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEdit(idx)}
                                    disabled={!item.checked}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Hapus">
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleDeleteCheck(item.checkId)
                                    }
                                    disabled={!item.checked}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                {!item.checked && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleCheck(idx)}
                                    sx={{ ml: 1 }}
                                  >
                                    Cek
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenWorkspaceDialog(false);
                setReportId(null);
              }}
            >
              Kembali
            </Button>
            {status === "draft" ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinalizeReport}
              >
                Finalisasi
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={generatePDF}
              >
                Export PDF
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          maxWidth="sm" // Changed from md to sm
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              width: { xs: "100%", sm: "90%" },
              m: { xs: 0, sm: 2 },
            },
          }}
        >
          <DialogTitle>Detail Barang</DialogTitle>
          <DialogContent>
            {viewedItem && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      p: 2,
                      backgroundColor: "background.paper",
                    }}
                  >
                    {viewedItem.image_url ? (
                      <img
                        src={viewedItem.image_url}
                        alt={viewedItem.nama}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          objectFit: "contain",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <Avatar
                        variant="square"
                        sx={{
                          width: 200,
                          height: 200,
                          fontSize: 72,
                          bgcolor: "grey.300",
                        }}
                      >
                        {viewedItem.nama.charAt(0)}
                      </Avatar>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="ID Barang"
                        secondary={viewedItem.id || "-"}
                        secondaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Nama Barang"
                        secondary={viewedItem.nama || "-"}
                        secondaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Status Pengecekan"
                        secondary={
                          <Chip
                            label={
                              viewedItem.checked ? "Sudah Dicek" : "Belum Dicek"
                            }
                            size="small"
                            color={viewedItem.checked ? "success" : "error"}
                            variant="outlined"
                          />
                        }
                      />
                    </ListItem>
                    {viewedItem.checked && (
                      <>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Kondisi"
                            secondary={
                              <Chip
                                label={viewedItem.kondisi || "-"}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    viewedItem.kondisi === "baik"
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : viewedItem.kondisi === "rusak"
                                      ? "rgba(244, 67, 54, 0.1)"
                                      : "rgba(255, 152, 0, 0.1)",
                                  color:
                                    viewedItem.kondisi === "baik"
                                      ? "#2E7D32"
                                      : viewedItem.kondisi === "rusak"
                                      ? "#C62828"
                                      : "#EF6C00",
                                }}
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Keterangan"
                            secondary={viewedItem.keterangan || "-"}
                            secondaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Tutup</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openCheckDialog}
          onClose={() => {
            setOpenCheckDialog(false);
            setEditIndex(null);
            setCheckIndex(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editIndex !== null ? "Edit Pengecekan" : "Tambah Pengecekan"}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="ID Barang"
                value={formData.inventaris_id}
                fullWidth
                sx={{ mb: 2 }}
                disabled
              />
              <Select
                name="kondisi"
                label="Kondisi"
                value={formData.kondisi}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kondisi: e.target.value }))
                }
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="baik">Baik</MenuItem>
                <MenuItem value="rusak">Rusak</MenuItem>
                <MenuItem value="hilang">Hilang</MenuItem>
              </Select>
              <TextField
                name="keterangan"
                label="Keterangan"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    keterangan: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCheckDialog(false);
                setEditIndex(null);
                setCheckIndex(null);
              }}
            >
              Batal
            </Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Preview Laporan */}
        <Dialog
          open={viewContentOpen}
          onClose={() => setViewContentOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Preview Laporan Pengecekan Inventaris
            <IconButton
              aria-label="close"
              onClick={() => setViewContentOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <div
              dangerouslySetInnerHTML={{ __html: viewContent }}
              style={{
                padding: "20px",
                fontFamily: "'Times New Roman', serif",
                fontSize: "12pt",
                lineHeight: 1.5,
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1, justifyContent: "flex-end" }}>
            <Button
              onClick={() => setViewContentOpen(false)}
              variant="outlined"
              sx={{
                color: "#666",
                borderColor: "#ccc",
                "&:hover": {
                  borderColor: "#999",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Tutup
            </Button>
            <Button
              onClick={handlePrint}
              variant="contained"
              startIcon={<PrintIcon />}
              sx={{
                backgroundColor: "#2196f3",
                color: "white",
                "&:hover": { backgroundColor: "#1976d2" },
                "&:active": { backgroundColor: "#1565c0" },
                fontWeight: 600,
              }}
            >
              Print Laporan
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}
