
import { endpoints } from "@/config/api";

if (!endpoints) {
  throw new Error(
    "Endpoints not found. Please check the import path for api.js."
  );
}

const getFetchOptions = (method, body = null, headers = {}) => {
  const options = { method, headers };
  if (body instanceof FormData) {
    delete options.headers["Content-Type"];
    options.body = body;
  } else if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  return options;
};

export const barangService = {
  getAll: async () => {
    try {
      console.log("Fetching from:", endpoints.BARANG_GET_ALL);
      const response = await fetch(
        endpoints.BARANG_GET_ALL,
        getFetchOptions("GET")
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, data: result.data, message: result.message };
      }
      return { success: false, message: result.message || "Gagal mengambil data barang" };
    } catch (error) {
      console.error("Error fetching all barang:", error);
      return { success: false, message: error.message || "Gagal mengambil data barang" };
    }
  },

  getById: async (id) => {
    try {
      console.log("Fetching from:", endpoints.BARANG_GET_BY_ID(id));
      const response = await fetch(
        endpoints.BARANG_GET_BY_ID(id),
        getFetchOptions("GET")
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, data: result.data, message: result.message };
      }
      return { success: false, message: result.message || "Gagal mengambil data barang" };
    } catch (error) {
      console.error("Error fetching barang by ID:", error);
      return { success: false, message: error.message || "Gagal mengambil data barang" };
    }
  },

  create: async (data, file) => {
    try {
      const formData = new FormData();
      formData.append("Namabarang", data.Namabarang || "");
      formData.append("Kategori", data.Kategori || "");
      formData.append("Jumlah", data.Jumlah ? data.Jumlah.toString() : "0");
      formData.append("Satuan", data.Satuan || "");
      formData.append("Kondisi", data.Kondisi || "");
      if (file) formData.append("Foto", file);

      console.log("Posting to:", endpoints.BARANG_ADD);
      const response = await fetch(
        endpoints.BARANG_ADD,
        getFetchOptions("POST", formData)
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, data: result.data, message: result.message };
      }
      return { success: false, message: result.message || "Gagal menambahkan barang" };
    } catch (error) {
      console.error("Error creating barang:", error);
      return { success: false, message: error.message || "Gagal menambahkan barang" };
    }
  },

  update: async (id, data, file) => {
    try {
      const formData = new FormData();
      formData.append("Namabarang", data.Namabarang || "");
      formData.append("Kategori", data.Kategori || "");
      formData.append("Jumlah", data.Jumlah ? data.Jumlah.toString() : "0");
      formData.append("Satuan", data.Satuan || "");
      formData.append("Kondisi", data.Kondisi || "");
      if (file) formData.append("Foto", file);

      console.log("Putting to:", endpoints.BARANG_UPDATE(id));
      const response = await fetch(
        endpoints.BARANG_UPDATE(id),
        getFetchOptions("PUT", formData)
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, data: result.data, message: result.message };
      }
      return { success: false, message: result.message || "Gagal memperbarui barang" };
    } catch (error) {
      console.error("Error updating barang:", error);
      return { success: false, message: error.message || "Gagal memperbarui barang" };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(
        endpoints.BARANG_DELETE(id),
        getFetchOptions("DELETE")
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message || "Gagal menghapus barang" };
    } catch (error) {
      console.error("Error deleting barang:", error);
      return { success: false, message: error.message || "Gagal menghapus barang" };
    }
  },

  search: async (keyword) => {
    try {
      const url = endpoints.BARANG_SEARCH(keyword);
      console.log("Searching from:", url);
      const response = await fetch(url, getFetchOptions("GET"));
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.status === "OK") {
        return { success: true, data: result.data, message: result.message };
      }
      return { success: false, message: result.message || "Gagal mencari barang" };
    } catch (error) {
      console.error("Error searching barang:", error);
      return { success: false, message: error.message || "Gagal mencari barang" };
    }
  },
};