<template>
  <v-container class="reset-password">
    <v-card class="pa-5" max-width="500">
      <v-card-title>Reset Password</v-card-title>
      <v-card-text>
        
          

          <v-text-field
            label="New Password"
            type="password"
            v-model="password"
            :rules="passwordRule"
          ></v-text-field>

          <v-text-field
            label="Confirm Password"
            type="password"
            v-model="password_confirmation"
            :rules="passwordConfirmationRule"
          ></v-text-field>

          <v-btn class="mt-4" color="primary" block @click="handleResetPassword"
            :loading="loading" :disabled="loading"            
          >Reset Password</v-btn>
        
        <p v-if="successMessage" class="mt-4">{{ successMessage }}</p>
        <p v-if="errorMessage" class="mt-4" style="color: red;">{{ errorMessage }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';  // Import useRoute to access route query parameters

export default {
  name: 'ResetPassword',
  data() {
    return {
      loading:false,
      email: '',
      token: '',
      password: '',
      password_confirmation: '',
      successMessage: '',
      errorMessage: '',
      passwordRule: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
      passwordConfirmationRule: [
        v => !!v || 'Password confirmation is required',
        v => v === this.password || 'Passwords must match',
      ],
    };
  },
  methods: {
    async handleResetPassword() {
      this.loading=true
     

      try {
        const authStore = useAuthStore();
        await authStore.resetPassword({
          email: this.email,
          token: this.token,
          password: this.password,
          password_confirmation: this.password_confirmation,
        });
        this.successMessage = 'Password has been reset successfully!';
        this.errorMessage = '';
        setTimeout(() => {
          this.$router.push('/SignIn'); // Redirect after success
        }, 2000);
      } catch (error) {
        this.errorMessage = 'Failed to reset password.';
        this.successMessage = '';
      }
      this.loading=false;
    },
  },
  created() {
    const route = useRoute(); // Get the current route
    const fullPath = route.fullPath; // Full URL path including the token in the path
const tokenMatch = fullPath.match(/token=([^?&]+)/); // Regex to extract the token
this.token = tokenMatch ? tokenMatch[1] : '';
    this.email = route.query.email || ''; // Extract email from query parameters
   // this.token = route.query.token || ''; // Extract token from query parameters
    console.log(`Extracted Email: ${this.email}, Extracted Token: ${this.token}`)
  },
};
</script>

<style scoped>
.reset-password {
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
}
</style>