import { useEffect, useState } from 'react';
import { type OptionType } from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import { Box, Flex } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';
import { useIntl } from 'react-intl';
import { ClearFiltersButton, DateFilterField, SelectFilterField } from '@/client/ui/components/admin-shared/filter-controls';
import type { PostStatus, Visibility } from '@/client/api/types';
import type { useAdminPostsUrlState } from '@/client/hooks/use-admin-posts-url-state';

const SEARCH_DEBOUNCE_MS = 400;

const VISIBILITIES: Visibility[] = ['PUBLIC', 'PRIVATE'];
const POST_STATUSES: PostStatus[] = ['DRAFT', 'PUBLISHED'];

interface VisibilityOption extends OptionType {
  value: Visibility | '';
}

interface StatusOption extends OptionType {
  value: PostStatus | '';
}

interface PostsToolbarProps {
  urlState: ReturnType<typeof useAdminPostsUrlState>;
}

export const PostsToolbar = ({ urlState }: PostsToolbarProps) => {
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

  const visibilityOptions: VisibilityOption[] = [
    { label: intl.formatMessage({ id: 'admin.posts.filters.allVisibilities' }), value: '' },
    ...VISIBILITIES.map(visibility => ({ label: intl.formatMessage({ id: `admin.posts.visibility.${visibility}` }), value: visibility })),
  ];

  const statusOptions: StatusOption[] = [
    { label: intl.formatMessage({ id: 'admin.posts.filters.allStatuses' }), value: '' },
    ...POST_STATUSES.map(status => ({ label: intl.formatMessage({ id: `admin.posts.status.${status}` }), value: status })),
  ];

  return (
    <Flex direction="column" gap={4}>
      <Box position="relative">
        <Textfield
          value={searchInput}
          onChange={event => { setSearchInput(event.currentTarget.value); }}
          placeholder={intl.formatMessage({ id: 'admin.posts.searchPlaceholder' })}
          aria-label={intl.formatMessage({ id: 'admin.posts.searchPlaceholder' })}
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
              aria-label={intl.formatMessage({ id: 'admin.posts.filters.clearSearch' })}
            >
              <LuX size={16} />
            </Box>
          ) : undefined}
        />
      </Box>

      <Flex wrap="wrap" gap={3} align="flex-end">
        <SelectFilterField<VisibilityOption>
          labelId="admin.posts.filters.visibility"
          inputId="admin-posts-visibility-filter"
          options={visibilityOptions}
          value={visibilityOptions.find(option => option.value === urlState.visibility)}
          onChange={option => { urlState.setVisibility(option?.value ?? ''); }}
        />

        <SelectFilterField<StatusOption>
          labelId="admin.posts.filters.status"
          inputId="admin-posts-status-filter"
          options={statusOptions}
          value={statusOptions.find(option => option.value === urlState.status)}
          onChange={option => { urlState.setStatus(option?.value ?? ''); }}
        />

        <DateFilterField
          labelId="admin.posts.filters.createdFrom"
          value={urlState.createdFrom}
          onChange={value => { urlState.setDateFilter('createdFrom', value); }}
          maxDate={urlState.createdTo || undefined}
        />

        <DateFilterField
          labelId="admin.posts.filters.createdTo"
          value={urlState.createdTo}
          onChange={value => { urlState.setDateFilter('createdTo', value); }}
          minDate={urlState.createdFrom || undefined}
        />

        <ClearFiltersButton labelId="admin.posts.filters.clear" isDisabled={!urlState.hasActiveFilters} onClick={() => { urlState.clearFilters(); }} />
      </Flex>
    </Flex>
  );
};
