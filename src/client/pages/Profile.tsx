import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Center, HStack, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useCurrentUser } from '@/client/hooks/api/use-current-user';
import { useDrafts } from '@/client/hooks/api/use-drafts';
import { usePublicProfile } from '@/client/hooks/api/use-public-profile';
import { DraftListItem } from '@/client/ui/components/draft-list-item';
import { FeatureErrorBoundary } from '@/client/ui/components/feature-error-boundary';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostCard } from '@/client/ui/components/post-card';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { formatDate, parseServerDate } from '@/client/utilities/formatting';
import { ROUTES } from '@/client/utilities/constants';

const PROFILE_AVATAR_SIZE = 80;

const Profile = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = usePublicProfile(currentUser?.id ?? NaN);
  const { data: draftPages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: draftsLoading } = useDrafts();

  const drafts = useMemo(() => draftPages?.pages.flatMap(page => page.content) ?? [], [draftPages]);

  if (userLoading || !currentUser) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="brand.800" />
      </Center>
    );
  }

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'profile.pageTitle' })}
        description={intl.formatMessage({ id: 'profile.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <VStack gap={4} align="stretch" pb={6} borderBottom="1px solid" borderColor="border">
          <HStack gap={4} align="center">
            <UserAvatar name={currentUser.name} src={getMediaUrl(currentUser.profileImageUrl)} size={PROFILE_AVATAR_SIZE} />
            <VStack align="start" gap={1} flex={1}>
              <Text fontSize="2xl" fontWeight="700" color="fg">
                {currentUser.username}
              </Text>
              <Text color="fg.subtle" fontSize="sm">
                {currentUser.email}
              </Text>
              {currentUser.bio && (
                <Text color="fg.muted" fontSize="sm" lineHeight="1.5" pt={1}>
                  {currentUser.bio}
                </Text>
              )}
              {profile?.createdAt && (
                <Text color="fg.subtle" fontSize="xs">
                  <FormattedMessage id="profile.joined" values={{ date: formatDate(parseServerDate(profile.createdAt), intl.locale) }} />
                </Text>
              )}
            </VStack>
          </HStack>

          <HStack gap={4} pt={2} align="center">
            <HStack gap={1}>
              <Text fontWeight="700" color="fg" fontSize="sm">
                {profile?.postsCount ?? 0}
              </Text>
              <Text color="fg.subtle" fontSize="sm">
                <FormattedMessage id="profile.posts" />
              </Text>
            </HStack>
            <Button variant="outline" size="sm" onClick={() => { void navigate(ROUTES.PROFILE_EDIT); }}>
              <FormattedMessage id="profile.editProfile" />
            </Button>
          </HStack>
        </VStack>

        <Tabs.Root defaultValue="posts" variant="line">
          <Tabs.List>
            <Tabs.Trigger value="posts">
              <FormattedMessage id="profile.myPosts" />
            </Tabs.Trigger>
            <Tabs.Trigger value="drafts">
              <FormattedMessage id="profile.drafts" />
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="posts">
            {profileLoading && (
              <Center py={8}>
                <Spinner size="md" color="brand.800" />
              </Center>
            )}

            {!profileLoading && profile && profile.posts.content.length > 0 && (
              <FeatureErrorBoundary>
                <VStack gap={3} align="stretch" pt={3}>
                  {profile.posts.content.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </VStack>
              </FeatureErrorBoundary>
            )}

            {!profileLoading && (!profile || profile.posts.content.length === 0) && (
              <Center py={10}>
                <VStack gap={2}>
                  <Text color="fg.subtle" fontSize="sm">
                    <FormattedMessage id="profile.empty" />
                  </Text>
                  <Button size="sm" variant="solid" onClick={() => { void navigate(ROUTES.CREATE); }}>
                    <FormattedMessage id="profile.createFirst" />
                  </Button>
                </VStack>
              </Center>
            )}
          </Tabs.Content>

          <Tabs.Content value="drafts">
            {draftsLoading && (
              <Center py={8}>
                <Spinner size="md" color="brand.800" />
              </Center>
            )}

            {!draftsLoading && drafts.length > 0 && (
              <FeatureErrorBoundary>
                <VStack gap={3} align="stretch" pt={3}>
                  {drafts.map(post => (
                    <DraftListItem key={post.id} post={post} />
                  ))}

                  {hasNextPage && !isFetchingNextPage && (
                    <Center py={6}>
                      <Button variant="outline" onClick={() => { void fetchNextPage(); }}>
                        <FormattedMessage id="feed.loadMore" />
                      </Button>
                    </Center>
                  )}

                  {isFetchingNextPage && (
                    <Center py={4}>
                      <Spinner size="sm" color="brand.800" />
                    </Center>
                  )}
                </VStack>
              </FeatureErrorBoundary>
            )}

            {!draftsLoading && drafts.length === 0 && (
              <Center py={10}>
                <Text color="fg.subtle" fontSize="sm">
                  <FormattedMessage id="profile.draftsEmpty" />
                </Text>
              </Center>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </>
  );
};

export default Profile;
