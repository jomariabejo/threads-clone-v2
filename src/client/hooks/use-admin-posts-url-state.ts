import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { AdminPostSort, AdminPostSortField, PostStatus, Visibility } from '@/client/api/types';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: AdminPostSort[] = [{ field: 'createdAt', direction: 'desc' }];
const MAX_SORT_COLUMNS = 3;

const VISIBILITIES: Visibility[] = ['PUBLIC', 'PRIVATE'];
const POST_STATUSES: PostStatus[] = ['DRAFT', 'PUBLISHED'];
const SORT_FIELDS: AdminPostSortField[] = ['id', 'title', 'visibility', 'status', 'createdAt'];

export interface AdminPostsUrlState {
  search: string;
  visibility: Visibility | '';
  status: PostStatus | '';
  createdFrom: string;
  createdTo: string;
  sort: AdminPostSort[];
  page: number;
  size: number;
  hasActiveFilters: boolean;
}

const parseSort = (values: string[]): AdminPostSort[] => {
  const parsed: AdminPostSort[] = [];

  for (const value of values) {
    const [field, direction] = value.split(',');
    if (SORT_FIELDS.includes(field as AdminPostSortField) && (direction === 'asc' || direction === 'desc')) {
      parsed.push({ field: field as AdminPostSortField, direction });
    }
  }

  return parsed.length > 0 ? parsed : DEFAULT_SORT;
};

const serializeSort = (sort: AdminPostSort[]): string[] => sort.map(({ field, direction }) => `${field},${direction}`);

export const useAdminPostsUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo<AdminPostsUrlState>(() => {
    const visibilityParam = searchParams.get('visibility');
    const statusParam = searchParams.get('status');
    const page = Number.parseInt(searchParams.get('page') ?? '0', 10);
    const size = Number.parseInt(searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE), 10);

    return {
      search: searchParams.get('search') ?? '',
      visibility: VISIBILITIES.includes(visibilityParam as Visibility) ? (visibilityParam as Visibility) : '',
      status: POST_STATUSES.includes(statusParam as PostStatus) ? (statusParam as PostStatus) : '',
      createdFrom: searchParams.get('createdFrom') ?? '',
      createdTo: searchParams.get('createdTo') ?? '',
      sort: parseSort(searchParams.getAll('sort')),
      page: Number.isFinite(page) && page >= 0 ? page : 0,
      size: [10, 20, 50, 100].includes(size) ? size : DEFAULT_PAGE_SIZE,
      hasActiveFilters: Boolean(
        searchParams.get('search')
        ?? visibilityParam
        ?? statusParam
        ?? searchParams.get('createdFrom')
        ?? searchParams.get('createdTo')
      ),
    };
  }, [searchParams]);

  const applyUpdates = useCallback((updates: Record<string, string | string[] | undefined>, resetPage = false) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);

      for (const [key, value] of Object.entries(updates)) {
        next.delete(key);
        if (value === undefined || value === '') continue;

        if (Array.isArray(value)) {
          for (const item of value) next.append(key, item);
        } else {
          next.set(key, value);
        }
      }

      if (resetPage) next.delete('page');

      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSearch = useCallback((value: string) => { applyUpdates({ search: value }, true); }, [applyUpdates]);

  const setVisibility = useCallback((value: Visibility | '') => { applyUpdates({ visibility: value }, true); }, [applyUpdates]);

  const setStatus = useCallback((value: PostStatus | '') => { applyUpdates({ status: value }, true); }, [applyUpdates]);

  const setDateFilter = useCallback((key: 'createdFrom' | 'createdTo', value: string) => {
    applyUpdates({ [key]: value }, true);
  }, [applyUpdates]);

  const setPage = useCallback((page: number) => { applyUpdates({ page: page > 0 ? String(page) : undefined }); }, [applyUpdates]);

  const setPageSize = useCallback((size: number) => { applyUpdates({ size: String(size) }, true); }, [applyUpdates]);

  const toggleSort = useCallback((field: AdminPostSortField, multi: boolean) => {
    const current = state.sort;
    let next: AdminPostSort[];

    const existingIndex = current.findIndex(entry => entry.field === field);

    if (multi) {
      if (existingIndex >= 0) {
        next = current.map((entry, index) => (index === existingIndex
          ? { field, direction: entry.direction === 'asc' ? 'desc' : 'asc' }
          : entry));
      } else if (current.length < MAX_SORT_COLUMNS) {
        next = [...current, { field, direction: 'asc' }];
      } else {
        next = current;
      }
    } else if (existingIndex === 0 && current.length === 1) {
      next = [{ field, direction: current[0].direction === 'asc' ? 'desc' : 'asc' }];
    } else {
      next = [{ field, direction: 'asc' }];
    }

    applyUpdates({ sort: serializeSort(next) }, true);
  }, [applyUpdates, state.sort]);

  const clearFilters = useCallback(() => {
    applyUpdates({
      search: undefined,
      visibility: undefined,
      status: undefined,
      createdFrom: undefined,
      createdTo: undefined,
    }, true);
  }, [applyUpdates]);

  return { ...state, setSearch, setVisibility, setStatus, setDateFilter, setPage, setPageSize, toggleSort, clearFilters };
};
