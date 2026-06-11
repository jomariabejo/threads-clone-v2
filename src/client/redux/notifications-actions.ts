export const defaultState = {
  unreadCount: 0,
};

export type NotificationsState = typeof defaultState;

export const notificationsActions = {
  incrementUnread: (state: NotificationsState) => {
    state.unreadCount += 1;
  },
  clearUnread: (state: NotificationsState) => {
    state.unreadCount = 0;
  },
};
