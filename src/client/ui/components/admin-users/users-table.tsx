import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import type { HeadType, RowType } from '@atlaskit/dynamic-table/types';
import EmptyState from '@atlaskit/empty-state';
import Lozenge from '@atlaskit/lozenge';
import { Box, HStack, IconButton, Menu, Portal, Text, VStack } from '@chakra-ui/react';
import { LuArrowDown, LuArrowUp, LuArrowUpDown, LuEllipsis, LuEye } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { formatDate, formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import type { AdminUserDto, AdminUserSort, AdminUserSortField } from '@/client/api/types';

const AVATAR_SIZE = 36;

interface UsersTableProps {
  users: AdminUserDto[];
  isLoading: boolean;
  sort: AdminUserSort[];
  currentUserId?: number;
  onToggleSort: (field: AdminUserSortField, multi: boolean) => void;
  onViewUser: (user: AdminUserDto) => void;
  onToggleRole: (user: AdminUserDto) => void;
  onToggleStatus: (user: AdminUserDto) => void;
  onResetPassword: (user: AdminUserDto) => void;
}

const SortIndicator = ({ entry }: { entry?: AdminUserSort }) => {
  if (!entry) return <LuArrowUpDown size={14} style={{ opacity: 0.35 }} />;
  return entry.direction === 'asc' ? <LuArrowUp size={14} /> : <LuArrowDown size={14} />;
};

interface SortableHeaderProps {
  field: AdminUserSortField;
  labelId: string;
  sort: AdminUserSort[];
  onToggleSort: (field: AdminUserSortField, multi: boolean) => void;
}

const SortableHeader = ({ field, labelId, sort, onToggleSort }: SortableHeaderProps) => {
  const sortIndex = sort.findIndex(entry => entry.field === field);
  const entry = sortIndex >= 0 ? sort[sortIndex] : undefined;

  return (
    <Box
      as="button"
      onClick={event => { onToggleSort(field, event.shiftKey); }}
      display="flex"
      alignItems="center"
      gap={1}
      fontWeight="600"
      fontSize="sm"
      color="fg"
      cursor="pointer"
      whiteSpace="nowrap"
      _hover={{ color: 'brand.800' }}
    >
      <FormattedMessage id={labelId} />
      <SortIndicator entry={entry} />
      {sort.length > 1 && entry && (
        <Text as="span" fontSize="2xs" color="fg.subtle">
          {sortIndex + 1}
        </Text>
      )}
    </Box>
  );
};

const RoleLozenge = ({ role }: { role: AdminUserDto['role'] }) => {
  const intl = useIntl();
  return (
    <Lozenge appearance={role === 'ADMIN' ? 'moved' : 'default'}>
      {intl.formatMessage({ id: `admin.users.role.${role}` })}
    </Lozenge>
  );
};

const StatusLozenge = ({ status }: { status: AdminUserDto['accountStatus'] }) => {
  const intl = useIntl();
  return (
    <Lozenge appearance={status === 'ACTIVE' ? 'success' : 'removed'}>
      {intl.formatMessage({ id: `admin.users.status.${status}` })}
    </Lozenge>
  );
};

const DateCell = ({ value }: { value: string }) => {
  const intl = useIntl();
  const date = parseServerDate(value);

  return (
    <VStack gap={0} align="start">
      <Text fontSize="sm">{formatDate(date, intl.locale)}</Text>
      <Text fontSize="xs" color="fg.subtle">{formatRelativeTime(date, intl.locale)}</Text>
    </VStack>
  );
};

interface RowActionsMenuProps {
  user: AdminUserDto;
  isSelf: boolean;
  onViewUser: (user: AdminUserDto) => void;
  onToggleRole: (user: AdminUserDto) => void;
  onToggleStatus: (user: AdminUserDto) => void;
  onResetPassword: (user: AdminUserDto) => void;
}

const RowActionsMenu = ({ user, isSelf, onViewUser, onToggleRole, onToggleStatus, onResetPassword }: RowActionsMenuProps) => {
  const intl = useIntl();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton aria-label={intl.formatMessage({ id: 'admin.users.columnActions' })} size="xs" variant="ghost">
          <LuEllipsis size={18} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="view" onClick={() => { onViewUser(user); }}>
              <HStack gap={2}>
                <LuEye size={16} />
                <FormattedMessage id="admin.users.viewUser" />
              </HStack>
            </Menu.Item>
            <Menu.Item value="role" disabled={isSelf} onClick={() => { onToggleRole(user); }}>
              <FormattedMessage id={user.role === 'ADMIN' ? 'admin.users.demote' : 'admin.users.promote'} />
            </Menu.Item>
            <Menu.Item value="status" disabled={isSelf} onClick={() => { onToggleStatus(user); }}>
              <FormattedMessage id={user.accountStatus === 'SUSPENDED' ? 'admin.users.unsuspend' : 'admin.users.suspend'} />
            </Menu.Item>
            <Menu.Item value="reset-password" onClick={() => { onResetPassword(user); }}>
              <FormattedMessage id="admin.users.resetPassword" />
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export const UsersTable = ({
  users,
  isLoading,
  sort,
  currentUserId,
  onToggleSort,
  onViewUser,
  onToggleRole,
  onToggleStatus,
  onResetPassword,
}: UsersTableProps) => {
  const intl = useIntl();

  const sortableHead = (field: AdminUserSortField, labelId: string, width: number) => ({
    key: field,
    width,
    content: <SortableHeader field={field} labelId={labelId} sort={sort} onToggleSort={onToggleSort} />,
  });

  const head: HeadType = {
    cells: [
      sortableHead('id', 'admin.users.columnId', 5),
      { key: 'avatar', width: 6, content: <FormattedMessage id="admin.users.columnAvatar" /> },
      sortableHead('name', 'admin.users.columnName', 13),
      sortableHead('username', 'admin.users.columnUsername', 11),
      sortableHead('email', 'admin.users.columnEmail', 17),
      sortableHead('userRole', 'admin.users.columnRole', 8),
      sortableHead('accountStatus', 'admin.users.columnStatus', 10),
      sortableHead('createdAt', 'admin.users.columnCreatedAt', 13),
      sortableHead('updatedAt', 'admin.users.columnUpdatedAt', 13),
      { key: 'actions', width: 4, content: <FormattedMessage id="admin.users.columnActions" /> },
    ],
  };

  const rows: RowType[] = users.map(user => ({
    key: String(user.id),
    cells: [
      { key: 'id', content: user.id },
      { key: 'avatar', content: <UserAvatar name={user.name} src={getMediaUrl(user.profileImagePath)} size={AVATAR_SIZE} /> },
      { key: 'name', content: user.name },
      { key: 'username', content: <Text fontWeight="600">{user.username}</Text> },
      { key: 'email', content: user.email },
      { key: 'role', content: <RoleLozenge role={user.role} /> },
      { key: 'status', content: <StatusLozenge status={user.accountStatus} /> },
      { key: 'createdAt', content: <DateCell value={user.createdAt} /> },
      { key: 'updatedAt', content: <DateCell value={user.updatedAt} /> },
      {
        key: 'actions',
        content: (
          <RowActionsMenu
            user={user}
            isSelf={user.id === currentUserId}
            onViewUser={onViewUser}
            onToggleRole={onToggleRole}
            onToggleStatus={onToggleStatus}
            onResetPassword={onResetPassword}
          />
        ),
      },
    ],
  }));

  return (
    <DynamicTableStateless
      head={head}
      rows={rows}
      isLoading={isLoading}
      label={intl.formatMessage({ id: 'admin.users.heading' })}
      emptyView={(
        <EmptyState
          header={intl.formatMessage({ id: 'admin.users.empty' })}
          description={intl.formatMessage({ id: 'admin.users.emptyDescription' })}
        />
      )}
    />
  );
};
