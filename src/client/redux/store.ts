import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app';
import { type AppState } from './app-actions';
import preferencesReducer from './preferences';
import { type PreferencesState, serializePreferencesForStorage } from './preferences-actions';
import authReducer from './auth';
import { type AuthState, AUTH_STORAGE_KEY, serializeAuthForStorage } from './auth-actions';
import notificationsReducer from './notifications';
import { type NotificationsState } from './notifications-actions';
import { LOCAL_STORAGE_ID } from '@/client/utilities/constants';
import { createPersistenceMiddleware, persistSlice } from '@/client/utilities/persistence';

interface LocalState {
  preferences: PreferencesState;
  app: AppState;
  auth: AuthState;
  notifications: NotificationsState;
}

const persistenceMiddleware = createPersistenceMiddleware<LocalState>([
  persistSlice<LocalState, PreferencesState>({
    selectSlice: state => state.preferences,
    storageKey: LOCAL_STORAGE_ID,
    context: 'redux.preferences',
    serialize: serializePreferencesForStorage,
  }),
  persistSlice<LocalState, AuthState & { encryptionKey: string | null }>({
    selectSlice: state => ({ ...state.auth, encryptionKey: state.preferences.encryptionKey }),
    storageKey: AUTH_STORAGE_KEY,
    context: 'redux.auth',
    serialize: serializeAuthForStorage,
  }),
]);

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    app: appReducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware()
    .concat(persistenceMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
