<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="fs-3">My Projects</h1>
            <RouterLink :to="{ name: 'create-project' }" class="btn btn-primary">
              Create New Project
            </RouterLink>
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else class="row">
            <div 
              v-for="project in projects" 
              :key="project.id" 
              class="col-md-6 mb-4"
            >
              <ProjectCard 
                :project="project" 
                :show-status="true"
              >
                <template #actions>
                  <RouterLink 
                    :to="{ name: 'project-details', params: { id: project.id }}"
                    class="btn btn-info"
                  >
                    View
                  </RouterLink>
                  <RouterLink 
                    :to="{ name: 'edit-project', params: { id: project.id }}"
                    class="btn btn-primary"
                  >
                    Edit
                  </RouterLink>
                  <button 
                    class="btn btn-danger"
                    @click="confirmDelete(project)"
                  >
                    Delete
                  </button>
                </template>
              </ProjectCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRemoteData } from '@/composables/useRemoteData.js';
import ProjectCard from '@/components/ProjectCard.vue';

const projects = ref([]);
const loading = ref(true);

const { data, performRequest } = useRemoteData('/api/projects/my', true);

const confirmDelete = async (project) => {
  if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;
  
  try {
    const { performRequest: deleteProject } = useRemoteData(`/api/projects/${project.id}`, true, 'DELETE');
    await deleteProject();
    projects.value = projects.value.filter(p => p.id !== project.id);
  } catch (error) {
    console.error('Failed to delete project:', error);
    alert('Failed to delete project. Please try again.');
  }
};

const loadProjects = async () => {
  try {
    await performRequest();
    projects.value = data.value;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProjects();
});
</script> 