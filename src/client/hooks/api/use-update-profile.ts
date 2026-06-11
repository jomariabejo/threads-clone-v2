import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/client/api/profile';
import type { UpdateProfileRequest } from '@/client/api/types';
import { CURRENT_USER_QUERY_KEY } from './use-current-user';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
