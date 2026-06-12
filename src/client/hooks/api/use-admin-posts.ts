import { useQuery } from '@tanstack/react-query';
import { getAdminPosts } from '@/client/api/admin';
import type { AdminPostListParams } from '@/client/api/types';

export const ADMIN_POSTS_QUERY_KEY = ['admin', 'posts'] as const;

export const useAdminPosts = (params: AdminPostListParams) =>
  useQuery({
    queryKey: [...ADMIN_POSTS_QUERY_KEY, params],
    queryFn: () => getAdminPosts(params),
    placeholderData: previous => previous,
  });
