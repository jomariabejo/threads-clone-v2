import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/client/api/admin';

export const ADMIN_STATS_QUERY_KEY = ['admin', 'stats'] as const;

export const useAdminStats = () =>
  useQuery({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: getAdminStats,
  });
