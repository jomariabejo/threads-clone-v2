import { createSlice } from '@reduxjs/toolkit';
import { defaultState, notificationsActions } from './notifications-actions';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: defaultState,
  reducers: notificationsActions,
});

export const { incrementUnread, clearUnread } = notificationsSlice.actions;
export default notificationsSlice.reducer;
