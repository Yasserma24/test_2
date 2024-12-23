<template>
  <NavBar />
  <v-container class="sign_up_cont">
    <v-card class="pa-5" max-width="500">
      <v-card-title>Sign Up</v-card-title>
      <v-card-text>
        <v-text-field
          label="Full Name"
          v-model="name"
          :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
          label="Email"
          type="email"
          v-model="email"
          :rules="[rules.required, rules.email]"
        ></v-text-field>
        <v-text-field
          label="Password"
          type="password"
          v-model="password"
          :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
          label="Confirm-Password"
          type="password"
          v-model="password_confirmation"
          :rules="[rules.required]"
        ></v-text-field>
        <v-btn class="mt-4" color="primary" @click="handleSignUp" block>
          Sign Up
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>

  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" top>
    {{ snackbarMessage }}
    <v-btn color="white" text @click="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
import { useAuthStore } from "@/stores/authStore";
import NavBar from "@/components/NavBar.vue";

export default {
  components: { NavBar },
  name: "SignUp",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "success",
      rules: {
        required: (value) => !!value || "This field is required",
        email: (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
      },
    };
  },
  created() {
    const authStore = useAuthStore();
    if (authStore.authToken) {
      this.$router.push({ name: "SignIn" });
    }
  },
  methods: {
    async handleSignUp() {
      const router = this.$router;
      try {
        const authStore = useAuthStore();
        await authStore.register({
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
        });
        this.snackbarMessage = "You have successfully signed up!";
        this.snackbarColor = "success";
        this.snackbar = true;
        router.push({ path: "/SignIn" });
      } catch (error) {
        console.error("Sign Up failed:", error);
        this.snackbarMessage = error.response?.data?.message || "Sign up failed. Please try again.";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
  },
};
</script>

<style scoped>
.sign_up_cont {
  margin-top: 200px;
  margin-left: 450px;
}
</style>
