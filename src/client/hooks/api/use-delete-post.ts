import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { deletePost } from '@/client/api/posts';
import type { Page, PostResponseDto } from '@/client/api/types';
import { FEED_QUERY_KEY } from './use-feed';
import { DRAFTS_QUERY_KEY } from './use-drafts';

type FeedData = InfiniteData<Page<PostResponseDto>>;

const removePost = (current: FeedData | undefined, postId: number): FeedData | undefined =>
  current
    ? {
      ...current,
      pages: current.pages.map(page => ({
        ...page,
        content: page.content.filter(post => post.id !== postId),
      })),
    }
    : current;

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, current => removePost(current, postId));
      queryClient.setQueryData<FeedData>(DRAFTS_QUERY_KEY, current => removePost(current, postId));
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
