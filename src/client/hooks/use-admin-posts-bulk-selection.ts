import { useState } from 'react';
import axios from 'axios';
import { useIntl } from 'react-intl';
import { useDeleteAdminPostsBulk } from './api/use-delete-admin-posts-bulk';
import { useUpdateAdminPostsStatusBulk } from './api/use-update-admin-posts-status-bulk';
import { toaster } from '@/client/ui/components/toaster';
import type { PostStatus } from '@/client/api/types';

export const useAdminPostsBulkSelection = (pageIds: number[], urlStateKey: string) => {
  const intl = useIntl();
  const deletePostsBulk = useDeleteAdminPostsBulk();
  const updateStatusBulk = useUpdateAdminPostsStatusBulk();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [prevUrlStateKey, setPrevUrlStateKey] = useState(() => urlStateKey);

  if (urlStateKey !== prevUrlStateKey) {
    setPrevUrlStateKey(urlStateKey);
    setSelectedIds(new Set());
  }

  const onToggleSelect = (postId: number) => {
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  const onToggleSelectAll = () => {
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(pageIds));
  };

  const onDelete = () => {
    const count = selectedIds.size;
    if (!globalThis.confirm(intl.formatMessage({ id: 'admin.posts.bulk.deleteConfirm' }, { count }))) return;

    deletePostsBulk.mutate(Array.from(selectedIds), {
      onSuccess: () => { setSelectedIds(new Set()); },
      onError: error => {
        const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
          ? error.response.data.message
          : intl.formatMessage({ id: 'admin.posts.bulk.deleteError' });
        toaster.create({ type: 'error', title: message });
      },
    });
  };

  const onSetStatus = (status: PostStatus) => {
    updateStatusBulk.mutate({ ids: Array.from(selectedIds), status }, {
      onSuccess: () => { setSelectedIds(new Set()); },
      onError: error => {
        const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
          ? error.response.data.message
          : intl.formatMessage({ id: 'admin.posts.bulk.statusError' });
        toaster.create({ type: 'error', title: message });
      },
    });
  };

  return {
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onClear: () => { setSelectedIds(new Set()); },
    onDelete,
    onSetStatus,
    isDeleting: deletePostsBulk.isPending,
    isUpdatingStatus: updateStatusBulk.isPending,
  };
};
