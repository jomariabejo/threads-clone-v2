import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminPostsBulk } from '@/client/api/admin';
import { ADMIN_POSTS_QUERY_KEY } from './use-admin-posts';
import { ADMIN_STATS_QUERY_KEY } from './use-admin-stats';

export const useDeleteAdminPostsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => deleteAdminPostsBulk(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
    },
  });
};
