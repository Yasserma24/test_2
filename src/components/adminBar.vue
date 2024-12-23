<template>
  <v-app-bar app>
    <v-btn icon @click="$emit('toggleDrawer')">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-app-bar-title>Admin Panel</v-app-bar-title>
    <v-spacer></v-spacer>
    <span @click="handleLogout">logout</span>
    <v-btn icon @click="handleLogout">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from "@/stores/authStore"; // Ensure you have your store imported

export default {
  methods: {
    handleLogout() {
      const authStore = useAuthStore();

      // Clear user session
      authStore.logout(); // Assuming you have a logout action in your authStore.js

      // Redirect to sign-in page
      this.$router.push("/SignIn");
    },
  },
};
</script>
<style>
span:hover {
  cursor: pointer;
}
</style>
