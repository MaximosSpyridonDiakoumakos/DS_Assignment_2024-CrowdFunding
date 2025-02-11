<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="mb-4">
            <h1 class="fs-3">Profile</h1>
          </div>
          
          <div class="row">
            <div class="col-md-4">
              <div class="card mb-4">
                <div class="card-body">
                  <h5 class="card-title">Account Details</h5>
                  <p class="card-text">
                    <strong>Username:</strong> {{ userData.username }}<br>
                    <strong>Email:</strong> {{ userData.email }}<br>
                    <strong>Role:</strong> {{ userData.roles?.[0]?.replace('ROLE_', '') || 'No role assigned' }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="col-md-8">
              <div v-if="isCreator" class="mb-4">
                <h2 class="fs-4">My Projects</h2>
                <div v-if="loading" class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div v-else>
                  <ProjectTable :projects="myProjects">
                    <template #actions="{ project }">
                      <RouterLink 
                        :to="{ name: 'project-details', params: { id: project.id }}"
                        class="btn btn-sm btn-outline-primary"
                      >
                        View
                      </RouterLink>
                    </template>
                  </ProjectTable>
                </div>
              </div>
              
              <div v-if="isCreator" class="mb-4">
                <h2 class="fs-4">My Pledges</h2>
                <PledgeList
                  :pledges="myPledges"
                  :loading="loading"
                  :show-project="true"
                  title="My Pledges"
                  empty-message="You haven't made any pledges yet"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApplicationStore } from '@/stores/application.js';
import { useRemoteData } from '@/composables/useRemoteData.js';
import PledgeList from '@/components/PledgeList.vue';
import ProjectTable from '@/components/ProjectTable.vue';

const { userData } = useApplicationStore();
const isCreator = computed(() => userData.value?.roles?.[0] === 'ROLE_CREATOR');

const loading = ref(true);
const myProjects = ref([]);
const myPledges = ref([]);

const { data: projectsData, performRequest: fetchProjects } = useRemoteData('/api/projects/my', true);
const { data: pledgesData, performRequest: fetchPledges } = useRemoteData('/api/pledges/my', true);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

onMounted(async () => {
  try {
    if (isCreator.value) {
      await fetchProjects();
      myProjects.value = projectsData.value;
    }
    await fetchPledges();
    myPledges.value = pledgesData.value;
  } finally {
    loading.value = false;
  }
});
</script>
