import { endpoints } from "@/config/api";

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
        foto: item.foto // Include the foto field
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
    const response = await fetch(endpoints.PEMINJAMAN_ADD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        barang_id: data.barang_id,
        nama_peminjam: data.nama_peminjam,
        tgl_pinjam: data.tanggal_pinjam,
        rencana_kembali: data.rencana_kembali,
        keterangan: data.keterangan,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Unknown error"}`);
    }
    const result = await response.json();
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
    const response = await fetch(endpoints.PEMINJAMAN_KEMBALI(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tgl_kembali: data.tanggal_kembali,
        kondisi_setelah: data.kondisi,
      }),
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
    if (result.code === 200 && result.status === "OK") {
      return result.data.map((item) => ({
        id: item.id,
        barang_id: item.barang_id,
        nama_barang: item.barang_nama,
        nama_peminjam: item.nama_peminjam,
        tanggal_pinjam: item.tgl_pinjam,
        rencana_kembali: item.rencana_kembali,
        tanggal_kembali: item.tgl_kembali || null,
        kondisi: item.kondisi_setelah || null,
        status: item.status,
        keterangan: item.keterangan || "-",
      }));
    } else {
      throw new Error(result.message || "Gagal mengambil riwayat peminjaman");
    }
  } catch (error) {
    console.error("Error fetching peminjaman:", error);
    throw error;
  }
};