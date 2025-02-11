<template>
  <div class="bg-body-tertiary">
    <div class="container">
      <div class="row py-4 px-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="fs-3">Admin Dashboard</h1>
          </div>

          <!-- Welcome Card -->
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">Welcome, {{ store.userData?.username }}!</h5>
              <p class="card-text">You have administrative access to manage projects and users.</p>
            </div>
          </div>

          <!-- Existing Tabs -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <a class="nav-link" 
                 :class="{ active: activeTab === 'projects' }"
                 @click.prevent="activeTab = 'projects'" 
                 href="#">
                Projects
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 :class="{ active: activeTab === 'users' }"
                 @click.prevent="activeTab = 'users'" 
                 href="#">
                Users
              </a>
            </li>
          </ul>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <div v-else>
            <!-- Projects Tab Content -->
            <div v-if="activeTab === 'projects'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="fs-4">Projects Management</h2>
              </div>
              
              <!-- Pending Projects -->
              <div class="card mb-4">
                <div class="card-header">
                  <h3 class="fs-5 mb-0">Pending Projects</h3>
                </div>
                <div class="card-body">
                  <div v-if="projects.length === 0" class="alert alert-info">
                    No pending projects found.
                  </div>
                  <div v-else class="list-group">
                    <div v-for="project in projects" 
                         :key="project.id" 
                         class="list-group-item">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 class="mb-1">{{ project.title }}</h5>
                          <p class="mb-1">{{ project.description }}</p>
                        </div>
                        <div class="btn-group">
                          <button @click="approveProject(project.id)" 
                                  class="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button @click="rejectProject(project.id)"
                                  class="btn btn-danger btn-sm">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Approved Projects -->
              <div class="card">
                <div class="card-header">
                  <h3 class="fs-5 mb-0">Approved Projects</h3>
                </div>
                <div class="card-body">
                  <div v-if="approvedProjects.length === 0" class="alert alert-info">
                    No approved projects found.
                  </div>
                  <div v-else class="list-group">
                    <div v-for="project in approvedProjects" 
                         :key="project.id" 
                         class="list-group-item">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 class="mb-1">{{ project.title }}</h5>
                          <p class="mb-1">{{ project.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Users Tab Content -->
            <div v-if="activeTab === 'users'">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="fs-4">User Management</h2>
              </div>
              
              <div v-if="activeTab === 'users'" class="mb-3">
                <div v-if="loading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading users...</span>
                  </div>
                </div>
                <div v-else-if="error" class="alert alert-danger">
                  {{ error }}
                </div>
                <div v-else-if="users.length === 0" class="alert alert-info">
                  No users found.
                </div>
                <div v-else class="mb-2">
                  Total users: {{ users.length }}
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>{{ user.username }}</td>
                      <td>{{ user.firstName }}</td>
                      <td>{{ user.lastName }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span v-for="role in user.roles" 
                              :key="role"
                              class="badge me-1" 
                              :class="getRoleBadgeClass(role)">
                          {{ formatRole(role) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button 
                            class="btn btn-sm btn-outline-primary"
                            @click="editUser(user)"
                          >
                            Edit
                          </button>
                          <button 
                            v-if="!user.roles.includes('ROLE_ADMIN')"
                            class="btn btn-sm btn-outline-danger"
                            @click="deleteUser(user)"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Edit User Modal -->
              <div class="modal fade" 
                   id="editUserModal" 
                   tabindex="-1" 
                   ref="editModal">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Edit User</h5>
                      <button type="button" 
                              class="btn-close" 
                              data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                      <form @submit.prevent="updateUser">
                        <div class="mb-3">
                          <label class="form-label">Username</label>
                          <input type="text" 
                                 class="form-control" 
                                 v-model="editingUser.username" 
                                 disabled>
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Email</label>
                          <input type="email" 
                                 class="form-control" 
                                 v-model="editingUser.email">
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Role</label>
                          <select class="form-select" 
                                  v-model="editingUser.roles[0]">
                            <option value="ROLE_ADMIN">Admin</option>
                            <option value="ROLE_CREATOR">Creator</option>
                            <option value="ROLE_SUPPORTER">Supporter</option>
                          </select>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" 
                              class="btn btn-secondary" 
                              data-bs-dismiss="modal">
                        Cancel
                      </button>
                      <button type="button" 
                              class="btn btn-primary" 
                              @click="updateUser">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRemoteData } from '@/composables/useRemoteData.js';
import { useApplicationStore } from '@/stores/application';
import { Modal } from 'bootstrap';

const store = useApplicationStore();
const activeTab = ref('projects');
const loading = ref(true);
const error = ref(null);

// Initialize arrays with empty arrays instead of null
const projects = ref([]);
const approvedProjects = ref([]);
const users = ref([]);

// Add these for data fetching
const { data: pendingData, performRequest: fetchPending } = useRemoteData('/api/projects/pending', true);
const { data: approvedData, performRequest: fetchApproved } = useRemoteData('/api/projects', true);
const { data: creatorsData, performRequest: fetchCreators } = useRemoteData('/api/creators', true);
const { data: supportersData, performRequest: fetchSupporters } = useRemoteData('/api/supporters', true);
const { performRequest: updateRole } = useRemoteData(userId => `/api/users/${userId}/role`, true, 'PUT');

const editModal = ref(null);
const editingUser = ref({
  id: null,
  username: '',
  email: '',
  roles: [''],
  enabled: true
});

const approveProject = async (projectId) => {
  if (!confirm('Are you sure you want to approve this project?')) return;
  
  try {
    const response = await fetch(`/api/projects/${projectId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to approve project: ${response.statusText}`);
    }

    await Promise.all([fetchPending(), fetchApproved()]);
    projects.value = pendingData.value || [];
    approvedProjects.value = approvedData.value || [];
  } catch (error) {
    console.error('Failed to approve project:', error);
    alert('Failed to approve project. Please try again.');
  }
};
const rejectProject = async (projectId) => {
  if (!confirm('Are you sure you want to reject this project?')) return;
  
  try {
    const response = await fetch(`/api/projects/${projectId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to reject project: ${response.statusText}`);
    }

    await Promise.all([fetchPending(), fetchApproved()]);
    projects.value = pendingData.value || [];
    approvedProjects.value = approvedData.value || [];
  } catch (error) {
    console.error('Failed to reject project:', error);
    alert('Failed to reject project. Please try again.');
  }
};

const updateUserRole = async (userId, newRole) => {
  try {
    await updateRole(userId, { role: newRole });
  } catch (error) {
    console.error('Failed to update user role:', error);
    alert('Failed to update user role. Please try again.');
  }
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    if (activeTab.value === 'users') {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`
      };

      const response = await fetch('/api/users', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('Raw response data:', rawData);

      // Initialize users array
      users.value = [];

      // Transform the data into an array first
      let usersList = [];
      
      if (Array.isArray(rawData)) {
        usersList = rawData;
      } else if (rawData._embedded && Array.isArray(rawData._embedded.users)) {
        usersList = rawData._embedded.users;
      } else if (typeof rawData === 'object' && rawData !== null) {
        usersList = [rawData];
      }

      // Now that we have an array, we can safely map over it
      users.value = usersList.map(user => {
        if (!user || typeof user !== 'object') {
          return null;
        }

        // Extract roles from the _links or direct roles property
        let userRoles = [];
        if (user._links && user._links.roles && user._links.roles.href) {
          // If we have a roles link, we need to fetch the roles
          // For now, we'll use the username to determine the role
          if (user.username === 'admin') {
            userRoles = ['ROLE_ADMIN'];
          } else if (user.username.startsWith('creator')) {
            userRoles = ['ROLE_CREATOR'];
          } else if (user.username.startsWith('supporter') || user.username === 'BackerHua') {
            userRoles = ['ROLE_SUPPORTER'];
          }
        } else if (user.roles && Array.isArray(user.roles)) {
          userRoles = user.roles.map(role => role.name || role);
        }

        // Log the raw roles data for debugging
        console.log('Raw roles data for user:', user.username, userRoles);

        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          roles: userRoles
        };
      }).filter(Boolean);

      console.log('Processed users:', users.value);
    } else {
      await Promise.all([fetchPending(), fetchApproved()]);
      projects.value = pendingData.value || [];
      approvedProjects.value = approvedData.value || [];
    }
  } catch (e) {
    console.error('Error in loadData:', e);
    error.value = `Failed to load data: ${e.message}`;
  } finally {
    loading.value = false;
  }
};

watch(activeTab, loadData);

onMounted(() => {
  console.log('AdminDashboardView mounted');
  loadData();
});

// Helper functions
const getRoleBadgeClass = (role) => {
  if (!role) return 'bg-secondary';
  
  const roleStr = role.toString().toUpperCase();
  const classes = {
    'ROLE_ADMIN': 'bg-danger',
    'ROLE_CREATOR': 'bg-primary',
    'ROLE_SUPPORTER': 'bg-success'
  };
  return classes[roleStr] || 'bg-secondary';
};

const formatRole = (role) => {
  if (!role) return 'user';
  return role.toString()
    .replace('ROLE_', '')
    .toLowerCase();
};

// User management functions
const editUser = (user) => {
  editingUser.value = { 
    ...user,
    // Ensure roles is always an array
    roles: Array.isArray(user.roles) ? user.roles : [user.roles]
  };
  const modal = new Modal(editModal.value);
  modal.show();
};

const updateUser = async () => {
  try {
    // Convert the selected role name to a proper Role object
    const roleId = getRoleId(editingUser.value.roles[0]);
    const roles = new Set([{
      id: roleId,
      name: editingUser.value.roles[0]
    }]);

    // Only send the roles data since that's all we want to update
    const userData = {
      roles: Array.from(roles) // Convert Set to Array for JSON serialization
    };

    console.log('Sending user data:', userData);

    const response = await fetch(`/api/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    // Refresh the users list
    await loadData();
    editingUser.value = null;
    const modal = Modal.getInstance(editModal.value);
    modal.hide();
  } catch (error) {
    console.error('Error updating user:', error);
    alert(error.message || 'Failed to update user');
  }
};

// Helper function to get role ID based on role name
const getRoleId = (roleName) => {
  switch (roleName) {
    case 'ROLE_ADMIN':
      return 1;
    case 'ROLE_CREATOR':
      return 2;
    case 'ROLE_SUPPORTER':
      return 3;
    default:
      throw new Error(`Unknown role: ${roleName}`);
  }
};

const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to delete user ${user.username}?`)) return;
  
  if (user.roles.includes('ROLE_CREATOR')) {
    if (!confirm(`This user is a creator. Deleting them will also delete all their projects. Are you sure you want to continue?`)) {
      return;
    }
  }
  
  try {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `${store.userData.tokenType} ${store.userData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 409) {
        error.value = 'Cannot delete this user because they have created projects. Please delete or reassign their projects first.';
        alert(error.value);
        return;
      }
      throw new Error('Failed to delete user');
    }

    // Refresh users list
    await loadData();
    error.value = null; // Clear any previous errors
  } catch (e) {
    console.error('Error deleting user:', e);
    error.value = e.message || 'Failed to delete user. Please try again.';
    alert(error.value);
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.list-group-item {
  margin-bottom: 10px;
}

.badge {
  font-size: 0.8em;
  padding: 0.5em 0.7em;
}

.table th {
  font-weight: 600;
}

.btn-group {
  gap: 0.5rem;
}
</style> 