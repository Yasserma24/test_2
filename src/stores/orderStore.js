import { defineStore } from "pinia";
import axiosInstance from "@/axios";

export const useOrderStore = defineStore("orderStore", {
  state: () => ({
    orders: [],
    isLoading: false,
    error: null,
    totalItems: 0,
  }),
  actions: {
    async fetchOrders(page = 1) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/admin/orders", {
          params: { page },
        });
        this.orders = response.data.data || [];
        this.totalItems = response.data.pagination.total || 0;
      } catch (error) {
        console.error("Error fetching Orders:", error);
        this.orders = [];
        this.totalItems = 0;
        this.error = "Failed to fetch orders,please try again.";
      } finally {
        this.isLoading = false;
      }
    },
    async updateOrderStatus(orderId, status) {
      try {
        const response = await axiosInstance.post(
          `/admin/orders/${orderId}/update-order`,
          { status }
        );
        console.log("order updated successfuly", response.data);
      } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error("Failed to update order status.");
      }
    },
    async deleteOrder(orderId) {
      try {
        const response = await axiosInstance.post(
          `/admin/orders/${orderId}/delete`
        );
        console.log("Order deleted successfuly", response.data);
      } catch (error) {
        console.error("Failed to delete the order", error);
      }
    },
  },
});
