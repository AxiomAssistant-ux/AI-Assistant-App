// ============================================
// APP CONFIGURATION
// ============================================

export const config = {
  // Toggle between mock and real API
  USE_MOCK: true,

  // API Base URL (for future backend integration)
  API_BASE_URL: 'https://virtual-assistant-c1e0f2944a3d.herokuapp.com/api/v1',

  // Token storage key
  TOKEN_STORAGE_KEY: 'store_response_auth_token',

  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,

  // App info
  APP_NAME: "McDonald's Assistant",
  APP_VERSION: '1.0.0',
};

export default config;
