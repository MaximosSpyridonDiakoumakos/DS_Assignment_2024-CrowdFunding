<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project.id">
          <td>{{ project.title }}</td>
          <td>
            <span 
              :class="['badge', project.isApproved ? 'bg-success' : 'bg-warning']"
            >
              {{ project.status }}
            </span>
          </td>
          <td>
            <div class="progress" style="height: 6px;">
              <div 
                class="progress-bar" 
                role="progressbar"
                :style="{ width: calculateProgress(project) + '%' }"
              />
            </div>
            <small class="text-muted">{{ calculateProgress(project) }}%</small>
          </td>
          <td>
            <slot name="actions" :project="project">
              <RouterLink 
                :to="{ name: 'project-details', params: { id: project.id }}"
                class="btn btn-sm btn-outline-primary"
              >
                View
              </RouterLink>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  projects: {
    type: Array,
    required: true
  }
});

const calculateProgress = (project) => {
  if (!project?.fundingGoal) return 0;
  return Math.round((project.currentFunding / project.fundingGoal) * 100);
};
</script> 