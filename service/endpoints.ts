/**
 * API Endpoints
 * Centralized location for all API endpoints
 */

export const ENDPOINTS = {
  // Auth endpoints
 AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SEND_OTP: '/auth/generate-otp',
    REGENERATE_OTP: '/auth/regenerate-otp',
    CREATE_USERNAME: '/auth/create-username',
  },

  // User endpoints
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },

  // Game endpoints
  GAME: {
    START: '/game/start',
    SUBMIT_GUESS: '/game/guess',
    GET_STATS: '/game/stats',
    GET_HISTORY: '/game/history',
    GET_LEADERBOARD: '/game/leaderboard',
    SAVE_RESULT: '/game/result',
  },

  // Wordle specific endpoints
  WORDLE: {
    GET_DAILY_WORD: '/game/word',
    VALIDATE_WORD: '/game/validate-word',
  },
} as const;

// Helper function to build endpoint with params
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return endpoint;

  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });

  return url;
};

// Example usage:
// buildEndpoint('/user/:id/posts/:postId', { id: 123, postId: 456 })
// Returns: '/user/123/posts/456'
