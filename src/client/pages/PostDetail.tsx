import { useParams } from 'react-router';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LuArrowLeft } from 'react-icons/lu';
import { usePost } from '@/client/hooks/api/use-post';
import { FeatureErrorBoundary } from '@/client/ui/components/feature-error-boundary';
import { Link } from '@/client/ui/components/link';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostCard } from '@/client/ui/components/post-card';
import { ROUTES } from '@/client/utilities/constants';

const PostDetail = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const { data: post, isLoading, isError } = usePost(Number.isFinite(postId) ? postId : null);

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="brand.800" />
      </Center>
    );
  }

  if (isError || !post) {
    return (
      <Center py={20}>
        <VStack gap={3}>
          <Text color="fg.subtle" fontSize="lg" fontWeight="500">
            <FormattedMessage id="postDetail.notFound" />
          </Text>
          <Link to={ROUTES.FEED}>
            <FormattedMessage id="postDetail.backToFeed" />
          </Link>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'postDetail.pageTitle' })}
        description={intl.formatMessage({ id: 'postDetail.pageDescription' })}
      />
      <VStack gap={3} align="stretch">
        <Link
          to={ROUTES.FEED}
          display="inline-flex"
          alignItems="center"
          gap={2}
          alignSelf="flex-start"
          color="fg.muted"
          fontSize="sm"
          fontWeight="500"
          _hover={{ color: 'brand.700' }}
        >
          <LuArrowLeft aria-hidden />
          <FormattedMessage id="postDetail.backToFeed" />
        </Link>
        <FeatureErrorBoundary>
          <PostCard post={post} truncate={false} />
        </FeatureErrorBoundary>
      </VStack>
    </>
  );
};

export default PostDetail;
