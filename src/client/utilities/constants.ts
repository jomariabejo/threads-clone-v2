// The identifier used in local storage
export const LOCAL_STORAGE_ID = 'Connectly';

export const META = {
  PREVIEW_IMAGE: '/favicon/web-app-manifest-512x512.png',
  FALLBACK: 'https://connectly.app',
  AUTHOR: 'Connectly',
  KEYWORDS: 'connectly, threads, social network, posts, comments, community',
  LANGUAGE: 'English',
  REVISIT_AFTER: '7 days',
  GENERATOR: 'Vite',
  OG_TYPE: 'website',
  LOCALE: 'en_US',
  TWITTER_CARD: 'summary_large_image',
  TWITTER_SITE: '',
  THEME_COLOR: '#1A3470',
  MOBILE_WEB_APP_CAPABLE: 'yes',
  APPLE_STATUS_BAR_STYLE: 'default',
} as const;

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
  POST_DETAIL: '/feed/:id',
} as const;

export const API_PATHS = {
  KEY: '/api/key',
} as const;

export const profileUserPath = (userId: number | string): string => `/profile/${userId}`;

export const postDetailPath = (id: number | string): string => `/feed/${id}`;

