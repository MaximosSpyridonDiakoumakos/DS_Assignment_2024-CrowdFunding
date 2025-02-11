<template>
  <footer class="footer mt-auto py-4 bg-body-tertiary">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-3 mb-md-0">
          <h5 class="mb-3">CrowdFunding Platform</h5>
          <p class="text-muted small">
            Empowering creators and supporting innovative projects. Join our community
            to bring great ideas to life.
          </p>
        </div>
        <div class="col-md-4 mb-3 mb-md-0">
          <h5 class="mb-3">Quick Links</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <RouterLink to="/" class="text-decoration-none text-muted">Home</RouterLink>
            </li>
            <li class="mb-2">
              <RouterLink to="/projects" class="text-decoration-none text-muted">Browse Projects</RouterLink>
            </li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5 class="mb-3">Connect With Us</h5>
          <div class="d-flex gap-3 mb-3">
            <a href="#" class="text-muted" title="Facebook">
              <i class="bi bi-facebook fs-5"></i>
            </a>
            <a href="#" class="text-muted" title="Twitter">
              <i class="bi bi-twitter-x fs-5"></i>
            </a>
            <a href="#" class="text-muted" title="LinkedIn">
              <i class="bi bi-linkedin fs-5"></i>
            </a>
            <a href="#" class="text-muted" title="GitHub">
              <i class="bi bi-github fs-5"></i>
            </a>
          </div>
        </div>
      </div>
      <hr class="my-4" />
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
          <span class="text-muted small">
            © {{ currentYear }} CrowdFunding Platform. All rights reserved.
          </span>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <ul class="list-inline mb-0">
            <li class="list-inline-item">
              <RouterLink 
                to="/privacy" 
                class="text-muted small text-decoration-none"
              >
                Privacy Policy
              </RouterLink>
            </li>
            <li class="list-inline-item">
              <span class="text-muted mx-2">·</span>
            </li>
            <li class="list-inline-item">
              <RouterLink 
                to="/terms" 
                class="text-muted small text-decoration-none"
              >
                Terms of Service
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer h5 {
  font-weight: 600;
  font-size: 1rem;
}

.list-inline-item:not(:last-child) {
  margin-right: 0;
}

a:hover {
  color: var(--bs-primary) !important;
}
</style>
