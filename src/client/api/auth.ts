import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await apiClient.post<RegisterResponse>('/api/auth/register', payload);
  return data;
};
