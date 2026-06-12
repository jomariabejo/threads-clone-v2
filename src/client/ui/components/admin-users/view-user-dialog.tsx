import { useState } from 'react';
import Lozenge from '@atlaskit/lozenge';
import { Badge, Box, Button, Center, Dialog, Flex, HStack, Portal, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuHeart, LuMessageCircle } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useAdminUserPosts } from '@/client/hooks/api/use-admin-user-posts';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { extractPlainTextPreview } from '@/client/utilities/tiptap';
import { formatDate, formatNumber, parseServerDate } from '@/client/utilities/formatting';
import type { AdminUserDto, PostResponseDto } from '@/client/api/types';

const AVATAR_SIZE = 64;

interface ViewUserDialogProps {
  user: AdminUserDto | null;
  onClose: () => void;
}

const DetailRow = ({ labelId, value }: { labelId: string; value: string }) => (
  <Flex justify="space-between" gap={4}>
    <Text fontSize="sm" color="fg.subtle"><FormattedMessage id={labelId} /></Text>
    <Text fontSize="sm" fontWeight="600">{value}</Text>
  </Flex>
);

const PostPreviewItem = ({ post }: { post: PostResponseDto }) => {
  const intl = useIntl();
  const preview = extractPlainTextPreview(post.content);

  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <Flex justify="space-between" align="flex-start" gap={2} mb={1}>
        {post.title && <Text fontWeight="600" fontSize="sm">{post.title}</Text>}
        <HStack gap={1} flexShrink={0}>
          <Badge colorPalette={post.visibility === 'PRIVATE' ? 'purple' : 'gray'}>{post.visibility}</Badge>
          <Badge colorPalette={post.status === 'DRAFT' ? 'orange' : 'green'}>{post.status}</Badge>
        </HStack>
      </Flex>
      {preview && <Text fontSize="sm" color="fg.subtle" mb={2}>{preview}</Text>}
      <HStack gap={3} fontSize="xs" color="fg.subtle">
        <Text>{formatDate(parseServerDate(post.createdAt), intl.locale)}</Text>
        <HStack gap={1}>
          <LuHeart size={14} />
          <Text>{formatNumber(post.likesCount, intl.locale)}</Text>
        </HStack>
        <HStack gap={1}>
          <LuMessageCircle size={14} />
          <Text>{formatNumber(post.commentsCount, intl.locale)}</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

const UserPostsSection = ({ userId }: { userId: number }) => {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useAdminUserPosts(userId, page);

  return (
    <VStack align="stretch" gap={3}>
      <Text fontWeight="600">
        <FormattedMessage id="admin.users.viewUserDialog.postsHeading" />
      </Text>

      {isLoading && (
        <Center py={6}>
          <Spinner size="md" color="brand.800" />
        </Center>
      )}

      {isError && (
        <Text fontSize="sm" color="fg.error">
          <FormattedMessage id="admin.users.viewUserDialog.postsLoadError" />
        </Text>
      )}

      {!isLoading && !isError && data && (
        data.content.length === 0 ? (
          <Text fontSize="sm" color="fg.subtle">
            <FormattedMessage id="admin.users.viewUserDialog.postsEmpty" />
          </Text>
        ) : (
          <>
            <VStack align="stretch" gap={2}>
              {data.content.map(post => <PostPreviewItem key={post.id} post={post} />)}
            </VStack>

            {data.totalPages > 1 && (
              <HStack justify="space-between">
                <Button size="sm" variant="outline" disabled={data.currentPage === 0} onClick={() => { setPage(current => current - 1); }}>
                  <FormattedMessage id="admin.pagination.previous" />
                </Button>
                <Text fontSize="sm" color="fg.subtle">
                  <FormattedMessage id="admin.pagination.pageInfo" values={{ page: data.currentPage + 1, totalPages: Math.max(data.totalPages, 1) }} />
                </Text>
                <Button size="sm" variant="outline" disabled={data.currentPage >= data.totalPages - 1} onClick={() => { setPage(current => current + 1); }}>
                  <FormattedMessage id="admin.pagination.next" />
                </Button>
              </HStack>
            )}
          </>
        )
      )}
    </VStack>
  );
};

export const ViewUserDialog = ({ user, onClose }: ViewUserDialogProps) => {
  const intl = useIntl();

  return (
    <Dialog.Root open={user !== null} onOpenChange={details => { if (!details.open) onClose(); }} size="lg" scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                <FormattedMessage id="admin.users.viewUserDialog.title" />
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {user && (
                <VStack align="stretch" gap={4}>
                  <HStack gap={3}>
                    <UserAvatar name={user.name} src={getMediaUrl(user.profileImagePath)} size={AVATAR_SIZE} />
                    <VStack align="start" gap={1}>
                      <Text fontWeight="700" fontSize="lg">{user.name}</Text>
                      <Text color="fg.subtle" fontSize="sm">@{user.username}</Text>
                      <HStack gap={2}>
                        <Lozenge appearance={user.role === 'ADMIN' ? 'moved' : 'default'}>
                          {intl.formatMessage({ id: `admin.users.role.${user.role}` })}
                        </Lozenge>
                        <Lozenge appearance={user.accountStatus === 'ACTIVE' ? 'success' : 'removed'}>
                          {intl.formatMessage({ id: `admin.users.status.${user.accountStatus}` })}
                        </Lozenge>
                      </HStack>
                    </VStack>
                  </HStack>

                  <VStack align="stretch" gap={2} borderWidth="1px" borderRadius="md" p={3}>
                    <DetailRow labelId="admin.users.viewUserDialog.fieldId" value={String(user.id)} />
                    <DetailRow labelId="admin.users.viewUserDialog.fieldEmail" value={user.email} />
                    <DetailRow labelId="admin.users.viewUserDialog.fieldJoined" value={formatDate(parseServerDate(user.createdAt), intl.locale)} />
                    <DetailRow labelId="admin.users.viewUserDialog.fieldUpdated" value={formatDate(parseServerDate(user.updatedAt), intl.locale)} />
                  </VStack>

                  <UserPostsSection userId={user.id} />
                </VStack>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="solid" colorPalette="brand">
                  <FormattedMessage id="admin.users.viewUserDialog.close" />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
