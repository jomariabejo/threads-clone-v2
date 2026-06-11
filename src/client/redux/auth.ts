import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type AuthState, defaultState, authActions, initAuth } from './auth-actions';

export const authSlice = createSlice({
  name: 'auth',
  initialState: defaultState,
  reducers: authActions,
  extraReducers: builder => {
    builder.addCase(initAuth.fulfilled, (state, action: PayloadAction<AuthState>) => {
      Object.assign(state, action.payload);
    });
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
