<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="mb-4">
            <RouterLink class="small" :to="{ name: 'projects' }">Back to Projects</RouterLink>
            <h1 class="fs-3">Create New Project</h1>
          </div>
          
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="onSubmit">
                <div class="mb-3">
                  <label for="title" class="form-label">Project Title</label>
                  <input 
                    id="title" 
                    v-model="formData.title" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.title }"
                    required 
                  />
                  <div class="invalid-feedback">{{ errors.title }}</div>
                </div>
                
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea 
                    id="description" 
                    v-model="formData.description" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.description }"
                    rows="5"
                    required
                  ></textarea>
                  <div class="invalid-feedback">{{ errors.description }}</div>
                  <div class="form-text">
                    Describe your project in detail. What are you trying to achieve?
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="fundingGoal" class="form-label">Funding Goal ($)</label>
                  <input 
                    id="fundingGoal" 
                    v-model="formData.fundingGoal" 
                    type="number" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.fundingGoal }"
                    min="1" 
                    required 
                  />
                  <div class="invalid-feedback">{{ errors.fundingGoal }}</div>
                </div>
                
                <div class="mb-4">
                  <label for="deadline" class="form-label">Project Deadline</label>
                  <input 
                    id="deadline" 
                    v-model="formData.deadline" 
                    type="date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.deadline }"
                    :min="minDate"
                    required 
                  />
                  <div class="invalid-feedback">{{ errors.deadline }}</div>
                  <div class="form-text">
                    The deadline must be at least 7 days from today
                  </div>
                </div>
                
                <div class="d-flex justify-content-end gap-2">
                  <RouterLink 
                    :to="{ name: 'projects' }" 
                    class="btn btn-outline-secondary"
                  >
                    Cancel
                  </RouterLink>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    {{ loading ? 'Creating...' : 'Create Project' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRemoteData } from '@/composables/useRemoteData.js';

const router = useRouter();
const loading = ref(false);
const errors = ref({});

const formData = ref({
  title: '',
  description: '',
  fundingGoal: 0,
  deadline: ''
});

const minDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
});

const validateForm = () => {
  errors.value = {};
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required';
  } else if (formData.value.title.length < 5) {
    errors.value.title = 'Title must be at least 5 characters';
  }
  
  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required';
  } else if (formData.value.description.length < 50) {
    errors.value.description = 'Description must be at least 50 characters';
  }
  
  if (!formData.value.fundingGoal || formData.value.fundingGoal < 1) {
    errors.value.fundingGoal = 'Funding goal must be greater than 0';
  }
  
  const deadlineDate = new Date(formData.value.deadline);
  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 7);
  
  if (!formData.value.deadline) {
    errors.value.deadline = 'Deadline is required';
  } else if (deadlineDate < minDeadline) {
    errors.value.deadline = 'Deadline must be at least 7 days from today';
  }
  
  return Object.keys(errors.value).length === 0;
};

const onSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    console.log('Submitting project data:', formData.value);
    const { performRequest } = useRemoteData('/api/projects', true, 'POST', {
      title: formData.value.title,
      description: formData.value.description,
      fundingGoal: parseFloat(formData.value.fundingGoal),
      deadline: `${formData.value.deadline}T00:00:00`
    });
    
    await performRequest();
    router.push({ name: 'projects' });
  } catch (error) {
    console.error('Project creation failed:', error);
    errors.value = { 
      general: error.message || 'Failed to create project. Please try again.' 
    };
  } finally {
    loading.value = false;
  }
};
</script> 