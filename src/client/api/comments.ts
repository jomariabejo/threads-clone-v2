import { apiClient } from './client';
import type { CommentResponseDto, Page } from './types';

const DEFAULT_PAGE_SIZE = 20;

export const getComments = async (postId: number, page: number, size: number = DEFAULT_PAGE_SIZE): Promise<Page<CommentResponseDto>> => {
  const { data } = await apiClient.get<Page<CommentResponseDto>>(`/api/posts/feed/${postId}/comments`, { params: { page, size } });
  return data;
};

export const createComment = async (postId: number, text: string): Promise<CommentResponseDto> => {
  const { data } = await apiClient.post<CommentResponseDto>(`/api/posts/feed/${postId}/comments`, { text });
  return data;
};

export const updateComment = async (id: number, text: string): Promise<CommentResponseDto> => {
  const { data } = await apiClient.patch<CommentResponseDto>(`/api/posts/comments/${id}`, { text });
  return data;
};

export const deleteComment = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/posts/comments/${id}`);
};
