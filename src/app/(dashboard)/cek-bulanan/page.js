"use client";

const CATEGORIES = ["Semua", "Buku", "Algo", "Dapur", "Lainnya"];

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
  InputLabel,
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
import { borrowService } from "@/services/borrowService";
import {
  startReport,
  getReports,
  getReportDetail,
  addCheck,
  updateCheck,
  deleteCheck,
  finalizeReport,
  getItemsWithBorrowedInfo,
  getPeminjamanData,
  saveReportSnapshot, // Asumsi fungsi ini sudah ada di pengecekanService untuk menyimpan snapshot
  getReportSnapshot, // Fungsi baru untuk mengambil snapshot (harus diimplementasikan di backend/service)
} from "@/services/pengecekanService";
import { API_BASE_URL, endpoints } from "@/config/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";

// Fungsi untuk memformat tanggal ke format Indonesia
const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return "...........................";
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return "...........................";
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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

const laporanTemplate = (data) => `
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

    <div style="margin-top: 10px; margin-bottom: 10px;">
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
      <hr style="height:0;border:none;border-top:2px solid #000;margin:2px 0;" />
      <hr style="height:0;border:none;border-top:1px solid #000;margin:0;" />
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
        <tr>
          <td>Barang Tersedia</td>
          <td>:</td>
          <td>${data.barangTersedia || 0} (Dicek: ${
  data.barangTersediaDicek || 0
})</td>
          <td>Barang Dipinjam</td>
          <td>:</td>
          <td>${data.barangDipinjam || 0} (Dicek: ${
  data.barangDipinjamDicek || 0
})</td>
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
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Jumlah</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Gambar</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Kondisi</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${
            data.checkedItems
              ?.map(
                (item, index) => `
            <tr style="${index % 2 === 1 ? "background-color: #f5f5f5;" : ""}">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                index + 1
              }</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(
                item.Namabarang || item.nama
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                item.jumlah || 0
              }</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                ${
                  item.image_url
                    ? `<img src='${
                        item.image_url.startsWith("http")
                          ? item.image_url
                          : `${API_BASE_URL}${item.image_url}`
                      }' alt='Gambar' style='max-width:90px;max-height:90px;object-fit:contain;' />`
                    : "-"
                }
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; color: ${
                item.kondisi === "baik"
                  ? "#2e7d32"
                  : item.kondisi === "rusak"
                  ? "#f57c00"
                  : item.kondisi === "hilang"
                  ? "#d32f2f"
                  : "#000"
              }; font-weight: bold;">${safeString(
                  item.kondisi
                ).toUpperCase()}</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(
                item.keterangan
              )}</td>
            </tr>
          `
              )
              .join("") ||
            '<tr><td colspan="6" style="border: 1px solid #000; padding: 12px; text-align: center; color: #666;">Tidak ada barang yang sudah dicek</td></tr>'
          }
        </tbody>
      </table>
    </div>
    
    ${
      data.uncheckedItems?.length > 0
        ? `
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0; color: #d32f2f;">BARANG YANG BELUM DICEK</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
        <thead>
          <tr style="background-color: #f44336; color: white;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Barang</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Jumlah</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Gambar</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.uncheckedItems
            .map(
              (item, index) => `
            <tr style="${index % 2 === 1 ? "background-color: #fff5f5;" : ""}">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                index + 1
              }</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(
                item.Namabarang || item.nama
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                item.jumlah || 0
              }</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                ${
                  item.image_url
                    ? `<img src='${
                        item.image_url.startsWith("http")
                          ? item.image_url
                          : `${API_BASE_URL}${item.image_url}`
                      }' alt='Gambar' style='max-width:90px;max-height:90px;object-fit:contain;' />`
                    : "-"
                }
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #d32f2f; font-weight: bold;">BELUM DICEK</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }
    
    ${
      data.barangPinjamInfo?.length > 0
        ? `
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0; color: #f57c00;">BARANG YANG SEDANG DIPINJAM</h4>
      <p style="font-size: 10pt; margin: 5px 0; color: #666; font-style: italic;">
        Catatan: Barang yang sedang dipinjam tidak dilakukan pengecekan fisik karena berada di luar lokasi inventaris.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
        <thead>
          <tr style="background-color: #ff9800; color: white;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Nama Barang</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Jumlah</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Peminjam</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Tgl Pinjam</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Rencana Kembali</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Gambar</th>
          </tr>
        </thead>
        <tbody>
          ${data.barangPinjamInfo
            .map(
              (item, index) => `
            <tr style="${index % 2 === 1 ? "background-color: #fff3e0;" : ""}">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                index + 1
              }</td>
              <td style="border: 1px solid #000; padding: 6px;">${safeString(
                item.Namabarang
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${
                item.jumlah || 0
              }</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${safeString(
                item.peminjam
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${formatTanggalIndonesia(
                item.tanggalPinjam
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">${formatTanggalIndonesia(
                item.rencanaKembali
              )}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                ${
                  item.image_url
                    ? `<img src='${
                        item.image_url.startsWith("http")
                          ? item.image_url
                          : `${API_BASE_URL}${item.image_url}`
                      }' alt='Gambar' style='max-width:90px;max-height:90px;object-fit:contain;' />`
                    : "-"
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }
    
    <div style="margin-top: 60px; text-align: right;">
      <p style="margin: 0;">Makassar, ${formatTanggalIndonesia(new Date())}</p>
      <p style="margin: 10px 0; font-weight: bold;">Petugas Pengecekan,</p>
      <p style="margin-top: 60px; font-weight: bold; text-decoration: underline;">${safeString(
        data.petugas
      )}</p>
    </div>

    <div style="
      position: fixed; 
      bottom: 0; 
      left: 0; 
      margin: 10px; 
      font-size: 8pt; 
      color: #666;
    ">
    <p style="margin: 0;">Dicetak pada: ${new Date().toLocaleString(
      "id-ID"
    )}</p>
    <p style="margin: 0;">Sistem Inventaris COCONUT</p>
  </div>
`;

export default function PengecekanPage() {
  const [petugas, setPetugas] = useState("");
  const [barangList, setBarangList] = useState([]);
  const [barangPinjam, setBarangPinjam] = useState([]);
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
    jumlah: 1,
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

      // Ambil data real-time
      const itemsWithBorrowedInfo = await getItemsWithBorrowedInfo();
      const peminjamanData = await getPeminjamanData();

      // Transform barang tersedia dengan image_url yang benar
      const transformedBarangTersedia = itemsWithBorrowedInfo.map((item) => ({
        id: item.id,
        Namabarang: item.nama_barang,
        Kategori: item.kategori,
        Satuan: item.satuan,
        Kondisi: item.kondisi,
        Foto: item.foto,
        image_url: item.foto ? `${API_BASE_URL}${item.foto}` : null,
        jumlah: item.jumlah || 0,
        jumlah_tersedia: item.jumlah_tersedia || 0,
        jumlah_dipinjam: item.jumlah_dipinjam || 0,
        jumlah_tersedia_aktual: item.jumlah_tersedia_aktual || 0,
        isPinjam: false,
        status: "tersedia",
      }));

      // Transform barang yang dipinjam dengan image_url yang benar
      const transformedBarangPinjam = peminjamanData
        .filter((item) => !item.tanggal_kembali)
        .map((item) => {
          const barangData = itemsWithBorrowedInfo.find(
            (barang) => barang.id === item.barang_id
          );

          return {
            id: `pinjam_${item.id}`,
            Namabarang: item.nama_barang,
            Kategori: "Dipinjam",
            Satuan: "unit",
            Kondisi: "dipinjam",
            Foto: barangData ? barangData.foto : null,
            image_url:
              barangData && barangData.foto
                ? `${API_BASE_URL}${barangData.foto}`
                : null,
            jumlah: item.jumlah || 0,
            isPinjam: true,
            status: "dipinjam",
            peminjam: item.nama_peminjam,
            tanggalPinjam: item.tanggal_pinjam,
            rencanaKembali: item.rencana_kembali,
            canCheck: false,
          };
        });

      const barangForChecking = [...transformedBarangTersedia];

      setBarangList(barangForChecking);
      setOriginalBarangList(barangForChecking);
      setBarangPinjam(transformedBarangPinjam);

      setMessage(
        `Data berhasil dimuat: ${transformedBarangTersedia.length} barang tersedia untuk dicek, ${transformedBarangPinjam.length} barang sedang dipinjam`
      );
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error fetching barang tersedia:", error);
      setBarangList([]);
      setOriginalBarangList([]);
      setBarangPinjam([]);
      setError(error.message || "Terjadi kesalahan saat mengambil data barang");
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
        filtered = filtered.filter(
          (item) =>
            item.Namabarang?.toLowerCase().includes(
              searchValue.toLowerCase()
            ) ||
            item.Kategori?.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      // Apply category filter
      if (category && category !== "Semua") {
        filtered = filtered.filter((item) => item.Kategori === category);
      }

      setBarangList(filtered);
      updateBarangTable(filtered);
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterBarang(searchQuery, category);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getReports();
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
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueReport = async (reportId) => {
    try {
      setLoading(true);
      const response = await getReportDetail(reportId);
      setReportId(reportId);
      setSelectedReport(response.data.report);
      setStatus(response.data.report.status);

      let barangDataToUse = [];
      let barangPinjamToUse = [];
      let checksToUse = [];
      let snapshot = null;

      if (response.data.report.status === "final") {
        // Untuk status final, gunakan snapshot yang disimpan
        snapshot = await getReportSnapshot(reportId);
        if (!snapshot) {
          throw new Error("Snapshot tidak ditemukan untuk laporan final ini");
        }
        barangDataToUse = snapshot.barangList || [];
        barangPinjamToUse = snapshot.barangPinjam || [];
        checksToUse = snapshot.checks || [];
        setMessage(
          `Data laporan FINAL Telah Difinalkan pada ${formatDateTimeDisplay(
            snapshot.timestamp
          )}`
        );
      } else {
        // Untuk draft, gunakan data real-time
        const itemsWithBorrowedInfo = await getItemsWithBorrowedInfo();
        const peminjamanData = await getPeminjamanData();

        barangDataToUse = itemsWithBorrowedInfo.map((item) => ({
          id: item.id,
          Namabarang: item.nama_barang,
          Kategori: item.kategori,
          Satuan: item.satuan,
          Kondisi: item.kondisi,
          Foto: item.foto,
          image_url: item.foto ? `${API_BASE_URL}${item.foto}` : null,
          jumlah: item.jumlah || 0,
          jumlah_tersedia: item.jumlah_tersedia || 0,
          jumlah_dipinjam: item.jumlah_dipinjam || 0,
          jumlah_tersedia_aktual: item.jumlah_tersedia_aktual || 0,
        }));

        barangPinjamToUse = peminjamanData
          .filter((item) => !item.tanggal_kembali)
          .map((item) => {
            const barangData = itemsWithBorrowedInfo.find(
              (barang) => barang.id === item.barang_id
            );

            return {
              id: `pinjam_${item.id}`,
              Namabarang: item.nama_barang,
              Kategori: "Dipinjam",
              Foto: barangData ? barangData.foto : null,
              image_url:
                barangData && barangData.foto
                  ? `${API_BASE_URL}${barangData.foto}`
                  : null,
              jumlah: item.jumlah || 0,
              peminjam: item.nama_peminjam,
              tanggalPinjam: item.tanggal_pinjam,
              rencanaKembali: item.rencana_kembali,
            };
          });
        checksToUse = response.data.checks || [];
        setMessage(
          `Data laporan ${response.data.report.status} dimuat dengan data terkini`
        );
      }

      setBarangList(barangDataToUse);
      setOriginalBarangList(barangDataToUse);
      setBarangPinjam(barangPinjamToUse);

      // Enrich checks dengan data barang
      const enrichedChecks = checksToUse.map((check) => {
        const item = barangDataToUse.find(
          (item) => item.id === check.inventaris_id
        );
        return {
          ...check,
          nama: item ? item.Namabarang : `Item ${check.inventaris_id}`,
          image_url:
            item && item.image_url
              ? item.image_url
              : item && item.Foto
              ? `${API_BASE_URL}${item.Foto}`
              : null,
          jumlah: check.jumlah || (item ? item.jumlah : 0),
          checked: true,
        };
      });

      // Buat mapping barang untuk tabel
      const allBarang = barangDataToUse.map((item) => {
        const check = enrichedChecks.find((c) => c.inventaris_id === item.id);
        return {
          id: item.id,
          inventaris_id: item.id,
          nama: item.Namabarang || `Item ${item.id}`,
          kategori: item.Kategori || "-",
          image_url:
            item.image_url ||
            (item.Foto ? `${API_BASE_URL}${item.Foto}` : null),
          jumlah: item.jumlah || 0,
          jumlah_tersedia: item.jumlah_tersedia || 0,
          jumlah_dipinjam: item.jumlah_dipinjam || 0,
          checked: !!check,
          checkId: check ? check.id : null,
          kondisi: check ? check.kondisi : "",
          keterangan: check ? check.keterangan : "",
          isPinjam: item.isPinjam || false,
          status: item.status || "tersedia",
          peminjam: item.peminjam || "",
          tanggalPinjam: item.tanggalPinjam || "",
          rencanaKembali: item.rencanaKembali || "",
        };
      });

      setBarang(allBarang);
      setSnackbarOpen(true);
      setOpenWorkspaceDialog(true);
    } catch (err) {
      console.error("Error fetching report detail:", err);
      setError(err.message || "Gagal memuat detail laporan");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const updateBarangTable = (newBarangList) => {
    if (reportId && selectedReport) {
      const allBarang = newBarangList.map((item) => {
        const existing = barang.find((b) => b.inventaris_id === item.id);
        return {
          id: item.id,
          inventaris_id: item.id,
          nama: item.Namabarang || `Item ${item.id}`,
          kategori: item.Kategori || "-",
          image_url:
            item.image_url ||
            (item.Foto ? `${API_BASE_URL}${item.Foto}` : null),
          jumlah: item.jumlah || 0,
          jumlah_tersedia: item.jumlah_tersedia || 0,
          jumlah_dipinjam: item.jumlah_dipinjam || 0,
          checked: existing ? existing.checked : false,
          checkId: existing ? existing.checkId : null,
          kondisi: existing ? existing.kondisi : "",
          keterangan: existing ? existing.keterangan : "",
        };
      });
      setBarang(allBarang);
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

    // Validasi jumlah
    if (!formData.jumlah || formData.jumlah < 1) {
      setError("Jumlah harus diisi dan minimal 1");
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      const response = await addCheck(
        reportId,
        item.inventaris_id,
        formData.kondisi,
        formData.keterangan,
        parseInt(formData.jumlah)
      );
      await handleContinueReport(reportId);
      setMessage(response.message || "Data pengecekan berhasil ditambahkan");
      setSnackbarOpen(true);
      setCheckIndex(null);
      setOpenCheckDialog(false);
    } catch (err) {
      setError(err.message);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCheck = async (checkId, kondisi, keterangan, jumlah) => {
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
        jumlah: parseInt(jumlah) || 1,
      };
      const response = await updateCheck(checkId, payload);
      await handleContinueReport(reportId);
      setMessage(response.message || "Data pengecekan berhasil diperbarui");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating check:", err);
      setError(`Gagal memperbarui: ${err.message || "Internal Server Error"}`);
      setSnackbarOpen(true);
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
      setSnackbarOpen(true);
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

      // Ambil detail report untuk mendapatkan checks saat ini
      const reportDetail = await getReportDetail(reportId);
      const currentChecks = reportDetail.data.checks || [];

      // Ambil data real-time terbaru untuk snapshot sebelum finalisasi
      const itemsWithBorrowedInfo = await getItemsWithBorrowedInfo();
      const peminjamanData = await getPeminjamanData();

      const barangTersediaSnapshot = itemsWithBorrowedInfo.map((item) => ({
        id: item.id,
        Namabarang: item.nama_barang,
        Kategori: item.kategori,
        Satuan: item.satuan,
        Kondisi: item.kondisi,
        Foto: item.foto,
        image_url: item.foto ? `${API_BASE_URL}${item.foto}` : null,
        jumlah: item.jumlah || 0,
        jumlah_tersedia: item.jumlah_tersedia || 0,
        jumlah_dipinjam: item.jumlah_dipinjam || 0,
        jumlah_tersedia_aktual: item.jumlah_tersedia_aktual || 0,
        isPinjam: false,
        status: "tersedia",
      }));

      const barangPinjamSnapshot = peminjamanData
        .filter((item) => !item.tanggal_kembali)
        .map((item) => {
          const barangData = itemsWithBorrowedInfo.find(
            (barang) => barang.id === item.barang_id
          );

          return {
            id: `pinjam_${item.id}`,
            Namabarang: item.nama_barang,
            Kategori: "Dipinjam",
            Satuan: "unit",
            Kondisi: "dipinjam",
            Foto: barangData ? barangData.foto : null,
            image_url:
              barangData && barangData.foto
                ? `${API_BASE_URL}${barangData.foto}`
                : null,
            jumlah: item.jumlah || 0,
            isPinjam: true,
            status: "dipinjam",
            peminjam: item.nama_peminjam,
            tanggalPinjam: item.tanggal_pinjam,
            rencanaKembali: item.rencana_kembali,
            canCheck: false,
          };
        });

      // Simpan snapshot data barang dan checks saat finalisasi
      await saveReportSnapshot(reportId, {
        barangList: barangTersediaSnapshot,
        barangPinjam: barangPinjamSnapshot,
        checks: currentChecks,
        timestamp: new Date().toISOString(),
        petugas: selectedReport.petugas,
        reportId: reportId,
      });
      console.log("Snapshot berhasil disimpan untuk laporan ID:", reportId);

      // Finalisasi laporan setelah snapshot disimpan
      const response = await finalizeReport(reportId);
      setStatus("final");

      // Reload data menggunakan snapshot baru
      await handleContinueReport(reportId);
      // Update daftar laporan agar status berubah tanpa refresh manual
      await fetchReports();
      setMessage(
        `${
          response.message || "Sesi pengecekan berhasil difinalisasi"
        } - Data telah dikunci dan tidak dapat diubah`
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error finalizing report:", err);
      setError(
        err.message || "Gagal menyimpan snapshot atau memfinalisasi laporan"
      );
      setSnackbarOpen(true);
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
    setError("");
    setMessage("");
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData({
      inventaris_id: barang[index].inventaris_id,
      kondisi: barang[index].kondisi || "baik",
      keterangan: barang[index].keterangan || "",
      jumlah: barang[index].jumlah || 1,
    });
    setOpenCheckDialog(true);
  };

  const handleCheck = (index) => {
    setCheckIndex(index);
    setFormData({
      inventaris_id: barang[index].inventaris_id,
      kondisi: "baik",
      keterangan: "",
      jumlah: barang[index].jumlah_tersedia || barang[index].jumlah || 1,
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
    if (
      !formData.inventaris_id ||
      !formData.kondisi ||
      !formData.keterangan ||
      !formData.jumlah
    ) {
      setError("Semua field wajib diisi!");
      setSnackbarOpen(true);
      return;
    }

    if (editIndex !== null) {
      const checkId = barang[editIndex].checkId;
      if (checkId) {
        await handleUpdateCheck(
          checkId,
          formData.kondisi,
          formData.keterangan,
          formData.jumlah
        );
      } else {
        setError("ID check tidak ditemukan");
        setSnackbarOpen(true);
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
      const selectedReportData = reports.find((r) => r.id === reportId);
      const checkedItems = barang
        .filter((item) => item.checked)
        .map((item) => ({
          ...item,
          Namabarang: item.nama,
          jumlah: item.jumlah || 0,
        }));
      const uncheckedItems = barang
        .filter((item) => !item.checked)
        .map((item) => ({
          ...item,
          Namabarang: item.nama,
          jumlah: item.jumlah || 0,
        }));

      const baikCount = checkedItems.filter(
        (item) => item.kondisi === "baik"
      ).length;
      const rusakCount = checkedItems.filter(
        (item) => item.kondisi === "rusak"
      ).length;
      const hilangCount = checkedItems.filter(
        (item) => item.kondisi === "hilang"
      ).length;

      // Hitung statistik barang
      const barangTersediaCount = barang.length;
      const barangDipinjamCount = barangPinjam.length;
      const barangTersediaDicek = checkedItems.length;
      const barangDipinjamDicek = 0;

      const reportData = {
        petugas: selectedReportData?.petugas || petugas,
        tanggal: selectedReportData?.tanggal_laporan || new Date(),
        status: selectedReportData?.status || "DRAFT",
        totalItem: barangTersediaCount + barangDipinjamCount,
        itemsDicek: checkedItems.length,
        kondisiBaik: baikCount,
        kondisiRusak: rusakCount,
        hilang: hilangCount,
        barangTersedia: barangTersediaCount,
        barangDipinjam: barangDipinjamCount,
        barangTersediaDicek: barangTersediaDicek,
        barangDipinjamDicek: barangDipinjamDicek,
        checkedItems: checkedItems,
        uncheckedItems: uncheckedItems.length > 0 ? uncheckedItems : null,
        barangPinjamInfo: barangPinjam.map((item) => ({
          ...item,
          jumlah: item.jumlah || 0,
        })),
      };

      // Generate HTML content
      const content = laporanTemplate(reportData);
      setViewContent(content);
      setViewContentOpen(true);
      setMessage("Laporan berhasil digenerate. Silakan print atau simpan.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError(
        `Gagal membuat laporan: ${error.message || "Terjadi kesalahan"}`
      );
      setSnackbarOpen(true);
    }
  };

  const handlePrint = () => {
    if (!viewContent) {
      setError(
        "Konten laporan tidak tersedia. Silakan generate laporan terlebih dahulu."
      );
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

      setMessage(
        "Dialog print telah dibuka. Silakan pilih printer dan cetak laporan."
      );
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
        setSnackbarOpen(true);
      }
    };
    if (isMounted) loadData();
    return () => {
      isMounted = false;
    };
  }, []);

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
          backgroundColor: "#f8fafc",
          px: { xs: 0, sm: 2 },
          py: { xs: 1, sm: 2 },
          ml: {
            xs: 0,
            sm: "0px",
            md: "20px",
          },
          mr: { xs: 0, sm: 2 },
        }}
      >
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
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
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
                  flexDirection: { xs: "column", sm: "row" },
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
                    width: { xs: "100%", sm: 200 },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleStartReport(petugas)}
                  disabled={loading || !petugas.trim()}
                  sx={{
                    height: 40,
                    width: { xs: "100%", sm: "auto" },
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
          maxWidth="lg"
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
            {status === "final" && (
              <Chip
                label="DATA FINAL - TIDAK DAPAT DIUBAH"
                color="warning"
                size="small"
                sx={{ ml: 2, fontWeight: "bold" }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            {status === "final" && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Laporan Final:</strong> Data ini sudah difinalisasi dan
                tidak dapat diubah lagi.
              </Alert>
            )}
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
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          mt: 1,
                          p: 2,
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Chip
                          label={`Total Tersedia: ${barang.length} item`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={`Dipinjam: ${barangPinjam.length} item`}
                          color="warning"
                          size="small"
                        />
                        <Chip
                          label={`Sudah Dicek: ${
                            barang.filter((item) => item.checked).length
                          }`}
                          color="info"
                          size="small"
                        />
                        <Chip
                          label={`Belum Dicek: ${
                            barang.filter((item) => !item.checked).length
                          }`}
                          color="error"
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
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
                    }}
                  >
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
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

                <TableContainer
                  component={Paper}
                  sx={{
                    "& .MuiTable-root": {
                      minWidth: { xs: "100%", sm: 650 },
                    },
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "10%" }}>Gambar</TableCell>
                        <TableCell sx={{ width: "20%" }}>Nama Barang</TableCell>
                        <TableCell sx={{ width: "10%" }}>Jumlah</TableCell>
                        <TableCell sx={{ width: "15%" }}>Kategori</TableCell>
                        <TableCell sx={{ width: "15%" }}>Status Cek</TableCell>
                        <TableCell sx={{ width: "15%" }}>Kondisi</TableCell>
                        <TableCell sx={{ width: "15%" }}>Keterangan</TableCell>
                        {status === "draft" && (
                          <TableCell sx={{ width: "20%" }}>Aksi</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={status === "draft" ? 8 : 7}
                            align="center"
                          >
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : barang.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={status === "draft" ? 8 : 7}
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
                                : "inherit",
                            }}
                          >
                            <TableCell>
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.nama || "Gambar barang"}
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
                                  {item.nama?.charAt(0) || "?"}
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
                              <Typography variant="body2" fontWeight="600">
                                {item.jumlah || 0}
                              </Typography>
                              {item.jumlah_tersedia !== undefined && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Tersedia: {item.jumlah_tersedia}
                                </Typography>
                              )}
                              {item.jumlah_dipinjam > 0 && (
                                <Typography
                                  variant="caption"
                                  color="warning.main"
                                  display="block"
                                >
                                  Dipinjam: {item.jumlah_dipinjam}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.kategori || "-"}
                                size="small"
                                sx={{ fontSize: "0.75rem" }}
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

                {/* Section untuk barang dipinjam */}
                {barangPinjam.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: "#f57c00", fontWeight: "bold" }}
                    >
                      Informasi Barang Dipinjam
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Barang yang sedang dipinjam tidak dilakukan pengecekan
                      fisik karena berada di luar lokasi inventaris.
                    </Alert>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#ff9800" }}>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Gambar
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Nama Barang
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Peminjam
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Tanggal Pinjam
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Rencana Kembali
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {barangPinjam.map((item, idx) => (
                            <TableRow
                              key={`pinjam-${idx}`}
                              sx={{
                                backgroundColor:
                                  idx % 2 === 1 ? "#fff3e0" : "white",
                              }}
                            >
                              <TableCell>
                                {item.Foto ? (
                                  <Image
                                    src={`${API_BASE_URL}${item.Foto}`}
                                    alt={item.Namabarang}
                                    width={40}
                                    height={40}
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: 4,
                                    }}
                                  />
                                ) : (
                                  <Avatar
                                    variant="square"
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: "grey.300",
                                    }}
                                  >
                                    {item.Namabarang?.charAt(0) || "?"}
                                  </Avatar>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.Namabarang}
                                </Typography>
                                <Chip
                                  label="Dipinjam"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", mt: 0.5 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {item.peminjam}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDateDisplay(item.tanggalPinjam)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDateDisplay(item.rencanaKembali)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
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
            {/* Dialog Preview PDF */}
            <Dialog
              open={viewContentOpen}
              onClose={() => setViewContentOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Preview Laporan PDF</DialogTitle>
              <DialogContent dividers sx={{ bgcolor: "#f5f5f5" }}>
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 400,
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: 1,
                    p: 2,
                    overflow: "auto",
                    border: "1px solid #eee",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: viewContent }}
                    style={{ width: "100%", minHeight: 400 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={() => setViewContentOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print / Simpan PDF
                </Button>
              </DialogActions>
            </Dialog>
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
                sx={{ mb: 1 }}
                disabled
              />
              <TextField
                name="jumlah"
                label="Jumlah"
                type="number"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jumlah: Math.max(1, parseInt(e.target.value)),
                  }))
                }
                fullWidth
                required
                size="small"
                sx={{ mb: 2 }}
                disabled
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Kondisi</InputLabel>
                <Select
                  value={formData.kondisi}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kondisi: e.target.value,
                    }))
                  }
                  label="Kondisi"
                >
                  <MenuItem value="baik">Baik</MenuItem>
                  <MenuItem value="rusak">Rusak</MenuItem>
                  <MenuItem value="hilang">Hilang</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Keterangan"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    keterangan: e.target.value,
                  }))
                }
                fullWidth
                multiline
                rows={4}
                size="small"
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenCheckDialog(false)}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Simpan
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}
