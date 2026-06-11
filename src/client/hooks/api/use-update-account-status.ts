import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserAccountStatus } from '@/client/api/admin';
import type { AccountStatus } from '@/client/api/types';
import { ADMIN_USERS_QUERY_KEY } from './use-admin-users';
import { ADMIN_STATS_QUERY_KEY } from './use-admin-stats';

export const useUpdateAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, accountStatus }: { userId: number; accountStatus: AccountStatus }) =>
      updateUserAccountStatus(userId, accountStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
    },
  });
};
