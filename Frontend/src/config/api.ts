// API configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// API endpoints
export const ENDPOINTS = {
  UPLOAD: '/api/v1/upload',
  HEALTH: '/api/v1/health',
  USERS: '/api/v1/users',
  SHIFTS: (userId: string) => `/api/v1/users/${userId}/shifts`,
} as const; 