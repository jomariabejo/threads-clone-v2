import axios from 'axios';
import { Box, Center, Heading, Text, VStack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAdminPosts } from '@/client/hooks/api/use-admin-posts';
import { useAdminPostsUrlState } from '@/client/hooks/use-admin-posts-url-state';
import { useDeleteAdminPost } from '@/client/hooks/api/use-delete-admin-post';
import { PageMeta } from '@/client/ui/components/page-meta';
import { PostsToolbar } from '@/client/ui/components/admin-posts/posts-toolbar';
import { PostsTable } from '@/client/ui/components/admin-posts/posts-table';
import { PostsPagination } from '@/client/ui/components/admin-posts/posts-pagination';
import { toaster } from '@/client/ui/components/toaster';
import type { PostResponseDto } from '@/client/api/types';

const AdminPosts = () => {
  const intl = useIntl();
  const urlState = useAdminPostsUrlState();

  const { data, isLoading, isFetching, isError } = useAdminPosts({
    page: urlState.page,
    size: urlState.size,
    search: urlState.search || undefined,
    visibility: urlState.visibility || undefined,
    status: urlState.status || undefined,
    createdFrom: urlState.createdFrom || undefined,
    createdTo: urlState.createdTo || undefined,
    sort: urlState.sort,
  });

  const deletePost = useDeleteAdminPost();

  const handleDelete = (post: PostResponseDto) => {
    if (!window.confirm(intl.formatMessage({ id: 'admin.posts.deleteConfirm' }))) return;

    deletePost.mutate(post.id, {
      onError: error => {
        const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
          ? error.response.data.message
          : intl.formatMessage({ id: 'admin.posts.deleteError' });
        toaster.create({ type: 'error', title: message });
      },
    });
  };

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'admin.posts.pageTitle' })}
        description={intl.formatMessage({ id: 'admin.posts.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <Heading size="xl" color="brand.800">
          <FormattedMessage id="admin.posts.heading" />
        </Heading>

        <PostsToolbar urlState={urlState} />

        {isError && (
          <Center py={20}>
            <Text color="fg.error">
              <FormattedMessage id="admin.posts.loadError" />
            </Text>
          </Center>
        )}

        {!isError && (
          <>
            <Box overflowX="auto">
              <PostsTable
                posts={data?.content ?? []}
                isLoading={isLoading || isFetching}
                sort={urlState.sort}
                onToggleSort={urlState.toggleSort}
                onDelete={handleDelete}
              />
            </Box>

            {data && data.content.length > 0 && (
              <PostsPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                pageSize={data.pageSize}
                onPageChange={urlState.setPage}
                onPageSizeChange={urlState.setPageSize}
              />
            )}
          </>
        )}
      </VStack>
    </>
  );
};

export default AdminPosts;
