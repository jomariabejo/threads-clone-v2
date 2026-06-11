import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminPost } from '@/client/api/admin';
import { ADMIN_POSTS_QUERY_KEY } from './use-admin-posts';
import { ADMIN_STATS_QUERY_KEY } from './use-admin-stats';

export const useDeleteAdminPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deleteAdminPost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
    },
  });
};
