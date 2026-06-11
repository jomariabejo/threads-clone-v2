import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getFeed } from '@/client/api/posts';
import type { PostResponseDto } from '@/client/api/types';

export const FEED_QUERY_KEY = ['posts', 'feed'] as const;
export const NEW_POSTS_QUERY_KEY = ['posts', 'feed', 'new'] as const;
const FEED_PAGE_SIZE = 20;

export const useFeed = () =>
  useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => getFeed(pageParam, FEED_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.last ? undefined : lastPage.number + 1),
  });

export const usePendingNewPosts = () =>
  useQuery({
    queryKey: NEW_POSTS_QUERY_KEY,
    queryFn: () => [] as PostResponseDto[],
    initialData: [] as PostResponseDto[],
    staleTime: Infinity,
  });
