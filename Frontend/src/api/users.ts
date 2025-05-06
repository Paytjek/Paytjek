import { Profile } from '../contexts/ProfileContext';

// Henter API basis URL fra miljøvariabel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Henter alle brugerprofiler fra API'et
 * @returns Et array af brugerprofiler
 */
export async function fetchUsers(): Promise<Profile[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const users: Profile[] = await response.json();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
} 