import { endpoints } from "@/config/api";
import Cookies from "js-cookie";

export const authService = {
  login: async (nra, password) => {
    try {
      const response = await fetch(endpoints.ADMIN_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ nra, password }),
      });

      const data = await response.json();
      if (data.code !== 200) {
        return {
          success: false,
          error: data.message || "Login gagal",
        };
      }

      if (data.data) {
        const expiryDate = new Date(Date.now() + 90 * 60 * 1000);

        Cookies.set("authToken", data.data, { expires: expiryDate });

        const user = { nra };
        localStorage.setItem("user", JSON.stringify(user));
      }

      return {
        success: true,
        data: {
          token: data.data,
          user: { nra },
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Terjadi kesalahan saat login. Silakan coba lagi.",
      };
    }
  },

  logout: () => {
    Cookies.remove("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return !!Cookies.get("authToken");
  },

  getToken: () => {
    return Cookies.get("authToken");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
