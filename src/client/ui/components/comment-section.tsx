import { useState, type SubmitEvent } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, Center, HStack, IconButton, Input, Menu, Portal, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from '@/client/hooks/api/use-comments';
import { useCommentTyping } from '@/client/hooks/use-comment-typing';
import { formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import { type RootState } from '@/client/redux/store';
import type { CommentResponseDto } from '@/client/api/types';
import { ThreadLine } from './thread-line';
import { TypingIndicator } from './typing-indicator';
import { UserAvatar } from './user-avatar';

interface CommentSectionProps {
  postId: number;
}

const COMMENT_AVATAR_SIZE = 28;

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const intl = useIntl();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const { typingCount, notifyTyping, stopTyping } = useCommentTyping(postId);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    stopTyping();
    createComment.mutate(text, { onSuccess: () => { setNewComment(''); } });
  };

  const startEdit = (comment: CommentResponseDto) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = () => {
    const text = editText.trim();
    if (!editingId || !text) return;
    updateComment.mutate({ id: editingId, text }, { onSuccess: cancelEdit });
  };

  const handleDelete = (commentId: number) => {
    if (!window.confirm(intl.formatMessage({ id: 'comments.deleteConfirm' }))) return;
    deleteComment.mutate(commentId);
  };

  return (
    <VStack gap={3} align="stretch" pt={2}>
      <Box as="form" onSubmit={handleSubmit}>
        <HStack align="center" gap={3}>
          <UserAvatar
            name={currentUser?.name ?? currentUser?.username ?? '?'}
            src={getMediaUrl(currentUser?.profileImageUrl)}
            size={36}
          />
          <HStack flex={1} gap={2}>
            <Input
              flex={1}
              value={newComment}
              onChange={event => { setNewComment(event.target.value); notifyTyping(event.target.value); }}
              placeholder={intl.formatMessage({ id: 'comments.placeholder' })}
              size="sm"
              borderRadius="full"
            />
            <Button type="submit" variant="solid" size="sm" loading={createComment.isPending} disabled={!newComment.trim()}>
              <FormattedMessage id="comments.submit" />
            </Button>
          </HStack>
        </HStack>
      </Box>

      <TypingIndicator count={typingCount} />

      {isLoading && (
        <Center py={3}>
          <Spinner size="sm" color="brand.800" />
        </Center>
      )}

      {!isLoading && (!comments || comments.length === 0) && (
        <Text color="fg.subtle" fontSize="xs" textAlign="center" py={2}>
          <FormattedMessage id="comments.empty" />
        </Text>
      )}

      {!isLoading && comments && comments.length > 0 && (
        <VStack gap={0} align="stretch">
          {comments.map((comment, index) => {
            const isOwn = currentUser?.id === comment.author.id;
            const isEditing = editingId === comment.id;

            return (
              <Box key={comment.id} py={2.5}>
                <HStack align="start" gap={3}>
                  <VStack align="center" gap={0} flexShrink={0}>
                    <UserAvatar name={comment.author.name} src={getMediaUrl(comment.author.profileImageUrl)} size={COMMENT_AVATAR_SIZE} />
                    {index < comments.length - 1 && (
                      <Box mt={2}>
                        <ThreadLine height="100%" />
                      </Box>
                    )}
                  </VStack>

                  <VStack align="stretch" gap={0.5} flex={1}>
                    <HStack gap={2} align="baseline" justify="space-between">
                      <HStack gap={2} align="baseline">
                        <Text color="fg" fontWeight="600" fontSize="sm">
                          {comment.author.username}
                        </Text>
                        <Text color="fg.subtle" fontSize="xs" fontWeight="400">
                          {formatRelativeTime(parseServerDate(comment.createdAt), intl.locale)}
                        </Text>
                      </HStack>
                      {isOwn && !isEditing && (
                        <Menu.Root>
                          <Menu.Trigger asChild>
                            <IconButton
                              aria-label={intl.formatMessage({ id: 'comments.moreOptions' })}
                              size="xs"
                              variant="ghost"
                              color="fg.subtle"
                              borderRadius="full"
                            >
                              <LuEllipsis size={14} />
                            </IconButton>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content>
                                <Menu.Item value="edit" onClick={() => { startEdit(comment); }}>
                                  <LuPencil size={14} />
                                  <FormattedMessage id="comments.edit" />
                                </Menu.Item>
                                <Menu.Item value="delete" color="fg.error" onClick={() => { handleDelete(comment.id); }}>
                                  <LuTrash2 size={14} />
                                  <FormattedMessage id="comments.delete" />
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      )}
                    </HStack>

                    {isEditing ? (
                      <VStack align="stretch" gap={2} pt={1}>
                        <Input value={editText} onChange={event => { setEditText(event.target.value); }} size="sm" autoFocus />
                        <HStack gap={2} justify="flex-end">
                          <Button size="xs" variant="ghost" onClick={cancelEdit} disabled={updateComment.isPending}>
                            <FormattedMessage id="comments.cancel" />
                          </Button>
                          <Button size="xs" variant="solid" onClick={saveEdit} loading={updateComment.isPending} disabled={!editText.trim()}>
                            <FormattedMessage id="comments.save" />
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text color="fg.muted" fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.5">
                        {comment.text}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};
