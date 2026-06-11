import { apiClient } from './client';
import type {
  AccountStatus,
  AdminStatsDto,
  AdminUserDto,
  Page,
  PostResponseDto,
  ResetPasswordResponseDto,
  UserRole,
} from './types';

const DEFAULT_PAGE_SIZE = 20;

export const getAdminUsers = async (
  page: number,
  search?: string,
  size: number = DEFAULT_PAGE_SIZE
): Promise<Page<AdminUserDto>> => {
  const { data } = await apiClient.get<Page<AdminUserDto>>('/api/admin/users', {
    params: { page, size, search },
  });
  return data;
};

export const updateUserRole = async (userId: number, role: UserRole): Promise<AdminUserDto> => {
  const { data } = await apiClient.patch<AdminUserDto>(`/api/admin/users/${userId}/role`, { role });
  return data;
};

export const updateUserAccountStatus = async (userId: number, accountStatus: AccountStatus): Promise<AdminUserDto> => {
  const { data } = await apiClient.patch<AdminUserDto>(`/api/admin/users/${userId}/status`, { accountStatus });
  return data;
};

export const resetUserPassword = async (userId: number): Promise<ResetPasswordResponseDto> => {
  const { data } = await apiClient.post<ResetPasswordResponseDto>(`/api/admin/users/${userId}/reset-password`);
  return data;
};

export const getAdminPosts = async (
  page: number,
  search?: string,
  size: number = DEFAULT_PAGE_SIZE
): Promise<Page<PostResponseDto>> => {
  const { data } = await apiClient.get<Page<PostResponseDto>>('/api/admin/posts', {
    params: { page, size, search },
  });
  return data;
};

export const deleteAdminPost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/api/admin/posts/${postId}`);
};

export const getAdminStats = async (): Promise<AdminStatsDto> => {
  const { data } = await apiClient.get<AdminStatsDto>('/api/admin/stats');
  return data;
};
