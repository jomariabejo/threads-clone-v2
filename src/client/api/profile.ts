import { apiClient } from './client';
import type { ProfileResponseDto, PublicProfileResponseDto, UpdateProfileRequest } from './types';

const DEFAULT_PAGE_SIZE = 20;

export const getProfile = async (): Promise<ProfileResponseDto> => {
  const { data } = await apiClient.get<ProfileResponseDto>('/api/profile');
  return data;
};

export const updateProfile = async (payload: UpdateProfileRequest): Promise<ProfileResponseDto> => {
  const formData = new FormData();
  if (payload.bio !== undefined) {
    formData.append('bio', payload.bio);
  }
  if (payload.avatar) {
    formData.append('avatar', payload.avatar);
  }

  const { data } = await apiClient.patch<ProfileResponseDto>('/api/profile', formData);
  return data;
};

export const getPublicProfile = async (userId: number, page = 0, size: number = DEFAULT_PAGE_SIZE): Promise<PublicProfileResponseDto> => {
  const { data } = await apiClient.get<PublicProfileResponseDto>(`/api/profile/${userId}`, { params: { page, size } });
  return data;
};
