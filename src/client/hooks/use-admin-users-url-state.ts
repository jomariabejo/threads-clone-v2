import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { AccountStatus, AdminUserSort, AdminUserSortField, UserRole } from '@/client/api/types';

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_SORT: AdminUserSort[] = [{ field: 'createdAt', direction: 'desc' }];
const MAX_SORT_COLUMNS = 3;

const USER_ROLES: UserRole[] = ['USER', 'ADMIN'];
const ACCOUNT_STATUSES: AccountStatus[] = ['ACTIVE', 'SUSPENDED'];
const SORT_FIELDS: AdminUserSortField[] = ['id', 'name', 'username', 'email', 'userRole', 'accountStatus', 'createdAt', 'updatedAt'];

export interface AdminUsersUrlState {
  search: string;
  role: UserRole | '';
  accountStatus: AccountStatus | '';
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  sort: AdminUserSort[];
  page: number;
  size: number;
  hasActiveFilters: boolean;
}

const parseSort = (values: string[]): AdminUserSort[] => {
  const parsed: AdminUserSort[] = [];

  for (const value of values) {
    const [field, direction] = value.split(',');
    if (SORT_FIELDS.includes(field as AdminUserSortField) && (direction === 'asc' || direction === 'desc')) {
      parsed.push({ field: field as AdminUserSortField, direction });
    }
  }

  return parsed.length > 0 ? parsed : DEFAULT_SORT;
};

const serializeSort = (sort: AdminUserSort[]): string[] => sort.map(({ field, direction }) => `${field},${direction}`);

export const useAdminUsersUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo<AdminUsersUrlState>(() => {
    const roleParam = searchParams.get('role');
    const accountStatusParam = searchParams.get('accountStatus');
    const page = Number.parseInt(searchParams.get('page') ?? '0', 10);
    const size = Number.parseInt(searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE), 10);

    return {
      search: searchParams.get('search') ?? '',
      role: USER_ROLES.includes(roleParam as UserRole) ? (roleParam as UserRole) : '',
      accountStatus: ACCOUNT_STATUSES.includes(accountStatusParam as AccountStatus) ? (accountStatusParam as AccountStatus) : '',
      createdFrom: searchParams.get('createdFrom') ?? '',
      createdTo: searchParams.get('createdTo') ?? '',
      updatedFrom: searchParams.get('updatedFrom') ?? '',
      updatedTo: searchParams.get('updatedTo') ?? '',
      sort: parseSort(searchParams.getAll('sort')),
      page: Number.isFinite(page) && page >= 0 ? page : 0,
      size: [10, 25, 50, 100].includes(size) ? size : DEFAULT_PAGE_SIZE,
      hasActiveFilters: Boolean(
        searchParams.get('search')
        ?? roleParam
        ?? accountStatusParam
        ?? searchParams.get('createdFrom')
        ?? searchParams.get('createdTo')
        ?? searchParams.get('updatedFrom')
        ?? searchParams.get('updatedTo')
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

  const setRole = useCallback((value: UserRole | '') => { applyUpdates({ role: value }, true); }, [applyUpdates]);

  const setAccountStatus = useCallback((value: AccountStatus | '') => { applyUpdates({ accountStatus: value }, true); }, [applyUpdates]);

  const setDateFilter = useCallback((key: 'createdFrom' | 'createdTo' | 'updatedFrom' | 'updatedTo', value: string) => {
    applyUpdates({ [key]: value }, true);
  }, [applyUpdates]);

  const setPage = useCallback((page: number) => { applyUpdates({ page: page > 0 ? String(page) : undefined }); }, [applyUpdates]);

  const setPageSize = useCallback((size: number) => { applyUpdates({ size: String(size) }, true); }, [applyUpdates]);

  const toggleSort = useCallback((field: AdminUserSortField, multi: boolean) => {
    const current = state.sort;
    let next: AdminUserSort[];

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
      role: undefined,
      accountStatus: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      updatedFrom: undefined,
      updatedTo: undefined,
    }, true);
  }, [applyUpdates]);

  return { ...state, setSearch, setRole, setAccountStatus, setDateFilter, setPage, setPageSize, toggleSort, clearFilters };
};
