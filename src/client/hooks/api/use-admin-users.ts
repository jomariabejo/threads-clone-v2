import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '@/client/api/admin';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useAdminUsers = (page: number, search: string) =>
  useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, page, search],
    queryFn: () => getAdminUsers(page, search),
    placeholderData: previous => previous,
  });
