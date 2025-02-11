import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useApplicationStore = defineStore('application', () => {
    const userData = ref(null);

    function checkJWT(token) {
        if (token === null || token === undefined) {
            return false;
        }
        const base64Url = token.split('.')[1];
        if (!base64Url) return false;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime < payload.exp;
    }

    const isAuthenticated = computed(() => {
        return checkJWT(userData.value?.accessToken);
    });

    const setUserData = (tempUserData) => {
        userData.value = tempUserData;
        localStorage.setItem('userData', JSON.stringify(userData.value));
    };

    const clearUserData = () => {
        localStorage.setItem('userData', JSON.stringify(null));
        userData.value = null;
    };

    const persistUserData = () => {
        localStorage.setItem('userData', JSON.stringify(userData.value));
    };

    const loadUserData = () => {
        let tempUserData = localStorage.getItem('userData');
        console.log('Store - loadUserData - Raw localStorage data:', tempUserData);
        
        tempUserData = JSON.parse(tempUserData);
        console.log('Store - loadUserData - Parsed userData:', tempUserData);
        console.log('Store - loadUserData - Roles type:', Array.isArray(tempUserData?.roles));
        
        if (tempUserData === null || tempUserData === undefined) {
            return;
        }
        userData.value = tempUserData;
        console.log('Store - loadUserData - Set userData to:', userData.value);
    };

    // Load user data when store is created
    loadUserData();

    return {
        userData,
        isAuthenticated,
        setUserData,
        clearUserData,
        persistUserData,
        loadUserData
    };
});
