<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application.js';
import { useRemoteData } from '@/composables/useRemoteData.js';
import ProjectCard from '@/components/ProjectCard.vue';

const { isAuthenticated, userData } = useApplicationStore();
const isAdmin = computed(() => userData.value?.roles?.[0] === 'ROLE_ADMIN');
const featuredProjects = ref([]);
const { data, performRequest } = useRemoteData('/api/projects/featured', true);

onMounted(async () => {
  await performRequest();
  featuredProjects.value = data.value;
});
</script>

<template>
  <div class="home">
    <div class="bg-body-tertiary">
      <div class="container">
        <div class="jumbotron text-center py-5">
          <h1 class="display-4">Welcome to Crowdfunding Platform</h1>
          <p class="lead">Support creative projects and help bring ideas to life</p>
          
          <!-- Non-authenticated users -->
          <div v-if="!isAuthenticated" class="mt-4">
            <RouterLink to="/signup" class="btn btn-primary me-2">Get Started</RouterLink>
            <RouterLink to="/login" class="btn btn-secondary">Sign In</RouterLink>
          </div>
          
          <!-- Authenticated users -->
          <div v-else class="mt-4">
            <RouterLink to="/projects" class="btn btn-primary me-2">Browse Projects</RouterLink>
            <RouterLink to="/profile" class="btn btn-secondary me-2">My Profile</RouterLink>
            <RouterLink to="/logout" class="btn btn-outline-danger">Logout</RouterLink>
          </div>
        </div>

        <div v-if="featuredProjects.length" class="featured-projects">
          <h2 class="mb-4">Featured Projects</h2>
          <div class="row">
            <div 
              v-for="project in featuredProjects" 
              :key="project.id" 
              class="col-md-4"
            >
              <ProjectCard :project="project" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>