import { createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { decrypt, encrypt } from '@/client/utilities/encryption';
import { reportError } from '@/client/utilities/error-reporting';
import { LOCAL_STORAGE_ID } from '@/client/utilities/constants';
import type { CurrentUserResponseDto } from '@/client/api/types';

export const AUTH_STORAGE_KEY = `${LOCAL_STORAGE_ID}.auth`;

export const defaultState = {
  token: null as string | null,
  user: null as CurrentUserResponseDto | null,
};

export type AuthState = typeof defaultState;

interface PersistedAuthState extends AuthState {
  encryptionKey: string | null;
}

export const serializeAuthForStorage = async ({ token, user, encryptionKey }: PersistedAuthState): Promise<string | null> => {
  if (!encryptionKey) {
    return null;
  }

  const encrypted = await encrypt(JSON.stringify({ token, user }), encryptionKey);
  if (!encrypted) {
    reportError('Failed to encrypt auth state', { context: 'serializeAuthForStorage' });
    return null;
  }

  return encrypted;
};

// Once `initPreferences` resolves with the local-storage encryption key,
// `initAuth` decrypts and restores the persisted `{token, user}` pair.
export const initAuth = createAsyncThunk(
  'auth/initAuth',
  async (encryptionKey: string | null): Promise<AuthState> => {
    if (!encryptionKey) {
      return defaultState;
    }

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        return defaultState;
      }

      const decrypted = await decrypt(stored, encryptionKey);
      if (!decrypted) {
        return defaultState;
      }

      return JSON.parse(decrypted) as AuthState;
    } catch (error) {
      reportError(error, { context: 'initAuth' });
      return defaultState;
    }
  }
);

interface SetCredentialsPayload {
  token: string;
  user: CurrentUserResponseDto;
}

// Auth actions that don't require async.
export const authActions = {
  setCredentials: (state: AuthState, action: PayloadAction<SetCredentialsPayload>) => {
    state.token = action.payload.token;
    state.user = action.payload.user;
  },
  setUser: (state: AuthState, action: PayloadAction<CurrentUserResponseDto>) => {
    state.user = action.payload;
  },
  logout: () => defaultState,
};
