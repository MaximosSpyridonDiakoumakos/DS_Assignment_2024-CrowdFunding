<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="mb-4">
            <h1 class="fs-3">My Pledges</h1>
          </div>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else>
            <PledgeList
              :pledges="pledges"
              :loading="loading"
              :show-project="true"
              :last-viewed-updates="lastViewedUpdates"
              title="My Pledges"
              empty-message="You haven't made any pledges yet"
            >
              <template #empty>
                <div class="text-center">
                  <p>You haven't made any pledges yet</p>
                  <RouterLink :to="{ name: 'projects' }" class="btn btn-primary">
                    Browse Projects
                  </RouterLink>
                </div>
              </template>
            </PledgeList>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRemoteData } from '@/composables/useRemoteData.js';
import PledgeList from '@/components/PledgeList.vue';

const pledges = ref([]);
const loading = ref(true);
const lastViewedUpdates = ref({});

const { data, performRequest } = useRemoteData('/api/pledges/my', true);

// Load last viewed timestamps from localStorage
const loadLastViewedUpdates = () => {
  const stored = localStorage.getItem('lastViewedUpdates');
  if (stored) {
    lastViewedUpdates.value = JSON.parse(stored);
  }
};

// Save last viewed timestamp for a project
const updateLastViewed = (projectId) => {
  lastViewedUpdates.value[projectId] = Date.now();
  localStorage.setItem('lastViewedUpdates', JSON.stringify(lastViewedUpdates.value));
};

onMounted(async () => {
  try {
    loadLastViewedUpdates();
    await performRequest();
    pledges.value = data.value;
  } finally {
    loading.value = false;
  }
});
</script> 