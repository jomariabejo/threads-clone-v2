import Button from '@atlaskit/button/new';
import { HStack, Text } from '@chakra-ui/react';
import { FormattedMessage } from 'react-intl';
import type { PostStatus } from '@/client/api/types';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onSetStatus: (status: PostStatus) => void;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
}

export const BulkActionBar = ({ selectedCount, onClear, onDelete, onSetStatus, isDeleting, isUpdatingStatus }: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  const isBusy = isDeleting || isUpdatingStatus;

  return (
    <HStack
      justify="space-between"
      wrap="wrap"
      gap={3}
      p={3}
      borderRadius="lg"
      bg="brand.50"
      border="1px solid"
      borderColor="brand.100"
    >
      <Text fontWeight="600" fontSize="sm">
        <FormattedMessage id="admin.posts.bulk.selectedCount" values={{ count: selectedCount }} />
      </Text>

      <HStack gap={2}>
        <Button appearance="subtle" onClick={() => { onSetStatus('PUBLISHED'); }} isDisabled={isBusy}>
          <FormattedMessage id="admin.posts.bulk.setPublished" />
        </Button>
        <Button appearance="subtle" onClick={() => { onSetStatus('DRAFT'); }} isDisabled={isBusy}>
          <FormattedMessage id="admin.posts.bulk.setDraft" />
        </Button>
        <Button appearance="danger" onClick={onDelete} isDisabled={isBusy}>
          <FormattedMessage id="admin.posts.bulk.delete" />
        </Button>
        <Button appearance="subtle" onClick={onClear} isDisabled={isBusy}>
          <FormattedMessage id="admin.posts.bulk.clearSelection" />
        </Button>
      </HStack>
    </HStack>
  );
};
