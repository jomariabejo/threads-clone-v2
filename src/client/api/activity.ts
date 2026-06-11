import { apiClient } from './client';
import type { ActivityItemDto } from './types';

export const getActivity = async (): Promise<ActivityItemDto[]> => {
  const { data } = await apiClient.get<ActivityItemDto[]>('/api/activity');
  return data;
};
