import { useNavigate } from 'react-router';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDeletePost } from '@/client/hooks/api/use-delete-post';
import { extractPlainTextPreview } from '@/client/utilities/tiptap';
import { formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import { ROUTES } from '@/client/utilities/constants';
import type { PostResponseDto } from '@/client/api/types';

interface DraftListItemProps {
  post: PostResponseDto;
}

export const DraftListItem = ({ post }: DraftListItemProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const deletePost = useDeletePost();

  const preview = extractPlainTextPreview(post.content);

  const handleDelete = () => {
    if (!window.confirm(intl.formatMessage({ id: 'post.deleteConfirm' }))) return;
    deletePost.mutate(post.id);
  };

  return (
    <Box p={4} bg="bg.panel" border="1px solid" borderColor="border" borderRadius="xl" boxShadow="card">
      <HStack align="start" gap={3}>
        <VStack align="stretch" gap={1} flex={1} minW={0}>
          {post.title && (
            <Text color="fg" fontSize="lg" fontWeight="600">
              {post.title}
            </Text>
          )}
          <Text color="fg.muted" fontSize="sm">
            {preview || intl.formatMessage({ id: 'profile.draftEmptyPreview' })}
          </Text>
          <Text color="fg.subtle" fontSize="xs">
            <FormattedMessage id="profile.draftLastEdited" values={{ date: formatRelativeTime(parseServerDate(post.createdAt), intl.locale) }} />
          </Text>
        </VStack>

        <HStack gap={1}>
          <IconButton
            aria-label={intl.formatMessage({ id: 'profile.draftEdit' })}
            size="sm"
            variant="ghost"
            onClick={() => { void navigate(`${ROUTES.CREATE}?id=${post.id}`); }}
          >
            <LuPencil size={16} />
          </IconButton>
          <IconButton
            aria-label={intl.formatMessage({ id: 'post.delete' })}
            size="sm"
            variant="ghost"
            color="fg.error"
            loading={deletePost.isPending}
            onClick={handleDelete}
          >
            <LuTrash2 size={16} />
          </IconButton>
        </HStack>
      </HStack>
    </Box>
  );
};
