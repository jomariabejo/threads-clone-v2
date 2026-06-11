import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Badge,
  Button,
  Center,
  Clipboard,
  Dialog,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Portal,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuCheck, LuCopy, LuEllipsis, LuSearch } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAdminUsers } from '@/client/hooks/api/use-admin-users';
import { useUpdateUserRole } from '@/client/hooks/api/use-update-user-role';
import { useUpdateAccountStatus } from '@/client/hooks/api/use-update-account-status';
import { useResetPassword } from '@/client/hooks/api/use-reset-password';
import { PageMeta } from '@/client/ui/components/page-meta';
import { toaster } from '@/client/ui/components/toaster';
import { formatDate, parseServerDate } from '@/client/utilities/formatting';
import { type RootState } from '@/client/redux/store';
import type { AdminUserDto } from '@/client/api/types';

const AdminUsers = () => {
  const intl = useIntl();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [resetTarget, setResetTarget] = useState<{ username: string; password: string } | null>(null);

  const { data, isLoading, isError } = useAdminUsers(page, search);
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateAccountStatus();
  const resetPassword = useResetPassword();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

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

        <InputGroup startElement={<LuSearch size={20} />}>
          <Input
            value={search}
            onChange={event => { handleSearchChange(event.target.value); }}
            placeholder={intl.formatMessage({ id: 'admin.users.searchPlaceholder' })}
            size="lg"
            borderRadius="full"
          />
        </InputGroup>

        {isLoading && (
          <Center py={20}>
            <Spinner size="xl" color="brand.800" />
          </Center>
        )}

        {isError && (
          <Center py={20}>
            <Text color="fg.error">
              <FormattedMessage id="admin.users.loadError" />
            </Text>
          </Center>
        )}

        {!isLoading && !isError && data && (
          data.content.length === 0 ? (
            <Center py={20}>
              <Text color="fg.subtle">
                <FormattedMessage id="admin.users.empty" />
              </Text>
            </Center>
          ) : (
            <>
              <Table.ScrollArea borderWidth="1px" borderRadius="lg">
                <Table.Root size="sm" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnId" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnUsername" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnName" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnEmail" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnRole" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnStatus" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnCreatedAt" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.users.columnActions" /></Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.content.map(user => {
                      const isSelf = user.id === currentUserId;

                      return (
                        <Table.Row key={user.id}>
                          <Table.Cell>{user.id}</Table.Cell>
                          <Table.Cell fontWeight="600">{user.username}</Table.Cell>
                          <Table.Cell>{user.name}</Table.Cell>
                          <Table.Cell>{user.email}</Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={user.role === 'ADMIN' ? 'purple' : 'gray'}>{user.role}</Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge colorPalette={user.accountStatus === 'SUSPENDED' ? 'red' : 'green'}>{user.accountStatus}</Badge>
                          </Table.Cell>
                          <Table.Cell>{formatDate(parseServerDate(user.createdAt), intl.locale)}</Table.Cell>
                          <Table.Cell>
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <IconButton aria-label={intl.formatMessage({ id: 'admin.users.columnActions' })} size="xs" variant="ghost">
                                  <LuEllipsis size={18} />
                                </IconButton>
                              </Menu.Trigger>
                              <Portal>
                                <Menu.Positioner>
                                  <Menu.Content>
                                    <Menu.Item value="role" disabled={isSelf} onClick={() => { handleToggleRole(user); }}>
                                      <FormattedMessage id={user.role === 'ADMIN' ? 'admin.users.demote' : 'admin.users.promote'} />
                                    </Menu.Item>
                                    <Menu.Item value="status" disabled={isSelf} onClick={() => { handleToggleStatus(user); }}>
                                      <FormattedMessage id={user.accountStatus === 'SUSPENDED' ? 'admin.users.unsuspend' : 'admin.users.suspend'} />
                                    </Menu.Item>
                                    <Menu.Item value="reset-password" onClick={() => { handleResetPassword(user); }}>
                                      <FormattedMessage id="admin.users.resetPassword" />
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Portal>
                            </Menu.Root>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>

              <HStack justify="space-between">
                <Button variant="outline" disabled={data.first} onClick={() => { setPage(current => current - 1); }}>
                  <FormattedMessage id="admin.pagination.previous" />
                </Button>
                <Text color="fg.subtle" fontSize="sm">
                  <FormattedMessage id="admin.pagination.pageInfo" values={{ page: data.number + 1, totalPages: Math.max(data.totalPages, 1) }} />
                </Text>
                <Button variant="outline" disabled={data.last} onClick={() => { setPage(current => current + 1); }}>
                  <FormattedMessage id="admin.pagination.next" />
                </Button>
              </HStack>
            </>
          )
        )}
      </VStack>

      <Dialog.Root open={resetTarget !== null} onOpenChange={details => { if (!details.open) setResetTarget(null); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  <FormattedMessage id="admin.users.resetPasswordSuccess" values={{ username: resetTarget?.username }} />
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap={3}>
                  <Text color="fg.subtle">
                    <FormattedMessage id="admin.users.temporaryPassword" />
                  </Text>
                  <Clipboard.Root value={resetTarget?.password ?? ''}>
                    <HStack>
                      <Clipboard.Input fontFamily="mono" />
                      <Clipboard.Trigger asChild>
                        <IconButton aria-label={intl.formatMessage({ id: 'admin.users.copyPassword' })} variant="outline">
                          <Clipboard.Indicator copied={<LuCheck />}>
                            <LuCopy />
                          </Clipboard.Indicator>
                        </IconButton>
                      </Clipboard.Trigger>
                    </HStack>
                  </Clipboard.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="solid" colorPalette="brand">
                    <FormattedMessage id="admin.users.done" />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default AdminUsers;
