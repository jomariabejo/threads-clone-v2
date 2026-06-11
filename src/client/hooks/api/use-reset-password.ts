import { useMutation } from '@tanstack/react-query';
import { resetUserPassword } from '@/client/api/admin';

export const useResetPassword = () =>
  useMutation({
    mutationFn: (userId: number) => resetUserPassword(userId),
  });
