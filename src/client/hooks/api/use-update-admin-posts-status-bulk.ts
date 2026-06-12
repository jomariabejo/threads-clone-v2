import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminPostsStatusBulk } from '@/client/api/admin';
import { ADMIN_POSTS_QUERY_KEY } from './use-admin-posts';
import { ADMIN_STATS_QUERY_KEY } from './use-admin-stats';
import type { PostStatus } from '@/client/api/types';

export const useUpdateAdminPostsStatusBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: PostStatus }) => updateAdminPostsStatusBulk(ids, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
    },
  });
};
