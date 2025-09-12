import { endpoints } from "@/config/api";
import { API_BASE_URL } from "@/config/api";
import Cookies from "js-cookie";

export const getBarangTersedia = async () => {
  try {
    const response = await fetch(endpoints.BARANG_TERSEDIA, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Unknown error"}`);
    }
    const result = await response.json();
    if (result.code === 200 && result.status === "OK") {
      return result.data.map((item) => ({
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
      throw new Error(result.message || "Gagal mengambil barang tersedia");
    }
  } catch (error) {
    console.error("Error fetching barang tersedia:", error);
    throw error;
  }
};

export const createPeminjaman = async (data) => {
  try {
    const payload = {
      barang_id: parseInt(data.barang_id),
      nama_peminjam: data.nama_peminjam,
      tgl_pinjam: data.tanggal_pinjam,
      rencana_kembali: data.rencana_kembali,
      jumlah: parseInt(data.jumlah),
      keterangan: data.keterangan,
    };

    console.log("Sending payload:", payload); // Debug log

    const response = await fetch(endpoints.PEMINJAMAN_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Unknown error"}`);
    }
    
    const result = await response.json();
    console.log("API Response:", result); // Debug log
    
    if (result.code === 200 && result.status === "OK") {
      return result.data;
    } else {
      throw new Error(result.message || "Gagal menambahkan peminjaman");
    }
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    throw error;
  }
};

export const updatePengembalian = async (id, data) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('tgl_kembali', data.tgl_kembali);
    formData.append('kondisi_setelah', data.kondisi_setelah);
    formData.append('keterangan_kembali', data.keterangan_kembali || '');
    
    if (data.foto_bukti_kembali) {
      formData.append('foto_bukti_kembali', data.foto_bukti_kembali);
    }

    const response = await fetch(endpoints.PEMINJAMAN_KEMBALI(id), {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${Cookies.get("authToken")}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Unknown error"}`);
    }

    const result = await response.json();
    if (result.code === 200 && result.status === "OK") {
      return result.data;
    } else {
      throw new Error(result.message || "Gagal menyimpan pengembalian");
    }
  } catch (error) {
    console.error("Error updating pengembalian:", error);
    throw error;
  }
};

export const getPeminjaman = async () => {
  try {
    const response = await fetch(endpoints.PEMINJAMAN_LIST, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Unknown error"}`);
    }
    const result = await response.json();
    console.log("Peminjaman API Response:", result); // Debug log
    
    if (result.code === 200 && result.status === "OK") {
      return result.data.map((item) => ({
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
      throw new Error(result.message || "Gagal mengambil riwayat peminjaman");
    }
  } catch (error) {
    console.error("Error fetching peminjaman:", error);
    throw error;
  }
};