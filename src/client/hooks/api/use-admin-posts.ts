import { useQuery } from '@tanstack/react-query';
import { getAdminPosts } from '@/client/api/admin';

export const ADMIN_POSTS_QUERY_KEY = ['admin', 'posts'] as const;

export const useAdminPosts = (page: number, search: string) =>
  useQuery({
    queryKey: [...ADMIN_POSTS_QUERY_KEY, page, search],
    queryFn: () => getAdminPosts(page, search),
    placeholderData: previous => previous,
  });
