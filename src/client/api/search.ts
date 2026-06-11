import { apiClient } from './client';
import type { SearchResponseDto } from './types';

export const search = async (query: string): Promise<SearchResponseDto> => {
  const { data } = await apiClient.get<SearchResponseDto>('/api/search', { params: { q: query } });
  return data;
};
