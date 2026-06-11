import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { search } from '@/client/api/search';

const SEARCH_DEBOUNCE_MS = 300;

export const useSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const timeout = setTimeout(() => { setDebouncedQuery(query.trim()); }, SEARCH_DEBOUNCE_MS);
    return () => { clearTimeout(timeout); };
  }, [query]);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
};
