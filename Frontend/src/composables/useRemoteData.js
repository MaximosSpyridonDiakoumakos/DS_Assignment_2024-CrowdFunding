import { ref } from 'vue';
import { useApplicationStore } from '@/stores/application.js';

const store = useApplicationStore();

export function useRemoteData(urlRef, authRef, methodRef = "GET", bodyRef = null) {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);

    const performRequest = async () => {
        loading.value = true;
        error.value = null;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (authRef === true && store.userData?.accessToken) {
            console.log('Adding auth token to request');
            headers['Authorization'] = `Bearer ${store.userData.accessToken}`;
        } else {
            console.warn('No auth token available:', { authRef, token: store.userData?.accessToken });
        }

        console.log('Full Headers:', headers);

        const config = {
            method: methodRef,
            headers: headers,
            credentials: 'include'
        };

        if (bodyRef !== null) {
            config.body = JSON.stringify(bodyRef);
        }

        console.log('Request URL:', urlRef);
        console.log('Request Config:', JSON.stringify(config, null, 2));

        try {
            const response = await fetch(urlRef, config);
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            const contentType = response.headers.get('content-type');
            console.log('Content type:', contentType);
            
            // Try to get the response text first to see what we're getting
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                const errorMessage = responseText || response.statusText || 'Request failed';
                console.error('Request failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorMessage
                });
                throw new Error(errorMessage);
            }

            // If we need JSON, parse the text we already got
            if (contentType && contentType.includes('application/json')) {
                const responseData = JSON.parse(responseText);
                data.value = responseData;
                return responseData;
            }
            
            return null;
        } catch (err) {
            console.error('Request error:', err);
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return { data, error, loading, performRequest };
}
