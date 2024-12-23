import { defineStore } from "pinia";
import axiosInstance from "@/axios";

export const useProductStore = defineStore("productStore", {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    snackbar: { show: false, message: "", color: "success" },
  }),
  actions: {
    showToast(message, color = "success") {
      this.snackbar = { show: true, message, color };
    },
    async fetchProducts(page, searchQuery = "") {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get(
          "/admin/products?category=&search=&page=",
          {
            params: { page, search: searchQuery },
          }
        );
        this.products = response.data.data || [];
        this.totalItems = response.data.pagination.total || 0; // Fallback to 0
      } catch (error) {
        console.error("Error fetching products:", error);
        this.products = [];
        this.totalItems = 0;
        this.error = error;
        this.showToast("Failed to fetch products", "error");
      } finally {
        this.isLoading = false;
      }
    },

    async addProduct(productData) {
      this.isLoading = true;
      this.error = null;

      const formData = new FormData();

      // Ensure product data is provided
      if (
        !productData.category_id ||
        !productData.name ||
        !productData.description ||
        !productData.quantity ||
        !productData.price
      ) {
        console.error("Product name, price, and quantity are required");
        this.error = "Product name, price, and quantity are required";
        this.isLoading = false;
        this.showToast("Please fill all required fields", "error");
        return;
      }

      // Append product data to formData
      formData.append(
        "category_id",
        productData.category_id.id || productData.category_id
      );
      formData.append("name", productData.name.trim());
      formData.append("description", productData.description);
      formData.append("quantity", productData.quantity);
      formData.append("price", productData.price);
      productData.images.forEach((file) => {
        formData.append(`file`, file);
      });
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      try {
        const response = await axiosInstance.post(
          "/admin/create-product",
          formData
        );
        console.log("Product added successfully:", response);
        this.showToast("Product added successfully!", "success");
      } catch (error) {
        console.error("Error adding the product:", error);
        this.error = error;
        this.showToast("Failed to add product", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async deleteProduct(productId) {
      try {
        await axiosInstance.post(`/admin/products/${productId}/delete-product`);
        this.products = this.products.filter(
          (product) => product.id !== productId
        );
        this.showToast("Product deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting the product:", error);
        this.error = error;
        this.showToast("Failed to delete product", "error");
      }
    },
  },
});
