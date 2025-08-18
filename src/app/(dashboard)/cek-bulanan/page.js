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
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import { jsPDF } from "jspdf";
import { barangService } from "@/services/barangService";
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
import ProtectedRoute from "@/utils/protect_route";

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
      const result = await barangService.getAll();
      console.log("Fetched barang tersedia:", result.data); // Log debug
      if (result.success) {
        const tersedia = result.data.filter(
          (item) => item.Kondisi !== "Dimusnahkan"
        );
        setBarangList(tersedia);
        setMessage("Data barang tersedia berhasil dimuat");
        setSnackbarOpen(true);
      } else {
        setBarangList([]);
        setError(result.message || "Gagal mengambil data barang tersedia");
      }
    } catch (error) {
      console.error("Error fetching barang tersedia:", error);
      setBarangList([]);
      setError(error.message || "Terjadi kesalahan saat mengambil data barang");
    } finally {
      setLoading(false);
    }
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

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();

      // Set dokumen properties
      doc.setProperties({
        title: `Laporan Pengecekan ${selectedReport?.kode_report || "Unknown"}`,
        subject: "Laporan Pengecekan Inventaris",
        author: "Sistem Inventaris",
      });

      // Header
      doc.setFillColor(30, 136, 229);
      doc.rect(0, 0, 210, 30, "F");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("LAPORAN PENGECEKAN INVENTARIS", 105, 20, { align: "center" });

      // Metadata laporan (dipindahkan ke bawah header untuk visibilitas)
      console.log("Rendering metadata:", {
        kode_report: selectedReport?.kode_report,
        petugas: selectedReport?.petugas,
        tanggal_report: formatDateDisplay(selectedReport?.tanggal_report),
        kode_petugas: selectedReport?.kode_petugas,
      }); // Log debug sebelum rendering
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Atur warna teks ke hitam untuk visibilitas
      doc.text(`Kode Report: ${selectedReport?.kode_report || "-"}`, 15, 35);
      doc.text(`Petugas: ${selectedReport?.petugas || "-"}`, 15, 40);
      doc.text(
        `Tanggal Cek: ${
          formatDateDisplay(selectedReport?.tanggal_report) || "-"
        }`,
        15,
        45
      );
      let y = 60; // Mulai dari posisi 60 untuk tabel BARANG YANG SUDAH DICEK

      // Tabel barang yang sudah dicek
      doc.setFontSize(14);
      doc.setTextColor(30, 136, 229);
      doc.text("BARANG YANG SUDAH DICEK", 15, y);

      const checkedItems = barang.filter((item) => item.checked);
      console.log("Checked items for PDF:", checkedItems); // Log debug

      y += 5; // Tambah jarak sebelum tabel atau pesan
      if (checkedItems.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Tidak ada barang yang sudah dicek.", 15, y + 5);
        y += 15; // Perbarui y setelah pesan
      } else {
        doc.setFillColor(224, 242, 241);
        doc.rect(15, y, 180, 10, "F");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");
        doc.text("NO", 20, y + 7);
        doc.text("NAMA BARANG", 40, y + 7);
        doc.text("KONDISI", 100, y + 7);
        doc.text("KETERANGAN", 130, y + 7);

        doc.setFont(undefined, "normal");
        y += 10; // Pindah ke baris pertama tabel
        checkedItems.forEach((item, index) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
            doc.setFillColor(224, 242, 241);
            doc.rect(15, y, 180, 10, "F");
            doc.setFont(undefined, "bold");
            doc.text("NO", 20, y + 7);
            doc.text("NAMA BARANG", 40, y + 7);
            doc.text("KONDISI", 100, y + 7);
            doc.text("KETERANGAN", 130, y + 7);
            y += 15;
          }

          doc.text((index + 1).toString(), 20, y + 7);
          doc.text(String(item.nama || "-"), 40, y + 7, { maxWidth: 50 });
          doc.text(String(item.kondisi || "-").toUpperCase(), 100, y + 7);
          doc.text(String(item.keterangan || "-"), 130, y + 7, {
            maxWidth: 60,
          });
          y += 10;
        });
        y += 5; // Tambah jarak setelah tabel
      }

      // Tabel barang yang belum dicek
      doc.setFontSize(14);
      doc.setTextColor(229, 57, 53);
      doc.text("BARANG YANG BELUM DICEK", 15, y + 10);

      const uncheckedItems = barang.filter((item) => !item.checked);
      console.log("Unchecked items for PDF:", uncheckedItems); // Log debug

      y += 15; // Tambah jarak sebelum tabel atau pesan
      if (uncheckedItems.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Tidak ada barang yang belum dicek.", 15, y + 5);
        y += 15; // Perbarui y setelah pesan
      } else {
        doc.setFillColor(255, 235, 238);
        doc.rect(15, y, 180, 10, "F");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");
        doc.text("NO", 20, y + 7);
        doc.text("NAMA BARANG", 40, y + 7);
        doc.text("STATUS", 100, y + 7);

        doc.setFont(undefined, "normal");
        y += 10; // Pindah ke baris pertama tabel
        uncheckedItems.forEach((item, index) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
            doc.setFillColor(255, 235, 238);
            doc.rect(15, y, 180, 10, "F");
            doc.setFont(undefined, "bold");
            doc.text("NO", 20, y + 7);
            doc.text("NAMA BARANG", 40, y + 7);
            doc.text("STATUS", 100, y + 7);
            y += 15;
          }

          doc.text((index + 1).toString(), 20, y + 7);
          doc.text(String(item.nama || "-"), 40, y + 7, { maxWidth: 50 });
          doc.text("BELUM DICEK", 100, y + 7);
          y += 10;
        });
        y += 5; // Tambah jarak setelah tabel
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Sistem Inventaris - Halaman ${i} dari ${pageCount}`,
          105,
          290,
          { align: "center" }
        );
        doc.text(
          `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
          105,
          295,
          {
            align: "center",
          }
        );
      }

      doc.save(
        `Laporan_Pengecekan_${selectedReport?.kode_report || reportId}.pdf`
      );
      setMessage("PDF berhasil diunduh");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(`Gagal membuat PDF: ${err.message || "Terjadi kesalahan"}`);
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

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} fontWeight="600" color="primary">
          Pengecekan Inventaris Bulanan
        </Typography>

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
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="600">
              Daftar Laporan Pengecekan
            </Typography>

            {!reportId && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  label="Nama Petugas"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  required
                  size="small"
                  sx={{ width: 250 }}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  onClick={() => handleStartReport(petugas)}
                  disabled={loading || !petugas.trim()}
                  sx={{
                    borderRadius: "8px",
                    px: 3,
                    textTransform: "none",
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
          ) : reports.length === 0 ? (
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
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle>
            Workspace Pengecekan: {selectedReport?.kode_report} ({status.toUpperCase()})
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

                <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                  <TextField
                    label="Cari Barang"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    size="small"
                  />
                  <Button
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
                  >
                    Reset Pencarian
                  </Button>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "10%" }}>Gambar</TableCell>
                        <TableCell sx={{ width: "20%" }}>Nama Barang</TableCell>
                        <TableCell sx={{ width: "15%" }}>Status</TableCell>
                        <TableCell sx={{ width: "15%" }}>Kondisi</TableCell>
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
                                <img
                                  src={item.image_url}
                                  alt={item.nama}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                  }}
                                  onClick={() => handleViewItem(item)}
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
                                  {item.nama.charAt(0)}
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
                                    onClick={() => handleDeleteCheck(item.checkId)}
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
          maxWidth="md"
          fullWidth
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
      </Box>
    </ProtectedRoute>
  );
}