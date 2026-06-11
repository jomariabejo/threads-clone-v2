import { useNavigate } from 'react-router';
import { Alert, Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuHeart, LuMessageCircle } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { useActivity } from '@/client/hooks/api/use-activity';
import { PageMeta } from '@/client/ui/components/page-meta';
import { formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import { ROUTES } from '@/client/utilities/constants';

const ACTIVITY_ICON_SIZE = 40;

const Activity = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { data: activities, isLoading, isError } = useActivity();

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'activity.pageTitle' })}
        description={intl.formatMessage({ id: 'activity.pageDescription' })}
      />
      <VStack gap={0} align="stretch">
        <Box pb={4}>
          <Text fontSize="2xl" fontWeight="bold" color="fg">
            <FormattedMessage id="activity.heading" />
          </Text>
        </Box>

        {isError && (
          <Alert.Root status="error" borderRadius="lg">
            <Alert.Indicator />
            <Alert.Title>
              <FormattedMessage id="activity.loadError" />
            </Alert.Title>
          </Alert.Root>
        )}

        {isLoading && (
          <Center py={20}>
            <Spinner size="xl" color="brand.800" />
          </Center>
        )}

        {!isLoading && (!activities || activities.length === 0) && (
          <Center py={20}>
            <VStack gap={2}>
              <Text color="fg.muted" fontSize="lg" fontWeight="500">
                <FormattedMessage id="activity.empty.title" />
              </Text>
              <Text color="fg.subtle" fontSize="sm">
                <FormattedMessage id="activity.empty.subtitle" />
              </Text>
            </VStack>
          </Center>
        )}

        {!isLoading && activities && activities.length > 0 && (
          <VStack gap={0} align="stretch">
            {activities.map(activity => (
              <Box
                key={`${activity.type}-${activity.postId}-${activity.createdAt}`}
                p={4}
                borderBottom="1px solid"
                borderColor="border.subtle"
                cursor="pointer"
                _hover={{ bg: 'bg.muted' }}
                borderRadius="lg"
                onClick={() => { void navigate(ROUTES.FEED); }}
              >
                <HStack gap={3} align="start">
                  <Box
                    pt={0}
                    w={`${ACTIVITY_ICON_SIZE}px`}
                    h={`${ACTIVITY_ICON_SIZE}px`}
                    flexShrink={0}
                    borderRadius="full"
                    bg={activity.type === 'LIKE' ? 'accent.red' : 'brand.800'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {activity.type === 'LIKE' ? <LuHeart size={20} fill="currentColor" /> : <LuMessageCircle size={20} />}
                  </Box>
                  <VStack align="start" gap={1} flex={1} minW={0}>
                    <HStack gap={2} align="baseline">
                      <Text fontWeight="600" color="fg">
                        {activity.actor.username}
                      </Text>
                      <Text color="fg.subtle" fontSize="sm">
                        <FormattedMessage id={activity.type === 'LIKE' ? 'activity.liked' : 'activity.commented'} />
                      </Text>
                    </HStack>
                    {activity.type === 'COMMENT' && activity.commentText && (
                      <Text color="fg.muted" fontSize="sm" lineClamp={2}>
                        &ldquo;{activity.commentText}&rdquo;
                      </Text>
                    )}
                    <Text color="fg.subtle" fontSize="xs" fontStyle="italic" lineClamp={1}>
                      {activity.postPreview}
                    </Text>
                    <Text color="fg.subtle" fontSize="xs">
                      {formatRelativeTime(parseServerDate(activity.createdAt), intl.locale)}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </>
  );
};

export default Activity;
