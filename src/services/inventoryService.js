// src/services/inventoryService.js
import { endpoints } from "@/config/api";

export const getAllItems = async () => {
  try {
    console.log("Fetching from:", endpoints.BARANG_GET_ALL); // Debugging
    const response = await fetch(endpoints.BARANG_GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch error in getAllItems:", { status: response.status, text: errorText, url: endpoints.BARANG_GET_ALL });
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText || "Gagal mengambil data barang"}`);
    }
    const result = await response.json();
    if (result.code === 200 && result.status === "OK") {
      return result.data || [];
    } else {
      throw new Error(result.message || "Gagal mengambil data barang");
    }
  } catch (error) {
    console.error("Error in getAllItems:", error);
    throw error;
  }
};