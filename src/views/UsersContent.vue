<template>
  <v-app>
    <adminBar @toggleDrawer="drawer = !drawer" />

    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item-group active-class="primary--text">
          <v-list-item v-for="(item, index) in drawerItems" :key="index" :to="item.link">
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

    <v-main>
      <v-container>
        <v-row class="mt-6">
          <v-col>
            <v-text-field
              v-model="searchQuery"
              label="Search users"
              @input="debouncedSearch"
              clearable
              :loading="isSearching"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="userStore.users"
          :server-items-length="totalItems"
          v-model:items-per-page="itemsPerPage"
          :page="currentPage"
          :loading="isSearching"
          item-key="id"
          hide-default-footer
        >
          <template v-slot:top>
            <v-row justify="center">
              <v-col cols="12" md="3">
                <v-select
                  v-model="itemsPerPage"
                  :items="[5, 10, 20, 50, 100]"
                  label="Items per page"
                  @change="fetchUsers(currentPage, itemsPerPage)"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-pagination
                  v-model="currentPage"
                  :length="Math.ceil(totalItems / itemsPerPage)"
                  @input="fetchUsers(currentPage, itemsPerPage)"
                ></v-pagination>
              </v-col>
            </v-row>
          </template>
          <template v-slot:item="{ item }">
            <tr @click="openUserModal(item)">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.role.name }}</td>
            </tr>
          </template>
        </v-data-table>

        <v-dialog v-model="dialog" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ selectedUser ? "User Status" : "Add User" }}</span>
            </v-card-title>
            <v-card-text>
              <div v-if="!isBlocked">This user is active</div>
              <div v-else>This user is blocked</div>
            </v-card-text>
            <v-card-actions>
              <v-btn text @click="closeModal">Cancel</v-btn>
              <v-btn v-if="!isBlocked" color="primary" @click="blockUser(selectedUser.id)">Block</v-btn>
              <v-btn v-else color="primary" @click="activateUser(selectedUser.id)">Unblock</v-btn>
              <v-btn text @click="deleteUser(selectedUser.id)">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import adminBar from "@/components/adminBar.vue";
import { useUserStore } from "@/stores/userStore";
import _ from "lodash";

export default {
  components: { adminBar },
  data() {
    return {
      drawer: false,
      drawerItems: [
        { title: "Products", icon: "mdi-view-dashboard", link: "/ProductContent" },
        { title: "Users", icon: "mdi-account-multiple", link: "/UsersContent" },
        { title: "Orders", icon: "mdi-chart-bar", link: "/OrderContent" },
      ],
      headers: [
        { title: "ID", value: "id" },
        { title: "Name", value: "name" },
        { title: "Email", value: "email" },
        { title: "Status", value: "status" },
        { title: "Role", value: "role.name" },
      ],
      searchQuery: "",
      selectedUser: null,
      dialog: false,
      isSearching: false,
      itemsPerPage: 10,
      currentPage: 1,
      debouncedSearch: null,
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    },
    totalItems() {
      return this.userStore.totalItems;
    },
    isBlocked() {
      return this.selectedUser && this.selectedUser.status === "blocked";
    },
  },
  mounted() {
    this.fetchUsers();
    this.debouncedSearch = _.debounce(this.searchUsers, 500);
  },
  methods: {
    async fetchUsers(page = 1, itemsPerPage = 10) {
      this.isSearching = true;
      try {
        await this.userStore.fetchUsers(page, itemsPerPage, this.searchQuery);
      } finally {
        this.isSearching = false;
      }
    },
    openUserModal(user) {
      this.selectedUser = user;
      this.dialog = true;
    },
    closeModal() {
      this.dialog = false;
      this.selectedUser = null;
    },
    blockUser(userId) {
      this.userStore.blockUser(userId);
      this.closeModal();
    },
    activateUser(userId) {
      this.userStore.activateUser(userId);
      this.closeModal();
    },
    deleteUser(userId) {
      this.userStore.deleteUser(userId);
      this.closeModal();
    },
    searchUsers() {
      this.fetchUsers(this.currentPage, this.itemsPerPage);
    },
  },
  watch: {
    itemsPerPage(newVal) {
      this.fetchUsers(this.currentPage, newVal);
    },
    currentPage(newVal) {
      this.fetchUsers(newVal, this.itemsPerPage);
    },
  },
};
</script>

<style scoped>
tr {
  cursor: pointer;
}
tr:hover {
  background: ghostwhite;
}
.v-row.mt-6 {
  margin-top: 60px;
}
</style>
