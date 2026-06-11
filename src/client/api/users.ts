import { apiClient } from './client';
import type { CurrentUserResponseDto } from './types';

export const getCurrentUser = async (): Promise<CurrentUserResponseDto> => {
  const { data } = await apiClient.get<CurrentUserResponseDto>('/api/users/me');
  return data;
};
