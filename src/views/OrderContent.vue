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

  <!-- Data Table for Orders -->
  <v-data-table
    :headers="headers"
    :items="orderStore.orders"
    :server-items-length="totalItems"
    :page="currentPage"
    :loading="isSearching"
    item-key="id"
    hide-default-footer
  >
    <template v-slot:top>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(totalItems / 10)"
            @input="fetchOrders"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
    <template v-slot:item="{ item }">
      <tr>
        <td>{{ item.user.name }}</td>
        <td>{{ item.user.email }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.price }}</td>
        <td>
          <v-btn icon @click="showOrderDetails(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="item.status === 'pending'"
            icon
            @click="acceptOrder(item)"
            color="green"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn icon @click="deleteOrder(item)" color="red">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- Snackbar for Toast Notifications -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>

  <!-- Order Details Dialog -->
  <v-dialog v-model="isDialogOpen" max-width="600px">
    <v-card>
      <v-card-title>Order Details</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="detailsHeaders"
          :items="selectedOrder.products"
          item-key="id"
        >
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="isDialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
import adminBar from "@/components/adminBar.vue";
import { useOrderStore } from "@/stores/orderStore";

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
        { title: "USER_NAME", value: "user.name" },
        { title: "EMAIL", value: "user.email" },
        { title: "STATUS", value: "status" },
        { title: "TOTAL_PRICE", value: "price" },
        { title: "ACTIONS", value: "actions", sortable: false },
      ],
      detailsHeaders: [
        { title: "PRODUCT_NAME", value: "name" },
        { title: "QUANTITY", value: "quantity" },
        { title: "PRICE", value: "price" },
      ],
      searchQuery: "",
      menuVisible: false,
      isSearching: false,
      currentPage: 1,
      isDialogOpen: false,
      selectedOrder: {},
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  computed: {
    orderStore() {
      return useOrderStore();
    },
    totalItems() {
      return this.orderStore.totalItems;
    },
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        await this.orderStore.fetchOrders(this.currentPage);
        this.showToast("Orders fetched successfully!", "success");
      } catch (error) {
        this.showToast("Error fetching orders.", "error");
      }
    },
    showOrderDetails(order) {
      this.selectedOrder = order;
      this.isDialogOpen = true;
    },
    async acceptOrder(order) {
      try {
        const confirmAccept = confirm(
          `Are you sure you want to accept order #${order.id}?`
        );
        if (confirmAccept) {
          await this.orderStore.updateOrderStatus(order.id, "Accepted");
          this.showToast(`Order #${order.id} accepted.`, "success");
          this.fetchOrders();
        }
      } catch (error) {
        this.showToast("Error accepting the order.", "error");
      }
    },
    async deleteOrder(order) {
      try {
        const confirmDelete = confirm(
          `Are you sure you want to delete order #${order.id}?`
        );
        if (confirmDelete) {
          await this.orderStore.deleteOrder(order.id);
          this.showToast(`Order #${order.id} deleted.`, "success");
          this.fetchOrders();
        }
      } catch (error) {
        this.showToast("Error deleting the order.", "error");
      }
    },
    showToast(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>
