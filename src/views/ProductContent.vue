<template>
  <v-row>
    <v-col>
      <adminBar @toggleDrawer="drawer = !drawer" />
      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" app clipped>
        <v-list dense>
          <v-list-item-group active-class="primary--text">
            <v-list-item
              v-for="(item, index) in drawerItems"
              :key="index"
              :to="item.link"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </v-col>
  </v-row>

  <!-- Product Search Bar -->
  <v-row class="mt-6">
    <v-col>
      <v-text-field
        v-model="searchQuery"
        label="Search products"
        @input="debouncedSearch"
        @keydown.enter="filterProducts"
        clearable
        :loading="isSearching"
      >
        <template v-slot:append>
          <v-icon v-if="searchQuery">mdi-magnify</v-icon>
        </template>
      </v-text-field>

      <!-- Suggestions Dropdown -->
      <v-menu
        v-if="filteredProducts.length && searchQuery"
        v-model="menuVisible"
        :close-on-content-click="false"
        :max-height="400"
        offset-y
        transition="slide-y-reverse-transition"
      >
        <v-list>
          <v-list-item
            v-for="product in filteredProducts"
            :key="product.id"
            @click="selectProduct(product)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ product.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>
  </v-row>

  <!-- Product Table -->
  <v-data-table
    :headers="headers"
    :items="productStore.products"
    :loading="isSearching"
    :server-items-length="totalItems"
    :page="currentPage"
    no-data-text="No products available"
    item-key="id"
    hide-default-footer
  >
    <template v-slot:top>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(totalItems / 10)"
            @input="fetchProducts"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template v-slot:item="{ item }">
      <tr>
        <td>{{ item.id }}</td>
        <td>{{ item.category_id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.description }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.price }}</td>
        <td>{{ item.in_order === 1 ? "In Order" : "No Order" }}</td>
        <td>{{ item.in_stock === 1 ? "In Stock" : "Out of Stock" }}</td>
        <td>
          <!-- Delete Button -->
          <v-btn
            v-if="item.in_order !== 1"
            color="error"
            icon
            @click="openDeleteDialog(item.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- Add Product Button -->
  <v-btn color="primary" @click="openAddProductModal">Add Product</v-btn>

  <!-- Add Product Modal -->
  <v-dialog v-model="isAddProductModalOpen" max-width="600px">
    <v-card>
      <v-card-title>Add a new product</v-card-title>
      <v-card-text>
        <v-form ref="productForm" v-model="isFormValid">
          <v-select
            v-model="newProduct.category_id"
            :items="categoryOptions"
            item-text="name"
            item-value="id"
            return-object
            label="Category"
            :rules="[(value) => !!value || 'Category is required']"
          ></v-select>
          <v-text-field
            v-model="newProduct.name"
            label="Product Name"
            required
            :rules="[rules.required]"
          ></v-text-field>
          <v-text-field
            v-model="newProduct.description"
            label="Product Description"
            required
            :rules="[rules.required]"
          ></v-text-field>
          <v-text-field
            v-model="newProduct.quantity"
            label="Quantity"
            required
            type="number"
            :rules="[rules.required]"
          ></v-text-field>
          <v-text-field
            v-model="newProduct.price"
            label="Price"
            required
            type="number"
            :rules="[rules.required]"
          ></v-text-field>

          <!-- Image Upload -->
          <v-file-input
            v-model="newProduct.images"
            label="Upload Images"
            multiple
            accept="image/*"
            :rules="[(v) => !v || v.length <= 5 || 'Max 5 images allowed']"
          ></v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="closeAddProductModal">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!isFormValid || isSubmitting"
          @click="submitProduct"
          :loading="isSubmitting"
          >Add Product</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
    <template #action>
      <v-btn text @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>

  <!-- Modal Dialog for Delete Confirmation -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Delete Confirmation</v-card-title>
      <v-card-text>Are you sure you want to delete this product?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="red" @click="confirmDelete">Delete</v-btn>
        <v-btn text @click="deleteDialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import adminBar from "@/components/adminBar.vue";
import { useProductStore } from "@/stores/productStore";
import _ from "lodash";

export default {
  components: { adminBar },
  data() {
    return {
      drawer: false,
      drawerItems: [
        {
          title: "Products",
          icon: "mdi-view-dashboard",
          link: "/ProductContent",
        },
        { title: "Users", icon: "mdi-account-multiple", link: "/UsersContent" },
        { title: "Orders", icon: "mdi-chart-bar", link: "/OrderContent" },
      ],
      headers: [
        { title: "ID", value: "id" },
        { title: "CATEGORY_ID", value: "category_id" },
        { title: "NAME", value: "name" },
        { title: "DESCRIPTION", value: "description" },
        { title: "QUANTITY", value: "quantity" },
        { title: "PRICE", value: "price" },
        { title: "ORDER_STATUS", value: "in_order" },
        { title: "STOCK_STATUS", value: "in_stock" },
      ],
      searchQuery: "",
      menuVisible: false,
      isSearching: false,
      isAddProductModalOpen: false,
      isFormValid: false,
      newProduct: {
        category_id: null,
        name: "",
        description: "",
        price: null,
        quantity: null,
        images: [],
      },
      currentPage: 1,
      isSubmitting: false,
      categoryOptions: [
        { id: 1, title: "Electronics" },
        { id: 2, title: "Clothes" },
      ],
      deleteDialog: false, // Controls the delete confirmation dialog visibility
      productToDelete: null, // Tracks the product selected for deletion
      rules: {
        required: (value) => !!value || "This field is required",
      },
    };
  },
  computed: {
    productStore() {
      return useProductStore();
    },
    filteredProducts() {
      return this.productStore.products || [];
    },
    totalItems() {
      return this.productStore.totalItems;
    },
    snackbar() {
      return this.productStore.snackbar; // Access the snackbar from the store
    },
  },
  mounted() {
    this.fetchProducts();
    this.debouncedSearch = _.debounce(this.searchProducts, 500);
  },
  methods: {
    async fetchProducts() {
      this.isSearching = true;
      try {
        console.log("Fetching products ...");
        await this.productStore.fetchProducts(
          this.currentPage,
          this.searchQuery.trim()
        );
        console.log("products:", this.productStore.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        this.isSearching = false;
      }
    },

    searchProducts() {
      this.fetchProducts(this.currentPage);
    },
    filterProducts() {
      this.menuVisible = false;
    },
    openAddProductModal() {
      this.isAddProductModalOpen = true;
    },
    closeAddProductModal() {
      this.isAddProductModalOpen = false;
      this.newProduct = {
        category_id: null,
        name: "",
        description: "",
        quantity: null,
        price: null,
        images: [],
      }; // Reset the form
    },
    async submitProduct() {
      this.isSubmitting = true;
      try {
        await this.productStore.addProduct(this.newProduct);
        this.closeAddProductModal(); // Close the modal after successful addition
        this.fetchProducts(); // Refresh the product list
      } catch (error) {
        console.error("Error adding product:", error);
      } finally {
        this.isSubmitting = false;
      }
    },
    async deleteProduct(productId) {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          await this.productStore.deleteProduct(productId);
          this.fetchProducts(); // Refresh the product list
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    },
    openDeleteDialog(productId) {
      this.productToDelete = productId; // Set the product to be deleted
      this.deleteDialog = true; // Open the dialog
    },
    async confirmDelete() {
      if (this.productToDelete) {
        try {
          await this.productStore.deleteProduct(this.productToDelete);
          this.snackbar.show = true;
          this.snackbar.color = "green";
          this.snackbar.message = "Product deleted successfully!";
        } catch (error) {
          this.snackbar.show = true;
          this.snackbar.color = "red";
          this.snackbar.message = "Failed to delete the product.";
        } finally {
          this.deleteDialog = false; // Close the dialog
          this.productToDelete = null; // Clear the product ID
        }
      }
    },
  },
  watch: {
    currentPage(newVal) {
      console.log("Current page changed", newVal);
      this.fetchProducts(newVal);
    },
  },
};
</script>
