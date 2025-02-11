<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="fs-3">Browse Projects</h1>
            <RouterLink 
              v-if="isCreator" 
              :to="{ name: 'create-project' }" 
              class="btn btn-primary"
            >
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
              class="col-md-4 mb-4"
            >
              <ProjectCard 
                :project="project" 
                @pledge="showPledgeModal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Pledge Modal -->
  <div class="modal fade" 
       id="pledgeModal" 
       tabindex="-1" 
       ref="pledgeModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Pledge Support</h5>
          <button type="button" 
                  class="btn-close" 
                  data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitPledge">
            <div class="mb-3">
              <label class="form-label">Project</label>
              <input type="text" 
                     class="form-control" 
                     :value="selectedProject?.title" 
                     disabled>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (€)</label>
              <input type="number" 
                     class="form-control" 
                     v-model="pledgeAmount"
                     min="1"
                     :max="selectedProject?.fundingGoal - selectedProject?.currentFunding"
                     required>
              <small class="text-muted">
                Remaining goal: €{{ selectedProject?.fundingGoal - selectedProject?.currentFunding }}
              </small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" 
                  class="btn btn-secondary" 
                  data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" 
                  class="btn btn-primary" 
                  @click="submitPledge"
                  :disabled="!pledgeAmount || pledgeAmount <= 0">
            Submit Pledge
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application.js';
import { useRemoteData } from '@/composables/useRemoteData.js';
import ProjectCard from '@/components/ProjectCard.vue';
import { Modal } from 'bootstrap';

const { userData } = useApplicationStore();
const isCreator = computed(() => userData.value?.roles?.[0] === 'ROLE_CREATOR');

const projects = ref([]);
const loading = ref(true);

const { data, performRequest } = useRemoteData('/api/projects', true);

const store = useApplicationStore();

const pledgeModal = ref(null);
const selectedProject = ref(null);
const pledgeAmount = ref(null);
let modalInstance = null;

onMounted(async () => {
  try {
    await performRequest();
    console.log('Raw project data:', data.value);
    // Only show approved projects in the list
    projects.value = data.value.filter(project => project.isApproved);
    console.log('Filtered projects:', projects.value);
  } finally {
    loading.value = false;
  }
});

const showPledgeModal = (project) => {
  console.log('Opening pledge modal for project:', project);
  selectedProject.value = project;
  pledgeAmount.value = null;
  
  // Create a new modal instance each time
  const modalElement = pledgeModal.value;
  if (modalElement) {
    const modal = new Modal(modalElement);
    modal.show();
    modalInstance = modal;
  } else {
    console.error('Modal element not found');
  }
};

const submitPledge = async () => {
  if (!selectedProject.value || !pledgeAmount.value) return;

  try {
    const response = await fetch(`/api/projects/${selectedProject.value.id}/pledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`
      },
      body: JSON.stringify({
        amount: pledgeAmount.value
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit pledge: ${response.statusText}`);
    }

    // Close modal
    if (modalInstance) {
      modalInstance.hide();
    }

    // Refresh projects list
    await performRequest();
    projects.value = data.value.filter(project => project.isApproved);

    // Show success message
    alert('Pledge submitted successfully!');
  } catch (error) {
    console.error('Failed to submit pledge:', error);
    alert('Failed to submit pledge. Please try again.');
  }
};
</script> 