import { endpoints } from "@/config/api";

export const borrowService = {
  async getRecentBorrows() {
    try {
      const response = await fetch(endpoints.PEMINJAMAN_LIST, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true", 
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch error:", { status: response.status, text: errorText });
        throw new Error(`Gagal mengambil data peminjaman: ${errorText || "Unknown error"}`);
      }
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        const latestBorrows = result.data
          .sort((a, b) => new Date(b.tgl_pinjam) - new Date(a.tgl_pinjam))
          .slice(0, 5)
          .map((item) => ({
            tanggalPinjam: item.tgl_pinjam || "-",
            namaPeminjam: item.nama_peminjam || "-",
            namaBarang: item.barang_nama || "-",
            rencanaKembali: item.rencana_kembali || "-",
            status: item.status || "-",
          }));
        return latestBorrows;
      } else {
        throw new Error(result.message || "Gagal mengambil data peminjaman");
      }
    } catch (error) {
      console.error("Error in getRecentBorrows:", error);
      throw error;
    }
  },
};