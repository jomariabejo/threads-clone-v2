import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Box, Button, chakra, HStack, IconButton, Image, Menu, Portal, Text, VStack } from '@chakra-ui/react';
import { LuEllipsis, LuHeart, LuLock, LuMessageCircle, LuPencil, LuTrash2 } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useDeletePost } from '@/client/hooks/api/use-delete-post';
import { useToggleLike } from '@/client/hooks/api/use-toggle-like';
import { formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import { ROUTES, postDetailPath, profileUserPath } from '@/client/utilities/constants';
import { type RootState } from '@/client/redux/store';
import type { PostResponseDto } from '@/client/api/types';
import { CommentSection } from './comment-section';
import { Link } from './link';
import { MediaViewer } from './media-viewer';
import { PostContent } from './post-content';
import { ThreadLine } from './thread-line';
import { UserAvatar } from './user-avatar';

interface PostCardProps {
  post: PostResponseDto;
  truncate?: boolean;
}

const SINGLE_FILE_ASPECT_RATIO = '66.67%';
const GRID_TILE_HEIGHT = '160px';
const FEATURED_TILE_HEIGHT = '220px';
const MAX_GRID_TILES = 4;

export const PostCard = ({ post, truncate = true }: PostCardProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [showComments, setShowComments] = useState(!truncate);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);

  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();

  const isOwnPost = currentUserId === post.author.id;
  const profilePath = isOwnPost ? ROUTES.PROFILE : profileUserPath(post.author.id);

  const handleDelete = () => {
    if (!window.confirm(intl.formatMessage({ id: 'post.deleteConfirm' }))) return;
    deletePost.mutate(post.id);
  };

  const handleEdit = () => {
    navigate(`${ROUTES.CREATE}?id=${post.id}`);
  };

  const handleSeeMore = () => {
    navigate(postDetailPath(post.id));
  };

  const { files } = post;

  return (
    <Box
      p={4}
      bg="bg.panel"
      border="1px solid"
      borderColor="border"
      borderRadius="xl"
      boxShadow="card"
      transition="box-shadow 0.2s"
      _hover={{ boxShadow: 'cardHover' }}
    >
      <HStack align="start" gap={3}>
        <VStack align="center" gap={0} flexShrink={0}>
          <Link to={profilePath}>
            <UserAvatar name={post.author.name} src={getMediaUrl(post.author.profileImageUrl)} size={36} />
          </Link>
          {showComments && (
            <Box mt={2}>
              <ThreadLine height="100%" />
            </Box>
          )}
        </VStack>

        <VStack align="stretch" gap={2} flex={1} minW={0}>
          <HStack justify="space-between" align="start">
            <HStack gap={2} align="baseline">
              <Link to={profilePath}>
                <Text color="fg" fontWeight="600" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                  {post.author.username}
                </Text>
              </Link>
              {post.visibility === 'PRIVATE' && isOwnPost && (
                <LuLock size={14} aria-label={intl.formatMessage({ id: 'post.private' })} />
              )}
              <Text color="fg.subtle" fontSize="xs" fontWeight="400">
                {formatRelativeTime(parseServerDate(post.createdAt), intl.locale)}
              </Text>
            </HStack>

            {isOwnPost && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton aria-label={intl.formatMessage({ id: 'post.moreOptions' })} size="xs" variant="ghost" color="fg.subtle" borderRadius="full">
                    <LuEllipsis size={18} />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value="edit" onClick={handleEdit}>
                        <LuPencil size={15} />
                        <FormattedMessage id="post.edit" />
                      </Menu.Item>
                      <Menu.Item value="delete" color="fg.error" onClick={handleDelete}>
                        <LuTrash2 size={15} />
                        <FormattedMessage id="post.delete" />
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </HStack>

          {post.title && (
            <Text color="fg" fontSize="lg" fontWeight="600">
              {post.title}
            </Text>
          )}

          <Box position="relative">
            <PostContent
              content={post.content}
              clamp={truncate}
              onOverflowChange={truncate ? setIsContentOverflowing : undefined}
            />

            {truncate && isContentOverflowing && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="60px"
                bgGradient="to-t"
                gradientFrom="bg.panel"
                gradientTo="transparent"
                pointerEvents="none"
              />
            )}
          </Box>

          {truncate && isContentOverflowing && (
            <Button
              variant="ghost"
              size="sm"
              color="brand.700"
              fontWeight="600"
              alignSelf="flex-start"
              px={0}
              minW="auto"
              h="auto"
              py={0.5}
              onClick={handleSeeMore}
            >
              <FormattedMessage id="post.seeMore" />
            </Button>
          )}

          {files.length > 0 && (
            <Box pt={2}>
              {files.length === 1 ? (
                <Box borderRadius="lg" overflow="hidden" cursor="pointer" position="relative" role="group" onClick={() => { setViewerIndex(0); }}>
                  {files[0].fileType === 'IMAGE' ? (
                    <Box position="relative" w="100%" h="0" pb={SINGLE_FILE_ASPECT_RATIO} bg="bg.muted" borderRadius="lg" overflow="hidden">
                      <Image
                        src={getMediaUrl(files[0].url)}
                        alt="Post attachment"
                        position="absolute"
                        inset={0}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        loading="lazy"
                      />
                    </Box>
                  ) : (
                    <chakra.video
                      src={getMediaUrl(files[0].url)}
                      w="100%"
                      maxH="400px"
                      borderRadius="lg"
                      objectFit="cover"
                      bg="black"
                      muted
                    />
                  )}
                </Box>
              ) : (
                <Box display="grid" gridTemplateColumns={files.length === 2 ? '1fr 1fr' : 'repeat(2, 1fr)'} gap={1} borderRadius="lg" overflow="hidden">
                  {files.slice(0, MAX_GRID_TILES).map((file, idx) => (
                    <Box
                      key={file.id}
                      position="relative"
                      cursor="pointer"
                      onClick={() => { setViewerIndex(idx); }}
                      gridColumn={files.length === 3 && idx === 0 ? 'span 2' : undefined}
                      h={files.length === 3 && idx === 0 ? FEATURED_TILE_HEIGHT : GRID_TILE_HEIGHT}
                      overflow="hidden"
                    >
                      {file.fileType === 'IMAGE' ? (
                        <Image src={getMediaUrl(file.url)} alt="Post attachment" w="100%" h="100%" objectFit="cover" loading="lazy" />
                      ) : (
                        <chakra.video src={getMediaUrl(file.url)} w="100%" h="100%" objectFit="cover" bg="black" muted />
                      )}

                      {idx === MAX_GRID_TILES - 1 && files.length > MAX_GRID_TILES && (
                        <Box position="absolute" inset={0} bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center">
                          <Text color="white" fontSize="xl" fontWeight="700">
                            +{files.length - MAX_GRID_TILES}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {viewerIndex !== null && (
                <MediaViewer files={files} currentIndex={viewerIndex} onClose={() => { setViewerIndex(null); }} onIndexChange={setViewerIndex} />
              )}
            </Box>
          )}

          <HStack gap={4} pt={2}>
            <Button
              variant="ghost"
              size="sm"
              color={post.liked ? 'accent.red' : 'fg.muted'}
              onClick={() => { toggleLike.mutate(post.id); }}
              loading={toggleLike.isPending}
              borderRadius="full"
              px={3}
            >
              <LuHeart size={18} fill={post.liked ? 'currentColor' : 'none'} />
              {post.likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              color="fg.muted"
              onClick={truncate ? () => { setShowComments(value => !value); } : undefined}
              borderRadius="full"
              px={3}
              cursor={truncate ? 'pointer' : 'default'}
            >
              <LuMessageCircle size={18} />
              {post.commentsCount}
            </Button>
          </HStack>

          {showComments && (
            <Box pt={4}>
              <CommentSection postId={post.id} />
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};
