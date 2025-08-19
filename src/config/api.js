// src/config/api.js
export const API_BASE_URL = "https://backend-inventaris-production.up.railway.app/";

export const endpoints = {
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}api/user/login`,
  ADMIN_UPDATE: `${API_BASE_URL}api/user/changepassword`,

  // Barang / Inventaris endpoints
  BARANG_GET_ALL: `${API_BASE_URL}api/inventaris/get`,
  BARANG_ADD: `${API_BASE_URL}api/inventaris/add`,
  BARANG_UPDATE: (id) => `${API_BASE_URL}api/inventaris/update/${id}`,
  BARANG_GET_BY_ID: (id) => `${API_BASE_URL}api/inventaris/getbyid/${id}`,
  BARANG_DELETE: (id) => `${API_BASE_URL}api/inventaris/delete/${id}`,

  // Peminjaman endpoints
  BARANG_TERSEDIA: `${API_BASE_URL}api/barang/tersedia`,
  PEMINJAMAN_ADD: `${API_BASE_URL}api/peminjaman`,
  PEMINJAMAN_KEMBALI: (id) => `${API_BASE_URL}api/peminjaman/kembali/${id}`, // PUT /api/peminjaman/kembali/:id
  PEMINJAMAN_LIST: `${API_BASE_URL}api/peminjaman`,             // GET /api/peminjaman
  BARANG_SEARCH: (q) => `${API_BASE_URL}api/inventaris/search?query=${encodeURIComponent(q)}`, // pencaharian barang

  // Statistik endpoints
  STATS_BARANG_ALL: `${API_BASE_URL}api/stats/barang`,
  STATS_BARANG_DIPINJAM: `${API_BASE_URL}api/stats/barang/dipinjam`,
  STATS_BARANG_RUSAKBERAT: `${API_BASE_URL}api/stats/barang/rusakberat`,

  // Report endpoints
  REPORT_START: `${API_BASE_URL}api/report/start`,
  REPORT_GET_ALL: `${API_BASE_URL}api/report`,
  REPORT_DETAIL: (id) => `${API_BASE_URL}api/report/detail/${id}`,
  REPORT_FINALIZE: (id) => `${API_BASE_URL}api/report/finalize/${id}`,
  REPORT_EXPORT: (id) => `${API_BASE_URL}api/report/export/${id}`,

  // Check endpoints
  CHECK_ADD: (id) => `${API_BASE_URL}api/check/${id}/add`,
  CHECK_UPDATE: (id) => `${API_BASE_URL}api/check/update/${id}`,
  CHECK_DELETE: (id) => `${API_BASE_URL}api/check/delete/${id}`,
};