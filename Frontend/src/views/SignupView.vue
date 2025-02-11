<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApplicationStore } from '@/stores/application.js';

const router = useRouter();
const { setUserData, persistUserData } = useApplicationStore();

const loading = ref(false);
const signupFailed = ref(false);
const errorMessage = ref('');

const formData = ref({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'supporter' // Changed to match backend expectation
});

const onFormSubmit = () => {
  // Reset error states
  signupFailed.value = false;
  errorMessage.value = '';

  // Validate password length
  if (formData.value.password.length < 6 || formData.value.password.length > 40) {
    signupFailed.value = true;
    errorMessage.value = 'Password must be between 6 and 40 characters';
    return;
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    signupFailed.value = true;
    errorMessage.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  signupFailed.value = false;

  const signupData = {
    username: formData.value.username,
    email: formData.value.email,
    password: formData.value.password,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    role: [formData.value.role]
  };

  fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(signupData)
  })
  .then(async (response) => {
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') 
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.message || 'Registration failed');
    }

    router.push({ name: 'login' });
  })
  .catch((err) => {
    console.warn(err);
    signupFailed.value = true;
    errorMessage.value = err.message || 'Registration failed';
  })
  .finally(() => {
    loading.value = false;
  });
};
</script>

<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-4">
          <div class="mb-4">
            <h1 class="fs-3">Sign Up</h1>
          </div>
          <div class="spinner-border" role="status" v-if="loading">
            <span class="visually-hidden">Loading...</span>
          </div>
          <form v-else @submit.prevent="onFormSubmit">
            <div class="mb-2" v-if="signupFailed">
              <div class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>
            </div>
            <div class="mb-3">
              <label for="usernameInput" class="form-label">Username</label>
              <input
                  v-model="formData.username"
                  type="text"
                  class="form-control"
                  id="usernameInput"
                  required
              />
            </div>
            <div class="mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input
                  v-model="formData.firstName"
                  type="text"
                  class="form-control"
                  id="firstName"
                  required
              />
            </div>
            <div class="mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                  v-model="formData.lastName"
                  type="text"
                  class="form-control"
                  id="lastName"
                  required
              />
            </div>
            <div class="mb-3">
              <label for="emailInput" class="form-label">Email address</label>
              <input
                  v-model="formData.email"
                  type="email"
                  class="form-control"
                  id="emailInput"
                  required
              />
            </div>
            <div class="mb-3">
              <label for="passwordInput" class="form-label">Password</label>
              <input
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  id="passwordInput"
                  required
                  minlength="6"
                  maxlength="40"
              />
              <small class="form-text text-muted">Password must be between 6 and 40 characters</small>
            </div>
            <div class="mb-3">
              <label for="confirmPasswordInput" class="form-label">Confirm Password</label>
              <input
                  v-model="formData.confirmPassword"
                  type="password"
                  class="form-control"
                  id="confirmPasswordInput"
                  required
              />
            </div>
            <div class="mb-3">
              <label for="roleSelect" class="form-label">Role</label>
              <select v-model="formData.role" class="form-select" id="roleSelect" required>
                <option value="supporter">Supporter</option>
                <option value="creator">Creator</option>
              </select>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary">Sign Up</button>
              <RouterLink to="/login" class="btn btn-outline-secondary">Back to Login</RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>