import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserRole } from '@/client/api/admin';
import type { UserRole } from '@/client/api/types';
import { ADMIN_USERS_QUERY_KEY } from './use-admin-users';

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) => updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};
