<template>
  <div class="progress" :style="{ height: height + 'px' }">
    <div 
      class="progress-bar" 
      role="progressbar"
      :style="{ width: value + '%' }"
      :aria-valuenow="value"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span v-if="showLabel">{{ value }}%</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    default: 16
  },
  showLabel: {
    type: Boolean,
    default: true
  }
});
</script> 