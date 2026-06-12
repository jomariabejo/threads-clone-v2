import { apiClient } from './client';
import type {
  AccountStatus,
  AdminPostListParams,
  AdminStatsDto,
  AdminUserDto,
  AdminUserListParams,
  PagedResponse,
  PostResponseDto,
  PostStatus,
  ResetPasswordResponseDto,
  UserRole,
} from './types';

export const getAdminUsers = async (params: AdminUserListParams): Promise<PagedResponse<AdminUserDto>> => {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('size', String(params.size));
  if (params.search) searchParams.set('search', params.search);
  if (params.role) searchParams.set('role', params.role);
  if (params.accountStatus) searchParams.set('accountStatus', params.accountStatus);
  if (params.createdFrom) searchParams.set('createdFrom', params.createdFrom);
  if (params.createdTo) searchParams.set('createdTo', params.createdTo);
  if (params.updatedFrom) searchParams.set('updatedFrom', params.updatedFrom);
  if (params.updatedTo) searchParams.set('updatedTo', params.updatedTo);
  for (const { field, direction } of params.sort) {
    searchParams.append('sort', `${field},${direction}`);
  }

  const { data } = await apiClient.get<PagedResponse<AdminUserDto>>(`/api/admin/users?${searchParams.toString()}`);
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

export const getAdminPosts = async (params: AdminPostListParams): Promise<PagedResponse<PostResponseDto>> => {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('size', String(params.size));
  if (params.search) searchParams.set('search', params.search);
  if (params.authorId !== undefined) searchParams.set('authorId', String(params.authorId));
  if (params.visibility) searchParams.set('visibility', params.visibility);
  if (params.status) searchParams.set('status', params.status);
  if (params.createdFrom) searchParams.set('createdFrom', params.createdFrom);
  if (params.createdTo) searchParams.set('createdTo', params.createdTo);
  for (const { field, direction } of params.sort) {
    searchParams.append('sort', `${field},${direction}`);
  }

  const { data } = await apiClient.get<PagedResponse<PostResponseDto>>(`/api/admin/posts?${searchParams.toString()}`);
  return data;
};

export const deleteAdminPost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/api/admin/posts/${postId}`);
};

export const deleteAdminPostsBulk = async (ids: number[]): Promise<void> => {
  await apiClient.delete('/api/admin/posts/bulk', { data: { ids } });
};

export const updateAdminPostsStatusBulk = async (ids: number[], status: PostStatus): Promise<PostResponseDto[]> => {
  const { data } = await apiClient.patch<PostResponseDto[]>('/api/admin/posts/bulk/status', { ids, status });
  return data;
};

export const getAdminStats = async (): Promise<AdminStatsDto> => {
  const { data } = await apiClient.get<AdminStatsDto>('/api/admin/stats');
  return data;
};
