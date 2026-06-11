import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router';
import { useWebSocket } from './use-websocket';
import { type FeedData, updatePostInFeed } from './api/use-toggle-like';
import { FEED_QUERY_KEY, NEW_POSTS_QUERY_KEY } from './api/use-feed';
import { type AppDispatch, type RootState } from '@/client/redux/store';
import { clearUnread, incrementUnread } from '@/client/redux/notifications';
import { API_BASE_URL } from '@/client/api/client';
import { ROUTES } from '@/client/utilities/constants';
import { toaster } from '@/client/ui/components/toaster';
import type { ActivityItemDto, PostResponseDto } from '@/client/api/types';

interface LikeUpdateMessage {
  type: 'like_update';
  postId: number;
  likesCount: number;
}

interface NewPostMessage {
  type: 'new_post';
  post: PostResponseDto;
}

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export const useNotificationSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const location = useLocation();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const url = token ? `${WS_BASE_URL}/ws/notifications?token=${encodeURIComponent(token)}` : null;

  const handleMessage = useCallback((data: unknown) => {
    if ((data as { type?: string }).type === 'like_update') {
      const { postId, likesCount } = data as LikeUpdateMessage;
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, current =>
        current ? updatePostInFeed(current, postId, post => ({ ...post, likesCount })) : current);
      return;
    }

    if ((data as { type?: string }).type === 'new_post') {
      const { post } = data as NewPostMessage;
      if (post.author.id === currentUserId) return;
      queryClient.setQueryData<PostResponseDto[]>(NEW_POSTS_QUERY_KEY, current => {
        const list = current ?? [];
        return list.some(p => p.id === post.id) ? list : [...list, post];
      });
      return;
    }

    const item = data as ActivityItemDto;

    void queryClient.invalidateQueries({ queryKey: ['activity'] });

    if (item.type === 'LIKE') {
      void queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    }

    if (location.pathname === ROUTES.ACTIVITY) {
      dispatch(clearUnread());
    }
    else {
      dispatch(incrementUnread());
    }

    const messageId = item.type === 'LIKE' ? 'notification.like' : 'notification.comment';

    toaster.create({
      type: 'info',
      title: intl.formatMessage({ id: messageId }, { name: item.actor.name }),
    });
  }, [queryClient, dispatch, location.pathname, intl, currentUserId]);

  useWebSocket({ url, onMessage: handleMessage });

  useEffect(() => {
    if (location.pathname === ROUTES.ACTIVITY) {
      dispatch(clearUnread());
    }
  }, [location.pathname, dispatch]);
};
