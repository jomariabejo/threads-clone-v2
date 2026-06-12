import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '@/client/api/admin';
import type { AdminUserListParams } from '@/client/api/types';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useAdminUsers = (params: AdminUserListParams) =>
  useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, params],
    queryFn: () => getAdminUsers(params),
    placeholderData: previous => previous,
  });
