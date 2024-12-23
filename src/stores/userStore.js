import axiosInstance from "@/axios";
import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [],
    isLoading: false,
    error: null,
    totalItems: 0,
  }),

  actions: {
    async fetchUsers(page, itemsPerPage, searchQuery = "") {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/admin/users", {
          params: {
            page,
            per_page: itemsPerPage,
            search: searchQuery,
          },
        });
        this.users = response.data.data || [];
        this.totalItems = response.data.pagination?.total || 0;
      } catch (error) {
        this.users = [];
        this.totalItems = 0;
        this.error = "Failed to fetch users. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    async activateUser(userId) {
      try {
        await axiosInstance.post(`/admin/users/${userId}/active`);
        const user = this.users.find((u) => u.id === userId);
        if (user) user.status = "active";
      } catch (error) {
        this.error = "Failed to activate user. Please try again.";
      }
    },

    async blockUser(userId) {
      try {
        await axiosInstance.post(`/admin/users/${userId}/block`);
        const user = this.users.find((u) => u.id === userId);
        if (user) user.status = "blocked";
      } catch (error) {
        this.error = "Failed to block user. Please try again.";
      }
    },

    async deleteUser(userId) {
      try {
        await axiosInstance.post(`/admin/users/${userId}/delete`);
        this.users = this.users.filter((u) => u.id !== userId);
      } catch (error) {
        this.error = "Failed to delete user. Please try again.";
      }
    },
  },
});
