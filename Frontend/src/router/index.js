import { createRouter, createWebHistory } from 'vue-router';
import { useApplicationStore } from '@/stores/application.js';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectListView.vue')
  },
  {
    path: '/projects/:id',
    name: 'project-details',
    component: () => import('@/views/ProjectDetailsView.vue')
  },
  {
    path: '/projects/new',
    name: 'create-project',
    component: () => import('@/views/CreateProjectView.vue'),
    meta: { requiresCreator: true }
  },
  {
    path: '/creator',
    name: 'creator-dashboard',
    component: () => import('@/views/CreatorDashboardView.vue'),
    meta: { requiresCreator: true }
  },
  {
    path: '/supporter',
    name: 'supporter-dashboard',
    component: () => import('@/views/SupporterDashboardView.vue'),
    meta: { requiresSupporter: true }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/AdminDashboardView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/TermsOfServiceView.vue')
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyPolicyView.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('@/views/LogoutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const store = useApplicationStore();

  // Add debug logs
  console.log('Route Guard - Destination:', to.path);
  console.log('Route Guard - User Data:', store.userData);
  console.log('Route Guard - User Role:', store.userData?.roles?.[0]);
  console.log('Route Guard - Is Authenticated:', store.isAuthenticated);

  // Redirect to login if accessing home page while not authenticated
  if (to.path === '/' && !store.isAuthenticated) {
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin && store.userData?.roles?.[0] !== 'ROLE_ADMIN') {
    next('/');
    return;
  }
  
  if (to.meta.requiresCreator && store.userData?.roles?.[0] !== 'ROLE_CREATOR') {
    next('/');
    return;
  }
  
  if (to.meta.requiresSupporter && !store.userData?.roles?.includes('ROLE_SUPPORTER')) {
    next('/');
    return;
  }
  
  next();
});

export default router;
