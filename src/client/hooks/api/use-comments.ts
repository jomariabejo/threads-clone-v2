import { useMutation, useQuery, useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { createComment, deleteComment, getComments, updateComment } from '@/client/api/comments';
import type { Page, PostResponseDto } from '@/client/api/types';
import { FEED_QUERY_KEY } from './use-feed';

const COMMENTS_PAGE_SIZE = 50;

export const commentsQueryKey = (postId: number) => ['posts', postId, 'comments'] as const;

export const useComments = (postId: number) =>
  useQuery({
    queryKey: commentsQueryKey(postId),
    queryFn: () => getComments(postId, 0, COMMENTS_PAGE_SIZE),
    select: data => data.content,
  });

export const adjustCommentsCount = (queryClient: QueryClient, postId: number, delta: number) => {
  queryClient.setQueryData<InfiniteData<Page<PostResponseDto>>>(FEED_QUERY_KEY, current =>
    current
      ? {
        ...current,
        pages: current.pages.map(page => ({
          ...page,
          content: page.content.map(post =>
            post.id === postId ? { ...post, commentsCount: post.commentsCount + delta } : post
          ),
        })),
      }
      : current
  );
};

export const useCreateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createComment(postId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(postId) });
      adjustCommentsCount(queryClient, postId, 1);
    },
  });
};

export const useUpdateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => updateComment(id, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(postId) });
    },
  });
};

export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsQueryKey(postId) });
      adjustCommentsCount(queryClient, postId, -1);
    },
  });
};
