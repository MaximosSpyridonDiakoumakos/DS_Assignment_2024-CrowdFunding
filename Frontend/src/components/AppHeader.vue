<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApplicationStore } from '@/stores/application.js';

const route = useRoute();
const store = useApplicationStore();

// Add these console logs
console.log('isAuthenticated:', store.isAuthenticated.value);
console.log('userData:', store.userData.value);

const userRole = computed(() => {
  console.log('userRole computed - userData:', store.userData.value);
  console.log('userRole computed - roles:', store.userData.value?.roles);
  console.log('userRole computed - first role:', store.userData.value?.roles?.[0]);
  return store.userData?.roles?.[0] || null;
});

const isCreator = computed(() => userRole.value === 'ROLE_CREATOR');
const isSupporter = computed(() => userRole.value === 'ROLE_SUPPORTER');
const isAdmin = computed(() => {
  console.log('isAdmin computed - userRole:', userRole.value);
  console.log('isAdmin computed - is ROLE_ADMIN?:', userRole.value === 'ROLE_ADMIN');
  return userRole.value === 'ROLE_ADMIN';
});
const isAuthPage = computed(() => ['/login', '/signup'].includes(route.path));

// Add a loading state
const isLoading = computed(() => !store.userData.value && store.isAuthenticated.value);

const debugUserData = computed(() => {
  console.log('userData:', store.userData.value);
  console.log('userRole:', userRole.value);
  console.log('isAdmin:', isAdmin.value);
  return store.userData.value;
});
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Crowdfunding Platform</RouterLink>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'projects' }">Browse Projects</RouterLink>
          </li>

          <template v-if="store.isAuthenticated && !isLoading">
            <li v-if="isCreator" class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'creator-dashboard' }">My Projects</RouterLink>
            </li>
            <li v-if="isSupporter" class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'supporter-dashboard' }">My Pledges</RouterLink>
            </li>
            <li v-if="isAdmin" class="nav-item">
              <RouterLink class="nav-link" to="/admin">Admin Dashboard</RouterLink>
            </li>
          </template>
        </ul>
        
        <ul class="navbar-nav">
          <template v-if="!store.isAuthenticated">
            <li v-if="!isAuthPage" class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'signup' }">Register</RouterLink>
            </li>
            <li v-if="!isAuthPage" class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'login' }">Login</RouterLink>
            </li>
          </template>
          <template v-else-if="!isAuthPage">
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'profile' }">Profile</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'logout' }">Logout</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.notification-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--bs-gray-100);
}
</style>
