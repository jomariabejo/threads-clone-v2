import { useInfiniteQuery } from '@tanstack/react-query';
import { getDrafts } from '@/client/api/posts';

export const DRAFTS_QUERY_KEY = ['posts', 'drafts'] as const;
const DRAFTS_PAGE_SIZE = 20;

export const useDrafts = () =>
  useInfiniteQuery({
    queryKey: DRAFTS_QUERY_KEY,
    queryFn: ({ pageParam }) => getDrafts(pageParam, DRAFTS_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.last ? undefined : lastPage.number + 1),
  });
