export const checkService = {
  async getRecentChecks() {
    // Ganti endpoint sesuai API backend kamu
    const response = await fetch("/api/check/recent", {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Gagal mengambil data pengecekan bulanan");
    }
    const { data } = await response.json();
    return data || [];
  },
};
