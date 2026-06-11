export const DEFAULT_PORT = '3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FEED: '/feed',
  CREATE: '/create',
  SEARCH: '/search',
  ACTIVITY: '/activity',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_USER: '/profile/:userId',
  SITEMAP: '/sitemap.xml',
} as const;

export const API_PATHS = {
  KEY: '/api/key',
} as const;

/** Path prefix for API routes (e.g. for error handling). */
export const API_PREFIX = '/api';

export const BASE = 10;
