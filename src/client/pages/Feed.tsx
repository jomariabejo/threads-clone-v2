import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Center, HStack, Text, VStack } from '@chakra-ui/react';
import { IoImageOutline, IoVideocamOutline } from 'react-icons/io5';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { FEED_QUERY_KEY, NEW_POSTS_QUERY_KEY, useFeed, usePendingNewPosts } from '@/client/hooks/api/use-feed';
import { type FeedData } from '@/client/hooks/api/use-toggle-like';
import { FeatureErrorBoundary } from '@/client/ui/components/feature-error-boundary';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostCard } from '@/client/ui/components/post-card';
import { PostCardSkeleton } from '@/client/ui/components/post-card-skeleton';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { ROUTES } from '@/client/utilities/constants';
import { type RootState } from '@/client/redux/store';

const FEED_SKELETON_COUNT = 4;
const NEXT_PAGE_SKELETON_COUNT = 2;

const Feed = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useFeed();
  const { data: pendingPosts } = usePendingNewPosts();

  const posts = useMemo(() => {
    const all = data?.pages.flatMap(page => page.content) ?? [];
    const seen = new Set<number>();
    return all.filter(post => (seen.has(post.id) ? false : (seen.add(post.id), true)));
  }, [data]);

  const handleShowNewPosts = () => {
    queryClient.setQueryData<FeedData>(FEED_QUERY_KEY, current => {
      if (!current) return current;
      const newest = [...pendingPosts].reverse();
      const [firstPage, ...rest] = current.pages;
      return {
        ...current,
        pages: [
          { ...firstPage, content: [...newest, ...firstPage.content], totalElements: firstPage.totalElements + newest.length },
          ...rest,
        ],
      };
    });
    queryClient.setQueryData(NEW_POSTS_QUERY_KEY, []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'feed.pageTitle' })}
        description={intl.formatMessage({ id: 'feed.pageDescription' })}
      />
      <VStack gap={4} align="stretch">
        <Box
          p={4}
          bg="bg.panel"
          border="1px solid"
          borderColor="border"
          borderRadius="xl"
          boxShadow="card"
          transition="box-shadow 0.2s"
          _hover={{ boxShadow: 'cardHover' }}
          cursor="pointer"
          onClick={() => { void navigate(ROUTES.CREATE); }}
        >
          <HStack gap={3}>
            <UserAvatar name={currentUser?.name ?? currentUser?.username ?? '?'} src={getMediaUrl(currentUser?.profileImageUrl)} size={36} />
            <Box flex={1} py={2} px={4} border="1px solid" borderColor="border" borderRadius="full" color="fg.subtle" fontSize="md">
              <FormattedMessage id="feed.composerPlaceholder" />
            </Box>
          </HStack>
          <HStack gap={4} mt={3} ml="48px" pt={2} borderTop="1px solid" borderColor="border.subtle">
            <HStack gap={1.5} color="fg.muted" fontSize="sm" fontWeight="500">
              <IoImageOutline size={20} />
              <Text><FormattedMessage id="feed.composerPhoto" /></Text>
            </HStack>
            <HStack gap={1.5} color="fg.muted" fontSize="sm" fontWeight="500">
              <IoVideocamOutline size={20} />
              <Text><FormattedMessage id="feed.composerVideo" /></Text>
            </HStack>
          </HStack>
        </Box>

        {pendingPosts.length > 0 && (
          <Center position="sticky" top={2} zIndex="docked">
            <Button colorPalette="brand" borderRadius="full" boxShadow="md" onClick={handleShowNewPosts}>
              <FormattedMessage
                id={pendingPosts.length === 1 ? 'feed.newPosts.one' : 'feed.newPosts.many'}
                values={{ count: pendingPosts.length }}
              />
            </Button>
          </Center>
        )}

        {isError && (
          <Alert.Root status="error" borderRadius="lg">
            <Alert.Indicator />
            <Alert.Title>
              <FormattedMessage id="feed.loadError" />
            </Alert.Title>
          </Alert.Root>
        )}

        {isLoading && (
          <VStack gap={3} align="stretch">
            {Array.from({ length: FEED_SKELETON_COUNT }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </VStack>
        )}

        {!isLoading && posts.length === 0 && (
          <Center py={20}>
            <VStack gap={2}>
              <Text color="fg.muted" fontSize="lg" fontWeight="500">
                <FormattedMessage id="feed.empty.title" />
              </Text>
              <Text color="fg.subtle" fontSize="sm">
                <FormattedMessage id="feed.empty.subtitle" />
              </Text>
            </VStack>
          </Center>
        )}

        {!isLoading && posts.length > 0 && (
          <FeatureErrorBoundary>
            <VStack gap={3} align="stretch">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}

              {hasNextPage && !isFetchingNextPage && (
                <Center py={6}>
                  <Button variant="outline" onClick={() => { void fetchNextPage(); }}>
                    <FormattedMessage id="feed.loadMore" />
                  </Button>
                </Center>
              )}

              {isFetchingNextPage && (
                <VStack gap={3} align="stretch">
                  {Array.from({ length: NEXT_PAGE_SKELETON_COUNT }).map((_, index) => (
                    <PostCardSkeleton key={index} />
                  ))}
                </VStack>
              )}
            </VStack>
          </FeatureErrorBoundary>
        )}
      </VStack>
    </>
  );
};

export default Feed;
