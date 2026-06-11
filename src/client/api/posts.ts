import { apiClient } from './client';
import type { CreatePostRequest, LikeToggleResponseDto, Page, PostResponseDto, UpdatePostRequest } from './types';

const DEFAULT_PAGE_SIZE = 20;

export const getFeed = async (page: number, size: number = DEFAULT_PAGE_SIZE): Promise<Page<PostResponseDto>> => {
  const { data } = await apiClient.get<Page<PostResponseDto>>('/api/posts/feed', { params: { page, size } });
  return data;
};

export const getPost = async (id: number): Promise<PostResponseDto> => {
  const { data } = await apiClient.get<PostResponseDto>(`/api/posts/feed/${id}`);
  return data;
};

export const createPost = async (payload: CreatePostRequest): Promise<PostResponseDto> => {
  const formData = new FormData();
  if (payload.title) {
    formData.append('title', payload.title);
  }
  formData.append('content', payload.content);
  if (payload.visibility) {
    formData.append('visibility', payload.visibility);
  }
  if (payload.status) {
    formData.append('status', payload.status);
  }
  for (const image of payload.images ?? []) {
    formData.append('images', image);
  }
  for (const video of payload.videos ?? []) {
    formData.append('videos', video);
  }

  const { data } = await apiClient.post<PostResponseDto>('/api/posts/feed', formData);
  return data;
};

export const updatePost = async (id: number, payload: UpdatePostRequest): Promise<PostResponseDto> => {
  const { data } = await apiClient.put<PostResponseDto>(`/api/posts/feed/${id}`, payload);
  return data;
};

export const getDrafts = async (page: number, size: number = DEFAULT_PAGE_SIZE): Promise<Page<PostResponseDto>> => {
  const { data } = await apiClient.get<Page<PostResponseDto>>('/api/posts/drafts', { params: { page, size } });
  return data;
};

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/posts/feed/${id}`);
};

export const toggleLike = async (id: number): Promise<LikeToggleResponseDto> => {
  const { data } = await apiClient.post<LikeToggleResponseDto>(`/api/posts/feed/${id}/like`);
  return data;
};
