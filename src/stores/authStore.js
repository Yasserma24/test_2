import { defineStore } from "pinia";
import axiosInstance from "@/axios";

export const useAuthStore = defineStore({
  id: "user",
  state: () => ({
    userId: null,
    authToken: null,
    snackbar: {
      show: false,
      message: '',
      color: 'success', // default color for success
    },
  }),
  actions: {
    async login({ email, password }) {
      try {
        const response = await axiosInstance.post("/admin/login", {
          email,
          password,
        });
        console.log("res", response.data);
        this.userId = response.data.userId;
        this.authToken = response.data.user.token;

        this.showSnackbar("Login successful!", "success");
      } catch (error) {
        this.showSnackbar("Login failed! Please check your credentials.", "error");
      }
    },

    async forgot({ email }) {
      try {
        const response = await axiosInstance.post("/admin/forgot-password", {
          email,
        });
        console.log("res", response.data);
        this.userId = response.data;

        this.showSnackbar("Password reset link sent.", "success");
      } catch (error) {
        this.showSnackbar("Error sending reset link.", "error");
      }
    },

    async resetPassword({ token, email, password, password_confirmation }) {
      
      try {
        const response = await axiosInstance.post('/admin/password-reset', {
          token,
          email,
          password,
          password_confirmation,
        });
        console.log('Password reset successful:', response.data);
    
      } catch (error) {
        if (error.response && error.response.status === 422) {
          console.error(error);
        } else {
          console.error('Password reset error:', error);
   
        }
      }
    },

    async register({ name, email, password, password_confirmation }) {
      try {
        const response = await axiosInstance.post("/admin/register", {
          name,
          email,
          password,
          password_confirmation,
        });
        console.log("res", response.data);
        this.userId = response.data.userId;
        this.authToken = response.data.authToken;

        this.showSnackbar("Registration successful!", "success");
      } catch (error) {
        this.showSnackbar("Registration failed. Please try again.", "error");
      }
    },

    logout() {
      this.userId = null;
      this.authToken = null;
    },

    // Method to trigger the toast notification
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "authStore",
        storage: localStorage,
        paths: ["userId", "authToken"], // Persist only specific fields
      },
    ],
  },
});
