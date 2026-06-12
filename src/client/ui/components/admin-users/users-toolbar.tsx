import { useEffect, useState } from 'react';
import { type OptionType } from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import { Box, Flex } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';
import { useIntl } from 'react-intl';
import { ClearFiltersButton, DateFilterField, SelectFilterField } from '@/client/ui/components/admin-shared/filter-controls';
import type { AccountStatus, UserRole } from '@/client/api/types';
import type { useAdminUsersUrlState } from '@/client/hooks/use-admin-users-url-state';

const SEARCH_DEBOUNCE_MS = 400;

const USER_ROLES: UserRole[] = ['USER', 'ADMIN'];
const ACCOUNT_STATUSES: AccountStatus[] = ['ACTIVE', 'SUSPENDED'];

interface RoleOption extends OptionType {
  value: UserRole | '';
}

interface StatusOption extends OptionType {
  value: AccountStatus | '';
}

interface UsersToolbarProps {
  urlState: ReturnType<typeof useAdminUsersUrlState>;
}

export const UsersToolbar = ({ urlState }: UsersToolbarProps) => {
  const intl = useIntl();
  const [searchInput, setSearchInput] = useState(urlState.search);
  const [syncedSearch, setSyncedSearch] = useState(urlState.search);

  if (urlState.search !== syncedSearch) {
    setSyncedSearch(urlState.search);
    setSearchInput(urlState.search);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      urlState.setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => { clearTimeout(timeout); };
  }, [searchInput, urlState]);

  const roleOptions: RoleOption[] = [
    { label: intl.formatMessage({ id: 'admin.users.filters.allRoles' }), value: '' },
    ...USER_ROLES.map(role => ({ label: intl.formatMessage({ id: `admin.users.role.${role}` }), value: role })),
  ];

  const statusOptions: StatusOption[] = [
    { label: intl.formatMessage({ id: 'admin.users.filters.allStatuses' }), value: '' },
    ...ACCOUNT_STATUSES.map(status => ({ label: intl.formatMessage({ id: `admin.users.status.${status}` }), value: status })),
  ];

  return (
    <Flex direction="column" gap={4}>
      <Box position="relative">
        <Textfield
          value={searchInput}
          onChange={event => { setSearchInput(event.currentTarget.value); }}
          placeholder={intl.formatMessage({ id: 'admin.users.searchPlaceholder' })}
          aria-label={intl.formatMessage({ id: 'admin.users.searchPlaceholder' })}
          elemBeforeInput={(
            <Box pl={2} color="fg.subtle" display="flex" alignItems="center">
              <LuSearch size={18} />
            </Box>
          )}
          elemAfterInput={searchInput ? (
            <Box
              as="button"
              onClick={() => { setSearchInput(''); }}
              pr={2}
              color="fg.subtle"
              display="flex"
              alignItems="center"
              _hover={{ color: 'fg' }}
              aria-label={intl.formatMessage({ id: 'admin.users.filters.clearSearch' })}
            >
              <LuX size={16} />
            </Box>
          ) : undefined}
        />
      </Box>

      <Flex wrap="wrap" gap={3} align="flex-end">
        <SelectFilterField<RoleOption>
          labelId="admin.users.filters.role"
          inputId="admin-users-role-filter"
          options={roleOptions}
          value={roleOptions.find(option => option.value === urlState.role)}
          onChange={option => { urlState.setRole(option?.value ?? ''); }}
        />

        <SelectFilterField<StatusOption>
          labelId="admin.users.filters.status"
          inputId="admin-users-status-filter"
          options={statusOptions}
          value={statusOptions.find(option => option.value === urlState.accountStatus)}
          onChange={option => { urlState.setAccountStatus(option?.value ?? ''); }}
        />

        <DateFilterField
          labelId="admin.users.filters.createdFrom"
          value={urlState.createdFrom}
          onChange={value => { urlState.setDateFilter('createdFrom', value); }}
          maxDate={urlState.createdTo || undefined}
        />

        <DateFilterField
          labelId="admin.users.filters.createdTo"
          value={urlState.createdTo}
          onChange={value => { urlState.setDateFilter('createdTo', value); }}
          minDate={urlState.createdFrom || undefined}
        />

        <DateFilterField
          labelId="admin.users.filters.updatedFrom"
          value={urlState.updatedFrom}
          onChange={value => { urlState.setDateFilter('updatedFrom', value); }}
          maxDate={urlState.updatedTo || undefined}
        />

        <DateFilterField
          labelId="admin.users.filters.updatedTo"
          value={urlState.updatedTo}
          onChange={value => { urlState.setDateFilter('updatedTo', value); }}
          minDate={urlState.updatedFrom || undefined}
        />

        <ClearFiltersButton labelId="admin.users.filters.clear" isDisabled={!urlState.hasActiveFilters} onClick={() => { urlState.clearFilters(); }} />
      </Flex>
    </Flex>
  );
};
