import { useState } from 'react';
import axios from 'axios';
import {
  Badge,
  Button,
  Center,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuSearch, LuTrash2 } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAdminPosts } from '@/client/hooks/api/use-admin-posts';
import { useDeleteAdminPost } from '@/client/hooks/api/use-delete-admin-post';
import { PageMeta } from '@/client/ui/components/page-meta';
import { toaster } from '@/client/ui/components/toaster';
import { extractPlainTextPreview } from '@/client/utilities/tiptap';
import { formatDate, parseServerDate } from '@/client/utilities/formatting';

const AdminPosts = () => {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useAdminPosts(page, search);
  const deletePost = useDeleteAdminPost();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleDelete = (postId: number) => {
    if (!window.confirm(intl.formatMessage({ id: 'admin.posts.deleteConfirm' }))) return;

    deletePost.mutate(postId, {
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

        <InputGroup startElement={<LuSearch size={20} />}>
          <Input
            value={search}
            onChange={event => { handleSearchChange(event.target.value); }}
            placeholder={intl.formatMessage({ id: 'admin.posts.searchPlaceholder' })}
            size="lg"
            borderRadius="full"
          />
        </InputGroup>

        {isLoading && (
          <Center py={20}>
            <Spinner size="xl" color="brand.800" />
          </Center>
        )}

        {isError && (
          <Center py={20}>
            <Text color="fg.error">
              <FormattedMessage id="admin.posts.loadError" />
            </Text>
          </Center>
        )}

        {!isLoading && !isError && data && (
          data.content.length === 0 ? (
            <Center py={20}>
              <Text color="fg.subtle">
                <FormattedMessage id="admin.posts.empty" />
              </Text>
            </Center>
          ) : (
            <>
              <Table.ScrollArea borderWidth="1px" borderRadius="lg">
                <Table.Root size="sm" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnId" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnContent" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnAuthor" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnVisibility" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnStatus" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnCreatedAt" /></Table.ColumnHeader>
                      <Table.ColumnHeader><FormattedMessage id="admin.posts.columnActions" /></Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.content.map(post => (
                      <Table.Row key={post.id}>
                        <Table.Cell>{post.id}</Table.Cell>
                        <Table.Cell maxW="320px" whiteSpace="normal">
                          {post.title && <Text fontWeight="600">{post.title}</Text>}
                          <Text color="fg.subtle" fontSize="sm">{extractPlainTextPreview(post.content)}</Text>
                        </Table.Cell>
                        <Table.Cell>{post.author.username}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={post.visibility === 'PRIVATE' ? 'purple' : 'gray'}>{post.visibility}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={post.status === 'DRAFT' ? 'orange' : 'green'}>{post.status}</Badge>
                        </Table.Cell>
                        <Table.Cell>{formatDate(parseServerDate(post.createdAt), intl.locale)}</Table.Cell>
                        <Table.Cell>
                          <IconButton
                            aria-label={intl.formatMessage({ id: 'admin.posts.delete' })}
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => { handleDelete(post.id); }}
                          >
                            <LuTrash2 size={18} />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>

              <HStack justify="space-between">
                <Button variant="outline" disabled={data.first} onClick={() => { setPage(current => current - 1); }}>
                  <FormattedMessage id="admin.pagination.previous" />
                </Button>
                <Text color="fg.subtle" fontSize="sm">
                  <FormattedMessage id="admin.pagination.pageInfo" values={{ page: data.number + 1, totalPages: Math.max(data.totalPages, 1) }} />
                </Text>
                <Button variant="outline" disabled={data.last} onClick={() => { setPage(current => current + 1); }}>
                  <FormattedMessage id="admin.pagination.next" />
                </Button>
              </HStack>
            </>
          )
        )}
      </VStack>
    </>
  );
};

export default AdminPosts;
