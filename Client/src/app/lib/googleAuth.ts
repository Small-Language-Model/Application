/**
 * Google OAuth service
 * Handles the OAuth flow start and token extraction from callback
 */

const API_BASE_URL = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? 'http://localhost:8000';
const GOOGLE_START_URL = `${API_BASE_URL}/auth/google/start`;
const CALLBACK_ROUTE = '/auth/google/callback';

/**
 * Start the Google OAuth flow
 * Redirects the user to Google consent screen
 */
export function startGoogleOAuth(): void {
  window.location.href = GOOGLE_START_URL;
}

/**
 * Extract token from URL fragment after callback
 * Called from the callback page
 */
export function extractTokenFromCallback(): {
  accessToken: string | null;
  userId: string | null;
  error: string | null;
} {
  try {
    const fragment = window.location.hash.substring(1);
    if (!fragment) {
      return { accessToken: null, userId: null, error: 'No callback data found' };
    }

    const params = new URLSearchParams(fragment);
    const error = params.get('error');
    if (error) {
      return { accessToken: null, userId: null, error };
    }

    const accessToken = params.get('access_token');
    const userId = params.get('user_id');

    if (!accessToken) {
      return { accessToken: null, userId: null, error: 'No access token in callback' };
    }

    return { accessToken, userId, error: null };
  } catch (err) {
    return {
      accessToken: null,
      userId: null,
      error: err instanceof Error ? err.message : 'Error parsing callback',
    };
  }
}

/**
 * Get the callback route for frontend redirect
 * Used for deployment - will be set in env var from dev side
 */
export function getCallbackRoute(): string {
  return CALLBACK_ROUTE;
}

/**
 * Get the API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
