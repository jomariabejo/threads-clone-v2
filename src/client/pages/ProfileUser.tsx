import { useNavigate, useParams } from 'react-router';
import { Button, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useCurrentUser } from '@/client/hooks/api/use-current-user';
import { usePublicProfile } from '@/client/hooks/api/use-public-profile';
import { FeatureErrorBoundary } from '@/client/ui/components/feature-error-boundary';
import { Link } from '@/client/ui/components/link';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostCard } from '@/client/ui/components/post-card';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { formatDate, parseServerDate } from '@/client/utilities/formatting';
import { ROUTES } from '@/client/utilities/constants';

const PROFILE_AVATAR_SIZE = 72;

const ProfileUser = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const userIdNum = Number(userId);

  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading, isError } = usePublicProfile(userIdNum);

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="brand.800" />
      </Center>
    );
  }

  if (isError || !profile) {
    return (
      <Center py={20}>
        <VStack gap={3}>
          <Text color="fg.subtle" fontSize="lg" fontWeight="500">
            <FormattedMessage id="profileUser.notFound" />
          </Text>
          <Link to={ROUTES.FEED}>
            <FormattedMessage id="profileUser.backToFeed" />
          </Link>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'profileUser.pageTitle' })}
        description={intl.formatMessage({ id: 'profileUser.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <VStack gap={4} align="stretch" pb={6} borderBottom="1px solid" borderColor="border">
          <HStack gap={4} align="center">
            <UserAvatar name={profile.username} src={getMediaUrl(profile.profileImageUrl)} size={PROFILE_AVATAR_SIZE} />
            <VStack align="start" gap={1} flex={1}>
              <HStack gap={3} align="center" w="100%">
                <Text fontSize="xl" fontWeight="700" color="fg">
                  {profile.username}
                </Text>
                {currentUser?.id === userIdNum && (
                  <Button size="sm" variant="outline" onClick={() => { void navigate(ROUTES.PROFILE_EDIT); }}>
                    <FormattedMessage id="profile.editProfile" />
                  </Button>
                )}
              </HStack>
              {profile.bio && (
                <Text color="fg.muted" fontSize="sm" lineHeight="1.5">
                  {profile.bio}
                </Text>
              )}
              <Text color="fg.subtle" fontSize="xs">
                <FormattedMessage id="profile.joined" values={{ date: formatDate(parseServerDate(profile.createdAt), intl.locale) }} />
              </Text>
            </VStack>
          </HStack>

          <HStack gap={1}>
            <Text fontWeight="700" color="fg" fontSize="sm">
              {profile.postsCount}
            </Text>
            <Text color="fg.subtle" fontSize="sm">
              <FormattedMessage id="profile.posts" />
            </Text>
          </HStack>
        </VStack>

        <VStack gap={3} align="stretch">
          {profile.posts.content.length > 0 ? (
            <FeatureErrorBoundary>
              <VStack gap={3} align="stretch">
                {profile.posts.content.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </VStack>
            </FeatureErrorBoundary>
          ) : (
            <Center py={10}>
              <Text color="fg.subtle" fontSize="sm">
                <FormattedMessage id="profileUser.empty" />
              </Text>
            </Center>
          )}
        </VStack>
      </VStack>
    </>
  );
};

export default ProfileUser;
