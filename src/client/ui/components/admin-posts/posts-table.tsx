import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import type { HeadType, RowType } from '@atlaskit/dynamic-table/types';
import EmptyState from '@atlaskit/empty-state';
import Lozenge from '@atlaskit/lozenge';
import { Box, IconButton, Text, VStack } from '@chakra-ui/react';
import { LuArrowDown, LuArrowUp, LuArrowUpDown, LuTrash2 } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { extractPlainTextPreview } from '@/client/utilities/tiptap';
import { formatDate, formatRelativeTime, parseServerDate } from '@/client/utilities/formatting';
import type { AdminPostSort, AdminPostSortField, PostResponseDto } from '@/client/api/types';

const AVATAR_SIZE = 32;

interface PostsTableProps {
  posts: PostResponseDto[];
  isLoading: boolean;
  sort: AdminPostSort[];
  onToggleSort: (field: AdminPostSortField, multi: boolean) => void;
  onDelete: (post: PostResponseDto) => void;
}

const SortIndicator = ({ entry }: { entry?: AdminPostSort }) => {
  if (!entry) return <LuArrowUpDown size={14} style={{ opacity: 0.35 }} />;
  return entry.direction === 'asc' ? <LuArrowUp size={14} /> : <LuArrowDown size={14} />;
};

interface SortableHeaderProps {
  field: AdminPostSortField;
  labelId: string;
  sort: AdminPostSort[];
  onToggleSort: (field: AdminPostSortField, multi: boolean) => void;
}

const SortableHeader = ({ field, labelId, sort, onToggleSort }: SortableHeaderProps) => {
  const sortIndex = sort.findIndex(entry => entry.field === field);
  const entry = sortIndex >= 0 ? sort[sortIndex] : undefined;

  return (
    <Box
      as="button"
      onClick={event => { onToggleSort(field, event.shiftKey); }}
      display="flex"
      alignItems="center"
      gap={1}
      fontWeight="600"
      fontSize="sm"
      color="fg"
      cursor="pointer"
      whiteSpace="nowrap"
      _hover={{ color: 'brand.800' }}
    >
      <FormattedMessage id={labelId} />
      <SortIndicator entry={entry} />
      {sort.length > 1 && entry && (
        <Text as="span" fontSize="2xs" color="fg.subtle">
          {sortIndex + 1}
        </Text>
      )}
    </Box>
  );
};

const VisibilityLozenge = ({ visibility }: { visibility: PostResponseDto['visibility'] }) => {
  const intl = useIntl();
  return (
    <Lozenge appearance={visibility === 'PRIVATE' ? 'moved' : 'default'}>
      {intl.formatMessage({ id: `admin.posts.visibility.${visibility}` })}
    </Lozenge>
  );
};

const StatusLozenge = ({ status }: { status: PostResponseDto['status'] }) => {
  const intl = useIntl();
  return (
    <Lozenge appearance={status === 'PUBLISHED' ? 'success' : 'inprogress'}>
      {intl.formatMessage({ id: `admin.posts.status.${status}` })}
    </Lozenge>
  );
};

const ContentCell = ({ post }: { post: PostResponseDto }) => {
  const preview = extractPlainTextPreview(post.content);

  return (
    <VStack align="start" gap={0} maxW="320px">
      {post.title && <Text fontWeight="600" fontSize="sm">{post.title}</Text>}
      {preview && (
        <Text fontSize="xs" color="fg.subtle" lineClamp={2}>
          {preview}
        </Text>
      )}
    </VStack>
  );
};

const AuthorCell = ({ post }: { post: PostResponseDto }) => (
  <Box display="flex" alignItems="center" gap={2}>
    <UserAvatar name={post.author.name} src={getMediaUrl(post.author.profileImageUrl)} size={AVATAR_SIZE} />
    <Text fontWeight="600" fontSize="sm">{post.author.username}</Text>
  </Box>
);

const DateCell = ({ value }: { value: string }) => {
  const intl = useIntl();
  const date = parseServerDate(value);

  return (
    <VStack gap={0} align="start">
      <Text fontSize="sm">{formatDate(date, intl.locale)}</Text>
      <Text fontSize="xs" color="fg.subtle">{formatRelativeTime(date, intl.locale)}</Text>
    </VStack>
  );
};

export const PostsTable = ({ posts, isLoading, sort, onToggleSort, onDelete }: PostsTableProps) => {
  const intl = useIntl();

  const sortableHead = (field: AdminPostSortField, labelId: string, width: number) => ({
    key: field,
    width,
    content: <SortableHeader field={field} labelId={labelId} sort={sort} onToggleSort={onToggleSort} />,
  });

  const head: HeadType = {
    cells: [
      sortableHead('id', 'admin.posts.columnId', 5),
      sortableHead('title', 'admin.posts.columnContent', 32),
      { key: 'author', width: 14, content: <FormattedMessage id="admin.posts.columnAuthor" /> },
      sortableHead('visibility', 'admin.posts.columnVisibility', 10),
      sortableHead('status', 'admin.posts.columnStatus', 10),
      sortableHead('createdAt', 'admin.posts.columnCreatedAt', 13),
      { key: 'actions', width: 6, content: <FormattedMessage id="admin.posts.columnActions" /> },
    ],
  };

  const rows: RowType[] = posts.map(post => ({
    key: String(post.id),
    cells: [
      { key: 'id', content: post.id },
      { key: 'content', content: <ContentCell post={post} /> },
      { key: 'author', content: <AuthorCell post={post} /> },
      { key: 'visibility', content: <VisibilityLozenge visibility={post.visibility} /> },
      { key: 'status', content: <StatusLozenge status={post.status} /> },
      { key: 'createdAt', content: <DateCell value={post.createdAt} /> },
      {
        key: 'actions',
        content: (
          <IconButton
            aria-label={intl.formatMessage({ id: 'admin.posts.delete' })}
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={() => { onDelete(post); }}
          >
            <LuTrash2 size={18} />
          </IconButton>
        ),
      },
    ],
  }));

  return (
    <DynamicTableStateless
      head={head}
      rows={rows}
      isLoading={isLoading}
      label={intl.formatMessage({ id: 'admin.posts.heading' })}
      emptyView={(
        <EmptyState
          header={intl.formatMessage({ id: 'admin.posts.empty' })}
          description={intl.formatMessage({ id: 'admin.posts.emptyDescription' })}
        />
      )}
    />
  );
};
