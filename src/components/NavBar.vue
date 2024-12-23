<template>
  <v-app-bar app>
    <v-toolbar-title>My store</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn to="/SignIn" variant="flat">Sign-In</v-btn>
    <v-btn to="/SignUp" variant="flat">Sign-Up</v-btn>
  </v-app-bar>
</template>
<script>
export default {
  name: "NavBar",
};
</script>
<style>
v-btn {
  margin-right: 10px;
}
</style>
