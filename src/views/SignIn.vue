<template>
  <v-container class="sign_in_cont">
    <NavBar />
    <v-card class="pa-5" max-width="500">
      <v-card-title>Sign In</v-card-title>
      <v-card-text>
        <v-text-field
          label="Email"
          type="email"
          v-model="email"
          :rules="[rules.required, rules.email]"
          :error-messages="emailError"
        ></v-text-field>
        <v-text-field
          label="Password"
          type="password"
          v-model="password"
          :rules="[rules.required]"
          :error-messages="passwordError"
        ></v-text-field>
        <v-btn class="mt-4" color="primary" @click="handleSignIn" block>
          Sign In
        </v-btn>
        <p>
          You forgot your password!,
          <router-link to="/forgotpassword">reset it!</router-link>
        </p>
      </v-card-text>
    </v-card>

    <!-- Success or error Snackbar (Toast) -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" top>
      {{ snackbarMessage }}
      <v-btn color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { useAuthStore } from "@/stores/authStore";
import NavBar from "@/components/NavBar.vue";

export default {
  components: { NavBar },
  name: "SignIn",
  data() {
    return {
      email: "",
      password: "",
      emailError: "",
      passwordError: "",
      snackbar: false, // Controls Snackbar visibility
      snackbarMessage: "", // Message displayed in the Snackbar
      snackbarColor: "success", // Controls the Snackbar color
      rules: {
        required: (value) => !!value || "This field is required",
        email: (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
      },
    };
  },
  created() {
    const authStore = useAuthStore();
    if (authStore.authToken) {
      this.$router.push({ name: "adminPannel" });
    }
  },
  methods: {
    async handleSignIn() {
      this.emailError = "";
      this.passwordError = "";
      const router = this.$router;

      try {
        const authStore = useAuthStore();
        await authStore.login({
          email: this.email,
          password: this.password,
        });
        router.push({ path: "/adminPannel" });
        this.snackbarMessage = "You have successfully signed in!";
        this.snackbarColor = "success"; // Green for success
        this.snackbar = true;
      } catch (error) {
        console.error("Login failed:", error);
        this.snackbarMessage =
          error.response?.data?.message || "Failed to log in, please try again.";
        this.snackbarColor = "error"; // Red for error
        this.snackbar = true;

        if (error.response?.data?.errors?.email) {
          this.emailError = error.response.data.errors.email[0];
        }
        if (error.response?.data?.errors?.password) {
          this.passwordError = error.response.data.errors.password[0];
        }
      }
    },
  },
};
</script>

<style scoped>
.sign_in_cont {
  margin-top: 200px;
  margin-left: 500px;
}
</style>
