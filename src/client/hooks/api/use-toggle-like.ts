import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toggleLike } from '@/client/api/posts';
import type { Page, PostResponseDto } from '@/client/api/types';
import { FEED_QUERY_KEY } from './use-feed';

export type FeedData = InfiniteData<Page<PostResponseDto>>;

export const updatePostInFeed = (
  data: FeedData,
  postId: number,
  updater: (post: PostResponseDto) => PostResponseDto
): FeedData => ({
  ...data,
  pages: data.pages.map(page => ({
    ...page,
    content: page.content.map(post => (post.id === postId ? updater(post) : post)),
  })),
});

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData<FeedData>(FEED_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<FeedData>(
          FEED_QUERY_KEY,
          updatePostInFeed(previous, postId, post => ({
            ...post,
            liked: !post.liked,
            likesCount: post.likesCount + (post.liked ? -1 : 1),
          }))
        );
      }

      return { previous };
    },
    onError: (_error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (result, postId) => {
      queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, current =>
        current
          ? updatePostInFeed(current, postId, post => ({ ...post, liked: result.liked, likesCount: result.likesCount }))
          : current
      );
    },
  });
};
