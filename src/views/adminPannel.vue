<template>
  <v-app>
    <!-- Top Bar -->
    <adminBar @toggleDrawer="drawer = !drawer" />

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item-group active-class="primary--text">
          <v-list-item
            v-for="(item, index) in items"
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

    <!-- Main Content -->
    <v-main>
      <h1>Welcome to the Admin Pannel</h1>
    </v-main>
  </v-app>
</template>

<script>
import adminBar from "@/components/adminBar.vue";
import pusher from "@/main";

import { useAuthStore } from "@/stores/authStore";

export default {
  components: { adminBar },
  name: "adminPannel",
  data() {
    return {
      echo: null,
      drawer: false, // State to toggle the navigation drawer
      items: [
        {
          title: "Products",
          icon: "mdi-view-dashboard",
          link: "/ProductContent",
        },
        { title: "Users", icon: "mdi-account-multiple", link: "/UsersContent" },
        { title: "Orders", icon: "mdi-chart-bar", link: "/OrderContent" },
      ],
    };
  },
  mounted() {
    const auth = useAuthStore();
    const channel = pusher.subscribe("originova-channel");
    console.log("Subscribed to channel: originova-channel", channel);
    channel.bind("user-logout", (data) => {
      console.log("event received:", data);
      this.user = data.user;

      // Call the logout function
      auth.logout();

      // Redirect the user to the login page
      window.location.href = "/SignIn";
    });
  },
};
</script>

<style>
/* You can adjust styling here */
</style>
