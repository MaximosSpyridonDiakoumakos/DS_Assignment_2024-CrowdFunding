<template>
  <div class="card h-100">
    <div class="card-body">
      <h5 class="card-title">{{ project.title }}</h5>
      <p class="card-text">{{ truncateDescription(project.description) }}</p>
      
      <ProgressBar :value="progress" class="mb-3" />
      
      <div class="d-flex justify-content-between mb-3">
        <span>${{ project.currentFunding }} raised</span>
        <span>${{ project.fundingGoal }} goal</span>
      </div>
      
      <div v-if="showStatus" class="status-badge mb-3">
        <span 
          :class="['badge', project.isApproved ? 'bg-success' : 'bg-warning']"
        >
          {{ project.isApproved ? 'Approved' : 'Pending Approval' }}
        </span>
      </div>
      
      <div class="btn-group">
        <slot name="actions">
          <RouterLink 
            :to="{ name: 'project-details', params: { id: project.id }}"
            class="btn btn-primary"
          >
            View Details
          </RouterLink>
          <button 
            v-if="isSupporter && project.isApproved"
            @click.prevent="$emit('pledge', project)"
            class="btn btn-success"
          >
            Pledge Support
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';
import { useApplicationStore } from '@/stores/application';

const store = useApplicationStore();
const isSupporter = computed(() => {
  console.log('ProjectCard - userData:', store.userData);
  console.log('ProjectCard - roles:', store.userData?.roles);
  const userRoles = store.userData?.roles || [];
  const result = userRoles.includes('ROLE_SUPPORTER');
  console.log('ProjectCard - isSupporter:', result);
  return result;
});

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  showStatus: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['pledge']);

const progress = computed(() => {
  if (!props.project.fundingGoal) return 0;
  return Math.round((props.project.currentFunding / props.project.fundingGoal) * 100);
});

const truncateDescription = (description) => {
  if (!description) return '';
  return description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;
};
</script> 