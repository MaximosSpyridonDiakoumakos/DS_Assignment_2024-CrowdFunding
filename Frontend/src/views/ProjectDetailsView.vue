<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="mb-4">
            <RouterLink class="small" :to="{ name: 'projects' }">Back to Projects</RouterLink>
            <div class="d-flex justify-content-between align-items-center">
              <h1 class="fs-3">{{ project.title }}</h1>
              <button 
                v-if="userData?.roles?.includes('ROLE_CREATOR')"
                class="btn btn-primary"
                @click="showNewUpdateForm"
              >
                New Update
              </button>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-8">
              <div class="card mb-4">
                <div class="card-body">
                  <h5 class="card-title">Project Description</h5>
                  <p class="lead">{{ project.description }}</p>
                </div>
              </div>
              
              <div class="card mb-4">
                <div class="card-body">
                  <h5 class="card-title">Funding Progress</h5>
                  <ProgressBar :value="fundingProgress" class="mb-3" />
                  
                  <div class="d-flex justify-content-between">
                    <div>
                      <h6>Current Funding</h6>
                      <p class="h4">${{ project.currentFunding }}</p>
                    </div>
                    <div>
                      <h6>Goal</h6>
                      <p class="h4">${{ project.fundingGoal }}</p>
                    </div>
                    <div>
                      <h6>Time Left</h6>
                      <p class="h4">{{ calculateDaysLeft() }} days</p>
                    </div>
                  </div>
                </div>
              </div>

              <ProjectUpdates 
                ref="updatesSection"
                :project-id="String(project.id)"
                v-if="project.id"
                :show-form="showUpdateForm"
                @update-form-closed="showUpdateForm = false"
              />
            </div>
            
            <div class="col-md-4">
              <PledgeForm
                v-if="canPledge"
                :project-id="project.id"
                :funding-goal="project.fundingGoal"
                :current-funding="project.currentFunding"
                @pledge-submitted="refreshProject"
              />
              
              <div v-else-if="!isAuthenticated" class="card mb-4">
                <div class="card-body text-center">
                  <p>Please sign in as a supporter to make a pledge</p>
                  <RouterLink :to="{ name: 'login' }" class="btn btn-primary">
                    Sign In
                  </RouterLink>
                </div>
              </div>

              <PledgeList
                :pledges="project.pledges || []"
                :loading="loading"
                title="Recent Pledges"
                class="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- New Update Modal -->
  <div class="modal fade" id="newUpdateModal" tabindex="-1" ref="updateModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create Project Update</h5>
          <button type="button" class="btn-close" @click="closeUpdateModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmitUpdate">
            <div class="mb-3">
              <label for="updateContent" class="form-label">Update Message</label>
              <textarea
                id="updateContent"
                v-model="newUpdate"
                class="form-control"
                :class="{ 'is-invalid': updateErrors.content }"
                rows="5"
                required
              ></textarea>
              <div class="invalid-feedback">{{ updateErrors.content }}</div>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                class="btn btn-outline-secondary"
                @click="closeUpdateModal"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Posting...' : 'Post Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApplicationStore } from '@/stores/application.js';
import { useRemoteData } from '@/composables/useRemoteData.js';
import PledgeForm from '@/components/PledgeForm.vue';
import ProjectUpdates from '@/components/ProjectUpdates.vue';
import PledgeList from '@/components/PledgeList.vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { Modal } from 'bootstrap';

const route = useRoute();
const { userData, isAuthenticated } = useApplicationStore();
const applicationStore = useApplicationStore();
const project = ref({});
const loading = ref(true);

const { data, performRequest } = useRemoteData(`/api/projects/${route.params.id}`, true);

const isProjectCreator = computed(() => {
  console.log('User Roles:', userData.value?.roles);
  return userData.value?.roles?.includes('ROLE_CREATOR');
});

const isSupporter = computed(() => 
  userData.value?.roles?.includes('ROLE_SUPPORTER')
);

const canPledge = computed(() => 
  isAuthenticated.value && 
  !isProjectCreator.value && 
  project.value?.status === 'ACTIVE'
);

const fundingProgress = computed(() => {
  if (!project.value?.fundingGoal) return 0;
  return Math.round((project.value.currentFunding / project.value.fundingGoal) * 100);
});

const calculateDaysLeft = () => {
  if (!project.value?.deadline) return 0;
  const deadline = new Date(project.value.deadline);
  const today = new Date();
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const refreshProject = async () => {
  await performRequest();
  project.value = data.value;
  
  // Update last viewed timestamp for supporters
  if (isSupporter.value) {
    const lastViewedUpdates = JSON.parse(localStorage.getItem('lastViewedUpdates') || '{}');
    lastViewedUpdates[project.value.id] = Date.now();
    localStorage.setItem('lastViewedUpdates', JSON.stringify(lastViewedUpdates));
  }
};

const updatesSection = ref(null);
const showUpdateForm = ref(false);

const updateModal = ref(null);
const modalInstance = ref(null);
const newUpdate = ref('');
const updateErrors = ref({});
const isSubmitting = ref(false);

const handleSubmitUpdate = async () => {
  updateErrors.value = {};
  
  if (!newUpdate.value.trim()) {
    updateErrors.value.content = 'Update content is required';
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await fetch(`/api/projects/${route.params.id}/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${applicationStore.userData?.accessToken}`
      },
      body: JSON.stringify({ content: newUpdate.value.trim() })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    await refreshProject();
    closeUpdateModal();
  } catch (error) {
    console.error('Failed to post update:', error);
    alert('Failed to post update. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const showNewUpdateForm = () => {
  if (!modalInstance.value) {
    modalInstance.value = new Modal(updateModal.value);
  }
  modalInstance.value.show();
};

const closeUpdateModal = () => {
  modalInstance.value?.hide();
  newUpdate.value = '';
  updateErrors.value = {};
};

onMounted(async () => {
  try {
    await performRequest();
    project.value = data.value;
    console.log('Project loaded:', project.value);
    console.log('Current user data:', userData.value);
    console.log('User roles:', userData.value?.roles);
    console.log('Has ROLE_CREATOR:', userData.value?.roles?.includes('ROLE_CREATOR'));
  } catch (error) {
    console.error('Error loading project:', error);
  }
});
</script> 