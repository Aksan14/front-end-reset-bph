// src/services/inventarisService.js (unchanged, just for reference)
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
      return res.data.data; // Asumsi data berisi { id, nama, image_url }
    } else {
      throw new Error(res.data.message || "Failed to fetch available items");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const addCheck = async (reportId, inventarisId, kondisi, keterangan) => {
  try {
    const res = await axios.post(endpoints.CHECK_ADD(reportId), {
      inventaris_id: inventarisId,
      kondisi,
      keterangan,
    });
    if (res.status === 200 && res.data.code === 200) {
      return res.data;
    } else {
      throw new Error(res.data.message || "Failed to add check");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

export const updateCheck = async (checkId, { inventaris_id, kondisi, keterangan }) => {
  try {
    const res = await axios.put(endpoints.CHECK_UPDATE(checkId), {
      inventaris_id,
      kondisi,
      keterangan,
    });
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