import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { adjustCommentsCount, commentsQueryKey } from './api/use-comments';
import { type RootState } from '@/client/redux/store';
import { API_BASE_URL } from '@/client/api/client';
import type { CommentResponseDto, Page } from '@/client/api/types';

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

const TYPING_START_DEBOUNCE_MS = 500;
const TYPING_STOP_DELAY_MS = 2000;

interface TypingMessage {
  type: 'typing_start' | 'typing_stop';
  userId: number;
}

interface CommentSyncMessage {
  type: 'comment_created' | 'comment_updated' | 'comment_deleted';
  actorId: number;
  comment?: CommentResponseDto;
  commentId?: number;
}

type IncomingMessage = TypingMessage | CommentSyncMessage;

export const useCommentTyping = (postId: number) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [typingUserIds, setTypingUserIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSentTypingStartRef = useRef(false);

  const url = token ? `${WS_BASE_URL}/ws/posts/${postId}/comments?token=${encodeURIComponent(token)}` : null;

  const handleMessage = useCallback((data: unknown) => {
    const message = data as IncomingMessage;

    if (message.type === 'typing_start' || message.type === 'typing_stop') {
      if (message.userId === currentUserId) {
        return;
      }

      if (message.type === 'typing_start') {
        setTypingUserIds((prev) => {
          if (prev.has(message.userId)) return prev;
          return new Set(prev).add(message.userId);
        });
      }
      else {
        setTypingUserIds((prev) => {
          if (!prev.has(message.userId)) return prev;
          const next = new Set(prev);
          next.delete(message.userId);
          return next;
        });
      }
      return;
    }

    const syncMessage = message as CommentSyncMessage;

    if (syncMessage.actorId === currentUserId) {
      return;
    }

    if (syncMessage.type === 'comment_created' && syncMessage.comment) {
      const created = syncMessage.comment;
      queryClient.setQueryData<Page<CommentResponseDto>>(commentsQueryKey(postId), (prev) => {
        if (!prev || prev.content.some(comment => comment.id === created.id)) return prev;
        return { ...prev, content: [created, ...prev.content], totalElements: prev.totalElements + 1 };
      });
      adjustCommentsCount(queryClient, postId, 1);
    }
    else if (syncMessage.type === 'comment_updated' && syncMessage.comment) {
      const updated = syncMessage.comment;
      queryClient.setQueryData<Page<CommentResponseDto>>(commentsQueryKey(postId), prev =>
        prev
          ? { ...prev, content: prev.content.map(comment => comment.id === updated.id ? updated : comment) }
          : prev);
    }
    else if (syncMessage.type === 'comment_deleted' && syncMessage.commentId !== undefined) {
      const deletedId = syncMessage.commentId;
      queryClient.setQueryData<Page<CommentResponseDto>>(commentsQueryKey(postId), (prev) => {
        if (!prev || !prev.content.some(comment => comment.id === deletedId)) return prev;
        return { ...prev, content: prev.content.filter(comment => comment.id !== deletedId), totalElements: prev.totalElements - 1 };
      });
      adjustCommentsCount(queryClient, postId, -1);
    }
  }, [currentUserId, queryClient, postId]);

  const { isConnected, send } = useWebSocket({ url, onMessage: handleMessage });

  const clearTimers = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  };

  const stopTyping = useCallback(() => {
    clearTimers();

    if (hasSentTypingStartRef.current) {
      send({ type: 'typing_stop' });
      hasSentTypingStartRef.current = false;
    }
  }, [send]);

  const notifyTyping = useCallback((value: string) => {
    clearTimers();

    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        if (!hasSentTypingStartRef.current && send({ type: 'typing_start' })) {
          hasSentTypingStartRef.current = true;
        }
      }, TYPING_START_DEBOUNCE_MS);

      stopTimeoutRef.current = setTimeout(() => {
        if (hasSentTypingStartRef.current) {
          send({ type: 'typing_stop' });
          hasSentTypingStartRef.current = false;
        }
      }, TYPING_STOP_DELAY_MS);
    }
    else if (hasSentTypingStartRef.current) {
      send({ type: 'typing_stop' });
      hasSentTypingStartRef.current = false;
    }
  }, [send]);

  useEffect(() => () => {
    clearTimers();

    if (hasSentTypingStartRef.current) {
      send({ type: 'typing_stop' });
    }
  }, [send]);

  return {
    typingCount: typingUserIds.size,
    notifyTyping,
    stopTyping,
    isConnected,
  };
};
