// Shared constants for client and server
export const APP_CONFIG = {
  // Get the app domain from environment or infer from current location
  APP_DOMAIN: typeof window !== 'undefined' 
    ? '' // Use relative URLs in browser
    : process.env.APP_DOMAIN || 'http://localhost:5000',
  
  // API endpoints
  API_BASE: '/api',
  
  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  
  // Session timeout
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = APP_CONFIG.APP_DOMAIN;
  const apiPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${APP_CONFIG.API_BASE}${apiPath}`;
};

// Helper function to get full URL for any path
export const getFullUrl = (path: string = ''): string => {
  const domain = APP_CONFIG.APP_DOMAIN.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
};