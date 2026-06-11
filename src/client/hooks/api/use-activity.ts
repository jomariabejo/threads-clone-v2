import { useQuery } from '@tanstack/react-query';
import { getActivity } from '@/client/api/activity';

export const useActivity = () =>
  useQuery({
    queryKey: ['activity'],
    queryFn: getActivity,
  });
