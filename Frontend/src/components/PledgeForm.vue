<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">Support this Project</h5>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="amount" class="form-label">Pledge Amount ($)</label>
          <input
            type="number"
            id="amount"
            v-model.number="amount"
            class="form-control"
            :class="{ 'is-invalid': errors.amount }"
            min="1"
            :max="remainingGoal"
            required
          />
          <div class="invalid-feedback">{{ errors.amount }}</div>
          <small class="form-text text-muted">
            Remaining goal: ${{ remainingGoal }}
          </small>
        </div>

        <div class="mb-3">
          <label for="comment" class="form-label">Comment (Optional)</label>
          <textarea
            id="comment"
            v-model="comment"
            class="form-control"
            rows="3"
          ></textarea>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          {{ loading ? 'Processing...' : `Pledge $${amount || 0}` }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRemoteData } from '@/composables/useRemoteData.js';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  fundingGoal: {
    type: Number,
    required: true
  },
  currentFunding: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['pledge-success']);

const amount = ref(null);
const comment = ref('');
const errors = ref({});
const loading = ref(false);

const remainingGoal = computed(() => 
  Math.max(0, props.fundingGoal - props.currentFunding)
);

const { performRequest: submitPledge } = useRemoteData(
  `/api/projects/${props.projectId}/pledges`,
  true,
  'POST'
);

const validateForm = () => {
  errors.value = {};
  
  if (!amount.value || amount.value <= 0) {
    errors.value.amount = 'Please enter a valid amount';
    return false;
  }
  
  if (amount.value > remainingGoal.value) {
    errors.value.amount = `Maximum pledge amount is $${remainingGoal.value}`;
    return false;
  }
  
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    await submitPledge({
      amount: amount.value,
      comment: comment.value.trim()
    });
    
    // Reset form
    amount.value = null;
    comment.value = '';
    
    emit('pledge-success');
  } catch (error) {
    console.error('Failed to submit pledge:', error);
    alert('Failed to submit pledge. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script> 