import { useQuery } from '@tanstack/react-query';
import { getAdminPosts } from '@/client/api/admin';

const ADMIN_USER_POSTS_PAGE_SIZE = 5;

export const ADMIN_USER_POSTS_QUERY_KEY = ['admin', 'users', 'posts'] as const;

export const useAdminUserPosts = (userId: number | undefined, page: number) =>
  useQuery({
    queryKey: [...ADMIN_USER_POSTS_QUERY_KEY, userId, page],
    queryFn: () => getAdminPosts({ page, size: ADMIN_USER_POSTS_PAGE_SIZE, authorId: userId, sort: [] }),
    enabled: userId !== undefined,
    placeholderData: previous => previous,
  });
