import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/client/api/users';

export const CURRENT_USER_QUERY_KEY = ['users', 'me'] as const;

export const useCurrentUser = () =>
  useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
  });
