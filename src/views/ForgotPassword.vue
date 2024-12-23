<template>
  <v-container class="sign_up_cont">
    <v-card class="pa-5" max-width="500">
      <v-card-title>Forgot Password</v-card-title>
      <v-card-text>
        <v-text-field
          label="Email"
          type="email"
          v-model="email"
          :rules="[rules.required, rules.email]"
        ></v-text-field>
        <v-btn class="mt-4" color="primary" @click="handleForgot" block>
          Submit
        </v-btn>
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
import { useAuthStore } from "../stores/authStore";

export default {
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      snackbar: false, // Controls Snackbar visibility
      snackbarMessage: "", // Message displayed in the Snackbar
      snackbarColor: "success", // Controls the Snackbar color (default: success)
      rules: {
        required: (value) => !!value || "This field is required",
        email: (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
      },
    };
  },
  methods: {
    async handleForgot() {
      try {
        const authStore = useAuthStore();
        await authStore.forgot({ email: this.email });
        // Display success message in Snackbar (Toast)
        this.snackbarMessage =
          "If this email exists in our system, you will receive a password reset link.";
        this.snackbarColor = "success"; // Green for success
        this.snackbar = true;
      } catch (error) {
        console.error("Forgot password failed:", error);
        // Display error message in Snackbar (Toast)
        this.snackbarMessage =
          error.response?.data?.message || "Your email doesn't exist.";
        this.snackbarColor = "error"; // Red for error
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
  text-align: center;
}
</style>
