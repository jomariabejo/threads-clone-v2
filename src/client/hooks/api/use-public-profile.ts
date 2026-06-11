import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '@/client/api/profile';

export const publicProfileQueryKey = (userId: number) => ['profile', userId] as const;

export const usePublicProfile = (userId: number) =>
  useQuery({
    queryKey: publicProfileQueryKey(userId),
    queryFn: () => getPublicProfile(userId),
    enabled: Number.isFinite(userId),
  });
