import { useQuery } from '@tanstack/react-query';
import { getPost } from '@/client/api/posts';

export const postQueryKey = (id: number) => ['posts', 'detail', id] as const;

export const usePost = (id: number | null) =>
  useQuery({
    queryKey: postQueryKey(id ?? -1),
    queryFn: () => getPost(id ?? -1),
    enabled: id !== null && Number.isFinite(id),
  });
