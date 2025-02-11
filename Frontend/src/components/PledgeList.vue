<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="pledges.length">
        <div v-for="pledge in validPledges" :key="pledge.id" class="mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="d-flex gap-2 align-items-center">
                <span class="fw-medium">{{ getUserName(pledge) }}</span>
                <span class="badge bg-success">${{ pledge.amount }}</span>
              </div>
              <small v-if="pledge.comment" class="text-muted d-block">
                {{ pledge.comment }}
              </small>
            </div>
            <small class="text-muted">{{ formatDate(pledge.pledgeDate) }}</small>
          </div>
          
          <div v-if="showProject && pledge.project" class="mt-2">
            <div class="d-flex align-items-center gap-2">
              <RouterLink 
                :to="{ name: 'project-details', params: { id: pledge.project.id }}"
                class="small text-decoration-none d-flex align-items-center gap-2"
              >
                <span>{{ pledge.project.title }}</span>
                <span v-if="hasNewUpdates(pledge.project)" 
                      class="badge bg-primary rounded-pill"
                      title="New project update available">
                  <i class="bi bi-bell-fill"></i>
                </span>
              </RouterLink>
              <ProgressBar 
                :value="calculateProgress(pledge.project)" 
                :height="4" 
                :show-label="false" 
                class="mt-1" 
              />
            </div>
          </div>
        </div>
      </div>
      
      <p v-else class="text-muted mb-0 text-center">
        {{ emptyMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ProgressBar from './ProgressBar.vue';

const props = defineProps({
  pledges: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showProject: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Recent Pledges'
  },
  emptyMessage: {
    type: String,
    default: 'No pledges yet'
  },
  lastViewedUpdates: {
    type: Object,
    default: () => ({})
  }
});

// Filter out invalid pledges and ensure all required data is present
const validPledges = computed(() => {
  return props.pledges.filter(pledge => 
    typeof pledge === 'object' && 
    pledge !== null && 
    pledge.id && 
    pledge.amount && 
    pledge.pledgeDate
  );
});

const getUserName = (pledge) => {
  if (!pledge) return 'Unknown User';
  if (typeof pledge.user === 'object' && pledge.user && pledge.user.username) {
    return pledge.user.username;
  }
  return 'Unknown User';
};

const calculateProgress = (project) => {
  if (!project?.fundingGoal) return 0;
  return Math.round((project.currentFunding / project.fundingGoal) * 100);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const hasNewUpdates = (project) => {
  if (!project || !project.updates || project.updates.length === 0) return false;
  
  const lastViewedTimestamp = props.lastViewedUpdates[project.id] || 0;
  
  // Check if any update is newer than the last viewed timestamp
  return project.updates.some(update => {
    const updateTimestamp = new Date(update.createdAt).getTime();
    return updateTimestamp > lastViewedTimestamp;
  });
};
</script>

<style scoped>
.bi-bell-fill {
  font-size: 0.8rem;
}
</style> 