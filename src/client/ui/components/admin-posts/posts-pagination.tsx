import { useState } from 'react';
import Button from '@atlaskit/button/new';
import Pagination from '@atlaskit/pagination';
import Select, { type OptionType } from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatNumber } from '@/client/utilities/formatting';

const PAGE_SIZES = [10, 20, 50, 100];

interface PageSizeOption extends OptionType {
  value: number;
}

interface PostsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PostsPagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PostsPaginationProps) => {
  const intl = useIntl();
  const [goToPageValue, setGoToPageValue] = useState('');

  const pageCount = Math.max(totalPages, 1);
  const pages = Array.from({ length: pageCount }, (_unused, index) => index + 1);
  const pageSizeOptions: PageSizeOption[] = PAGE_SIZES.map(size => ({ label: String(size), value: size }));

  const startItem = totalElements === 0 ? 0 : (currentPage * pageSize) + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const handleGoToPage = () => {
    const parsed = Number.parseInt(goToPageValue, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= pageCount) {
      onPageChange(parsed - 1);
      setGoToPageValue('');
    }
  };

  return (
    <Flex wrap="wrap" gap={4} align="center" justify="space-between">
      <Text fontSize="sm" color="fg.subtle">
        <FormattedMessage
          id="admin.posts.pagination.summary"
          values={{
            start: formatNumber(startItem, intl.locale),
            end: formatNumber(endItem, intl.locale),
            total: formatNumber(totalElements, intl.locale),
          }}
        />
      </Text>

      <HStack gap={2}>
        <Button appearance="subtle" isDisabled={currentPage === 0} onClick={() => { onPageChange(0); }}>
          <FormattedMessage id="admin.posts.pagination.first" />
        </Button>

        <Pagination
          pages={pages}
          selectedIndex={currentPage}
          onChange={(_event, page) => { onPageChange(page - 1); }}
          max={5}
          label={intl.formatMessage({ id: 'admin.posts.pagination.navLabel' })}
        />

        <Button appearance="subtle" isDisabled={currentPage >= pageCount - 1} onClick={() => { onPageChange(pageCount - 1); }}>
          <FormattedMessage id="admin.posts.pagination.last" />
        </Button>
      </HStack>

      <HStack gap={3}>
        <HStack gap={2}>
          <Text fontSize="sm" color="fg.subtle" whiteSpace="nowrap">
            <FormattedMessage id="admin.posts.pagination.pageSize" />
          </Text>
          <Box minW="80px">
            <Select<PageSizeOption>
              inputId="admin-posts-page-size"
              options={pageSizeOptions}
              value={pageSizeOptions.find(option => option.value === pageSize)}
              onChange={(option: PageSizeOption | null) => { if (option) onPageSizeChange(option.value); }}
              isSearchable={false}
              spacing="compact"
              aria-label={intl.formatMessage({ id: 'admin.posts.pagination.pageSize' })}
            />
          </Box>
        </HStack>

        <HStack gap={2}>
          <Box minW="80px">
            <Textfield
              type="number"
              min={1}
              max={pageCount}
              value={goToPageValue}
              onChange={event => { setGoToPageValue(event.currentTarget.value); }}
              onKeyDown={event => { if (event.key === 'Enter') handleGoToPage(); }}
              placeholder={intl.formatMessage({ id: 'admin.posts.pagination.goToPage' })}
              aria-label={intl.formatMessage({ id: 'admin.posts.pagination.goToPage' })}
              isCompact
            />
          </Box>
          <Button appearance="subtle" isDisabled={!goToPageValue} onClick={handleGoToPage}>
            <FormattedMessage id="admin.posts.pagination.go" />
          </Button>
        </HStack>
      </HStack>
    </Flex>
  );
};
