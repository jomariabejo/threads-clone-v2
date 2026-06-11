import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Box, Center, HStack, Input, InputGroup, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useSearch } from '@/client/hooks/api/use-search';
import { FeatureErrorBoundary } from '@/client/ui/components/feature-error-boundary';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostCard } from '@/client/ui/components/post-card';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { ROUTES, profileUserPath } from '@/client/utilities/constants';
import { type RootState } from '@/client/redux/store';

const Search = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [query, setQuery] = useState('');

  const { data, isLoading } = useSearch(query);
  const posts = data?.posts ?? [];
  const users = data?.users ?? [];
  const hasQuery = query.trim().length > 0;

  const goToProfile = (userId: number) => {
    void navigate(currentUserId === userId ? ROUTES.PROFILE : profileUserPath(userId));
  };

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'search.pageTitle' })}
        description={intl.formatMessage({ id: 'search.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <InputGroup startElement={<LuSearch size={20} />}>
          <Input
            value={query}
            onChange={event => { setQuery(event.target.value); }}
            placeholder={intl.formatMessage({ id: 'search.placeholder' })}
            size="lg"
            borderRadius="full"
          />
        </InputGroup>

        {!hasQuery && (
          <Center py={20}>
            <Text color="fg.subtle" fontSize="lg">
              <FormattedMessage id="search.startTyping" />
            </Text>
          </Center>
        )}

        {hasQuery && isLoading && (
          <Center py={20}>
            <Spinner size="xl" color="brand.800" />
          </Center>
        )}

        {hasQuery && !isLoading && (
          <Tabs.Root defaultValue="posts">
            <Tabs.List>
              <Tabs.Trigger value="posts">
                <FormattedMessage id="search.tabPosts" values={{ count: posts.length }} />
              </Tabs.Trigger>
              <Tabs.Trigger value="people">
                <FormattedMessage id="search.tabPeople" values={{ count: users.length }} />
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="posts">
              {posts.length === 0 ? (
                <Center py={20}>
                  <Text color="fg.subtle">
                    <FormattedMessage id="search.noPosts" />
                  </Text>
                </Center>
              ) : (
                <FeatureErrorBoundary>
                  <VStack gap={3} align="stretch" pt={3}>
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </VStack>
                </FeatureErrorBoundary>
              )}
            </Tabs.Content>

            <Tabs.Content value="people">
              {users.length === 0 ? (
                <Center py={20}>
                  <Text color="fg.subtle">
                    <FormattedMessage id="search.noPeople" />
                  </Text>
                </Center>
              ) : (
                <VStack gap={0} align="stretch" pt={3}>
                  {users.map(user => (
                    <Box
                      key={user.id}
                      p={4}
                      borderBottom="1px solid"
                      borderColor="border.subtle"
                      cursor="pointer"
                      _hover={{ bg: 'bg.muted' }}
                      borderRadius="lg"
                      onClick={() => { goToProfile(user.id); }}
                    >
                      <HStack gap={3}>
                        <UserAvatar name={user.name} src={getMediaUrl(user.profileImageUrl)} size={48} />
                        <Text fontWeight="600" color="fg">
                          {user.username}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </VStack>
    </>
  );
};

export default Search;
