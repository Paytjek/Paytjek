// Health check API to verify connection to backend

// Get base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Checks if the backend API is reachable
 * @returns Promise with health check result
 */
export async function checkBackendHealth(): Promise<any> {
  console.log('Checking backend health at:', API_URL);
  
  try {
    // Try to reach the API root endpoint - both direct and proxied
    const apiEndpoint = '/';
    const requestUrl = apiEndpoint.startsWith('http') 
      ? apiEndpoint 
      : `${API_URL}${apiEndpoint}`;
      
    console.log('Making request to:', requestUrl);
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Backend health check successful:', data);
    return data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
} 