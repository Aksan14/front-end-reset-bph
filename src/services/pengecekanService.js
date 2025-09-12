import axios from "axios";
import { endpoints } from "@/config/api";

export const startReport = async (petugas) => {
  try {
    const res = await axios.post(endpoints.REPORT_START, { petugas });
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to start report");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const getReports = async () => {
  try {
    const res = await axios.get(endpoints.REPORT_GET_ALL);
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to fetch reports");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const getReportDetail = async (reportId) => {
  try {
    const res = await axios.get(endpoints.REPORT_DETAIL(reportId));
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to fetch report detail");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const getAvailableItems = async () => {
  try {
    const res = await axios.get(endpoints.BARANG_TERSEDIA);
    if (res.status === 200 && res.data.code === 200) {
      return res.data.data.map((item) => ({
        id: item.id,
        nama_barang: item.nama_barang,
        kategori: item.kategori,
        satuan: item.satuan,
        kondisi: item.kondisi,
        jumlah: item.jumlah || 0,
        jumlah_tersedia: item.jumlah || 0, // Gunakan jumlah dari API sebagai jumlah tersedia
        foto: item.foto
      }));
    } else {
      throw new Error(res.data.message || "Failed to fetch available items");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const addCheck = async (reportId, inventarisId, kondisi, keterangan, jumlah = null) => {
  try {
    const payload = {
      inventaris_id: inventarisId,
      kondisi,
      keterangan,
    };
    
    // Tambahkan jumlah jika ada
    if (jumlah !== null && jumlah !== undefined) {
      payload.jumlah = parseInt(jumlah);
    }

    const res = await axios.post(endpoints.CHECK_ADD(reportId), payload);
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to add check");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const updateCheck = async (checkId, { inventaris_id, kondisi, keterangan, jumlah = null }) => {
  try {
    const payload = {
      inventaris_id,
      kondisi,
      keterangan,
    };
    
    // Tambahkan jumlah jika ada
    if (jumlah !== null && jumlah !== undefined) {
      payload.jumlah = parseInt(jumlah);
    }

    const res = await axios.put(endpoints.CHECK_UPDATE(checkId), payload);
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to update check");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const deleteCheck = async (checkId) => {
  try {
    const res = await axios.delete(endpoints.CHECK_DELETE(checkId));
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to delete check");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const finalizeReport = async (reportId) => {
  try {
    const res = await axios.put(endpoints.REPORT_FINALIZE(reportId));
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to finalize report");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

// Fungsi untuk menyimpan snapshot data barang saat laporan dimulai
export const saveReportSnapshot = async (reportId, snapshotObj) => {
  try {
    // Pastikan field utama ada dan field jumlah di barangList/barangPinjam sudah benar
    const enrichList = (list) =>
      (list || []).map(item => ({
        ...item,
        jumlah: item.jumlah || 0,
        jumlah_tersedia: item.jumlah_tersedia || item.jumlah || 0,
        jumlah_dipinjam: item.jumlah_dipinjam || 0
      }));

    const snapshot = {
      ...snapshotObj,
      barangList: enrichList(snapshotObj.barangList),
      barangPinjam: enrichList(snapshotObj.barangPinjam),
      checks: Array.isArray(snapshotObj.checks) ? snapshotObj.checks : [],
      timestamp: snapshotObj.timestamp || new Date().toISOString(),
      petugas: snapshotObj.petugas || null,
      reportId: reportId,
    };
    const snapshotKey = `report_snapshot_${reportId}`;
    localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
    // Jika ada endpoint backend untuk snapshot, bisa ditambahkan di sini
    // await axios.post(endpoints.REPORT_SAVE_SNAPSHOT(reportId), snapshot);
    return { success: true, message: "Snapshot saved successfully" };
  } catch (error) {
    return { success: false, message: "Failed to save snapshot" };
  }
};

// Fungsi untuk mengambil snapshot data barang
export const getReportSnapshot = async (reportId) => {
  try {
    const snapshotKey = `report_snapshot_${reportId}`;
    const localSnapshot = localStorage.getItem(snapshotKey);
    if (localSnapshot) {
      const parsed = JSON.parse(localSnapshot);
      // Pastikan barangList/barangPinjam/field lain tetap ada dan terstruktur
      return {
        ...parsed,
        barangList: (parsed.barangList || []).map(item => ({
          ...item,
          jumlah: item.jumlah || 0,
          jumlah_tersedia: item.jumlah_tersedia || item.jumlah || 0,
          jumlah_dipinjam: item.jumlah_dipinjam || 0
        })),
        barangPinjam: (parsed.barangPinjam || []).map(item => ({
          ...item,
          jumlah: item.jumlah || 0,
          jumlah_tersedia: item.jumlah_tersedia || item.jumlah || 0,
          jumlah_dipinjam: item.jumlah_dipinjam || 0
        })),
        checks: Array.isArray(parsed.checks) ? parsed.checks : [],
        timestamp: parsed.timestamp || null,
        petugas: parsed.petugas || null,
        reportId: parsed.reportId || reportId,
      };
    }
    // Jika ada endpoint backend untuk snapshot, bisa ditambahkan di sini
    // const res = await axios.get(endpoints.REPORT_GET_SNAPSHOT(reportId));
    return null;
  } catch (error) {
    return null;
  }
};

// Fungsi untuk mendapatkan data peminjaman dengan informasi jumlah
export const getPeminjamanData = async () => {
  try {
    const res = await axios.get(endpoints.PEMINJAMAN_LIST);
    if (res.status === 200 && res.data.code === 200) {
      return res.data.data.map((item) => ({
        id: item.id,
        barang_id: item.barang_id,
        nama_barang: item.barang_nama,
        nama_peminjam: item.nama_peminjam,
        tanggal_pinjam: item.tgl_pinjam,
        rencana_kembali: item.rencana_kembali,
        tanggal_kembali: item.tgl_kembali || null,
        jumlah: parseInt(item.jumlah) || 0,
        kondisi: item.kondisi || null,
        kondisi_setelah: item.kondisi_setelah || null,
        status: item.status,
        keterangan: item.keterangan || "-",
        keterangan_kembali: item.keterangan_kembali || null,
        foto_bukti_kembali: item.foto_bukti_kembali || null,
      }));
    } else {
      throw new Error(res.data.message || "Failed to fetch peminjaman data");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

// Fungsi untuk menghitung jumlah barang yang sedang dipinjam per barang
export const calculateBorrowedItems = async () => {
  try {
    const peminjamanData = await getPeminjamanData();
    const borrowedItems = {};
    
    // Hitung jumlah yang sedang dipinjam (status dipinjam)
    peminjamanData
      .filter(item => !item.tanggal_kembali) // Belum dikembalikan
      .forEach(item => {
        if (borrowedItems[item.barang_id]) {
          borrowedItems[item.barang_id] += item.jumlah;
        } else {
          borrowedItems[item.barang_id] = item.jumlah;
        }
      });
    
    return borrowedItems;
  } catch (error) {
    console.error("Error calculating borrowed items:", error);
    return {};
  }
};

// Fungsi untuk mendapatkan data barang dengan informasi jumlah yang dipinjam
export const getItemsWithBorrowedInfo = async () => {
  try {
    const [availableItems, borrowedItems] = await Promise.all([
      getAvailableItems(),
      calculateBorrowedItems()
    ]);
    
    return availableItems.map(item => ({
      ...item,
      jumlah_dipinjam: borrowedItems[item.id] || 0,
      jumlah_tersedia_aktual: (item.jumlah || 0) - (borrowedItems[item.id] || 0)
    }));
  } catch (error) {
    throw new Error(error.message || "Failed to get items with borrowed info");
  }
};