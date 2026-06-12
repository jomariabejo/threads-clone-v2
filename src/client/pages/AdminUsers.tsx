import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Box, Center, Heading, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAdminUsers } from '@/client/hooks/api/use-admin-users';
import { useAdminUsersUrlState } from '@/client/hooks/use-admin-users-url-state';
import { useUpdateUserRole } from '@/client/hooks/api/use-update-user-role';
import { useUpdateAccountStatus } from '@/client/hooks/api/use-update-account-status';
import { useResetPassword } from '@/client/hooks/api/use-reset-password';
import { PageMeta } from '@/client/ui/components/page-meta';
import { UsersToolbar } from '@/client/ui/components/admin-users/users-toolbar';
import { UsersTable } from '@/client/ui/components/admin-users/users-table';
import { UsersPagination } from '@/client/ui/components/admin-users/users-pagination';
import { ResetPasswordDialog, type ResetPasswordTarget } from '@/client/ui/components/admin-users/reset-password-dialog';
import { ViewUserDialog } from '@/client/ui/components/admin-users/view-user-dialog';
import { toaster } from '@/client/ui/components/toaster';
import { type RootState } from '@/client/redux/store';
import type { AdminUserDto } from '@/client/api/types';

const AdminUsers = () => {
  const intl = useIntl();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const urlState = useAdminUsersUrlState();
  const [resetTarget, setResetTarget] = useState<ResetPasswordTarget | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUserDto | null>(null);

  const { data, isLoading, isFetching, isError } = useAdminUsers({
    page: urlState.page,
    size: urlState.size,
    search: urlState.search || undefined,
    role: urlState.role || undefined,
    accountStatus: urlState.accountStatus || undefined,
    createdFrom: urlState.createdFrom || undefined,
    createdTo: urlState.createdTo || undefined,
    updatedFrom: urlState.updatedFrom || undefined,
    updatedTo: urlState.updatedTo || undefined,
    sort: urlState.sort,
  });

  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateAccountStatus();
  const resetPassword = useResetPassword();

  const handleApiError = (error: unknown, fallbackId: string) => {
    const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
      ? error.response.data.message
      : intl.formatMessage({ id: fallbackId });
    toaster.create({ type: 'error', title: message });
  };

  const handleToggleRole = (user: AdminUserDto) => {
    const role = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    updateRole.mutate({ userId: user.id, role }, { onError: error => { handleApiError(error, 'admin.users.actionError'); } });
  };

  const handleToggleStatus = (user: AdminUserDto) => {
    const accountStatus = user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    updateStatus.mutate({ userId: user.id, accountStatus }, { onError: error => { handleApiError(error, 'admin.users.actionError'); } });
  };

  const handleResetPassword = (user: AdminUserDto) => {
    if (!window.confirm(intl.formatMessage({ id: 'admin.users.resetPasswordConfirm' }, { username: user.username }))) return;

    resetPassword.mutate(user.id, {
      onSuccess: response => { setResetTarget({ username: user.username, password: response.temporaryPassword }); },
      onError: error => { handleApiError(error, 'admin.users.actionError'); },
    });
  };

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'admin.users.pageTitle' })}
        description={intl.formatMessage({ id: 'admin.users.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <Heading size="xl" color="brand.800">
          <FormattedMessage id="admin.users.heading" />
        </Heading>

        <UsersToolbar urlState={urlState} />

        {isError && (
          <Center py={20}>
            <Text color="fg.error">
              <FormattedMessage id="admin.users.loadError" />
            </Text>
          </Center>
        )}

        {!isError && (
          <>
            <Box overflowX="auto">
              <UsersTable
                users={data?.content ?? []}
                isLoading={isLoading || isFetching}
                sort={urlState.sort}
                currentUserId={currentUserId}
                onToggleSort={urlState.toggleSort}
                onViewUser={setViewTarget}
                onToggleRole={handleToggleRole}
                onToggleStatus={handleToggleStatus}
                onResetPassword={handleResetPassword}
              />
            </Box>

            {data && data.content.length > 0 && (
              <UsersPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                pageSize={data.pageSize}
                onPageChange={urlState.setPage}
                onPageSizeChange={urlState.setPageSize}
              />
            )}
          </>
        )}
      </VStack>

      <ResetPasswordDialog target={resetTarget} onClose={() => { setResetTarget(null); }} />
      <ViewUserDialog user={viewTarget} onClose={() => { setViewTarget(null); }} />
    </>
  );
};

export default AdminUsers;
