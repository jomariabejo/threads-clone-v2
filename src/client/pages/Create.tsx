import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Center, Field, HStack, IconButton, Image, Input, RadioGroup, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuUpload, LuVideo, LuX } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import type { JSONContent } from '@tiptap/core';
import { createPost, updatePost } from '@/client/api/posts';
import { FEED_QUERY_KEY } from '@/client/hooks/api/use-feed';
import { DRAFTS_QUERY_KEY } from '@/client/hooks/api/use-drafts';
import { usePost } from '@/client/hooks/api/use-post';
import { PageMeta } from '@/client/ui/components/page-meta';
import { RichTextEditor } from '@/client/ui/components/rich-text-editor';
import { EMPTY_DOC, extractPlainTextPreview } from '@/client/utilities/tiptap';
import { ROUTES } from '@/client/utilities/constants';
import type { PostResponseDto, PostStatus, Visibility } from '@/client/api/types';

const MAX_IMAGES = 3;
const MAX_VIDEOS = 3;
const MAX_IMAGE_SIZE_MB = 50;
const MAX_VIDEO_SIZE_MB = 100;
const BYTES_PER_MB = 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const VIDEO_EXTENSION = 'mp4';

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface FormError {
  id: string;
  values?: Record<string, number>;
}

const parseInitialContent = (post: PostResponseDto | null): JSONContent | null => {
  if (!post) {
    return null;
  }

  try {
    return JSON.parse(post.content) as JSONContent;
  } catch {
    return EMPTY_DOC;
  }
};

interface CreatePostFormProps {
  postId: number | null;
  initialPost: PostResponseDto | null;
}

const CreatePostForm = ({ postId, initialPost }: CreatePostFormProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = postId !== null;

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [visibility, setVisibility] = useState<Visibility>(initialPost?.visibility ?? 'PUBLIC');
  const [contentJson, setContentJson] = useState<JSONContent | null>(() => parseInitialContent(initialPost));
  const [isContentEmpty, setIsContentEmpty] = useState(() => initialPost ? extractPlainTextPreview(initialPost.content) === '' : true);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<FormError | null>(null);

  const mutation = useMutation({
    mutationFn: (status: PostStatus) => {
      const content = JSON.stringify(contentJson ?? EMPTY_DOC);

      if (postId !== null) {
        return updatePost(postId, {
          title: title.trim() || undefined,
          content,
          visibility,
          status,
        });
      }

      return createPost({
        title: title.trim() || undefined,
        content,
        visibility,
        status,
        images: files.filter(item => item.type === 'image').map(item => item.file),
        videos: files.filter(item => item.type === 'video').map(item => item.file),
      });
    },
    onSuccess: (_post, status) => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DRAFTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void navigate(status === 'PUBLISHED' ? ROUTES.FEED : ROUTES.PROFILE);
    },
  });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';

    let imageCount = files.filter(item => item.type === 'image').length;
    let videoCount = files.filter(item => item.type === 'video').length;
    const newFiles: FilePreview[] = [];
    let nextError: FormError | null = null;

    for (const file of selected) {
      const extension = file.name.toLowerCase().split('.').pop() ?? '';
      const isImage = IMAGE_EXTENSIONS.has(extension);
      const isVideo = extension === VIDEO_EXTENSION;

      if (!isImage && !isVideo) {
        nextError = { id: 'create.invalidFileType' };
        continue;
      }

      if (isImage) {
        if (imageCount >= MAX_IMAGES) {
          nextError = { id: 'create.tooManyImages', values: { max: MAX_IMAGES } };
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * BYTES_PER_MB) {
          nextError = { id: 'create.imageTooLarge', values: { max: MAX_IMAGE_SIZE_MB } };
          continue;
        }
        imageCount += 1;
        newFiles.push({ file, preview: URL.createObjectURL(file), type: 'image' });
      } else {
        if (videoCount >= MAX_VIDEOS) {
          nextError = { id: 'create.tooManyVideos', values: { max: MAX_VIDEOS } };
          continue;
        }
        if (file.size > MAX_VIDEO_SIZE_MB * BYTES_PER_MB) {
          nextError = { id: 'create.videoTooLarge', values: { max: MAX_VIDEO_SIZE_MB } };
          continue;
        }
        videoCount += 1;
        newFiles.push({ file, preview: URL.createObjectURL(file), type: 'video' });
      }
    }

    if (newFiles.length > 0) {
      setFiles(current => [...current, ...newFiles]);
    }
    setError(nextError);
  };

  const removeFile = (index: number) => {
    setFiles(current => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, idx) => idx !== index);
    });
  };

  const handleSaveDraft = () => {
    setError(null);
    mutation.mutate('DRAFT');
  };

  const handlePublish = () => {
    if (isContentEmpty) {
      setError({ id: 'create.contentRequired' });
      return;
    }

    setError(null);
    mutation.mutate('PUBLISHED');
  };

  const isSavingDraft = mutation.isPending && mutation.variables === 'DRAFT';
  const isPublishing = mutation.isPending && mutation.variables === 'PUBLISHED';
  const isEditingPublished = isEditMode && initialPost?.status === 'PUBLISHED';

  let headingId = 'create.heading';
  let pageTitleId = 'create.pageTitle';
  let pageDescriptionId = 'create.pageDescription';
  if (isEditingPublished) {
    headingId = 'create.editPostHeading';
    pageTitleId = 'create.editPostPageTitle';
    pageDescriptionId = 'create.editPostPageDescription';
  } else if (isEditMode) {
    headingId = 'create.editDraftHeading';
    pageTitleId = 'create.editPageTitle';
    pageDescriptionId = 'create.editPageDescription';
  }

  return (
    <>
      <PageMeta title={intl.formatMessage({ id: pageTitleId })} description={intl.formatMessage({ id: pageDescriptionId })} />
      <VStack gap={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="fg">
          <FormattedMessage id={headingId} />
        </Text>

        <Box as="form" onSubmit={event => { event.preventDefault(); handlePublish(); }}>
          <VStack gap={4} align="stretch">
            {(error ?? mutation.isError) && (
              <Alert.Root status="error" borderRadius="lg">
                <Alert.Indicator />
                <Alert.Title>
                  {error ? <FormattedMessage id={error.id} values={error.values} /> : <FormattedMessage id="create.error" />}
                </Alert.Title>
              </Alert.Root>
            )}

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="create.titleLabel" />
              </Field.Label>
              <Input
                value={title}
                onChange={event => { setTitle(event.target.value); }}
                placeholder={intl.formatMessage({ id: 'create.titlePlaceholder' })}
                size="lg"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>
                <FormattedMessage id="create.contentLabel" />
              </Field.Label>
              <RichTextEditor
                content={contentJson}
                onChange={(json, isEmpty) => {
                  setContentJson(json);
                  setIsContentEmpty(isEmpty);
                }}
                placeholder={intl.formatMessage({ id: 'create.contentPlaceholder' })}
              />
            </Field.Root>

            {!isEditMode && (
              <Field.Root>
                <Field.Label>
                  <FormattedMessage id="create.attachmentsLabel" />
                </Field.Label>
                <Box
                  border="2px dashed"
                  borderColor="border.emphasized"
                  borderRadius="lg"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'brand.800', bg: 'bg.muted' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <VStack gap={2}>
                    <Box color="fg.subtle">
                      <LuUpload size={32} />
                    </Box>
                    <Text color="fg.muted">
                      <FormattedMessage id="create.uploadPrompt" />
                    </Text>
                    <Text fontSize="sm" color="fg.subtle">
                      <FormattedMessage
                        id="create.uploadHint"
                        values={{ maxImages: MAX_IMAGES, maxImageSize: MAX_IMAGE_SIZE_MB, maxVideos: MAX_VIDEOS, maxVideoSize: MAX_VIDEO_SIZE_MB }}
                      />
                    </Text>
                  </VStack>
                </Box>
                <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.mp4" onChange={handleFileSelect} style={{ display: 'none' }} />
              </Field.Root>
            )}

            {!isEditMode && files.length > 0 && (
              <VStack gap={3} align="stretch">
                <Text fontWeight="600" color="fg">
                  <FormattedMessage id="create.attachmentsCount" values={{ count: files.length }} />
                </Text>
                <HStack gap={3} flexWrap="wrap">
                  {files.map((filePreview, index) => (
                    <Box key={filePreview.preview} position="relative" w="120px" h="120px" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="border">
                      {filePreview.type === 'image' ? (
                        <Image src={filePreview.preview} alt="" w="100%" h="100%" objectFit="cover" />
                      ) : (
                        <Box w="100%" h="100%" bg="bg.muted" display="flex" alignItems="center" justifyContent="center" color="fg.subtle">
                          <LuVideo size={32} />
                        </Box>
                      )}
                      <IconButton
                        aria-label="Remove file"
                        size="sm"
                        position="absolute"
                        top={1}
                        right={1}
                        bg="red.500"
                        color="white"
                        _hover={{ bg: 'red.600' }}
                        onClick={() => { removeFile(index); }}
                      >
                        <LuX size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </HStack>
              </VStack>
            )}

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="create.visibilityLabel" />
              </Field.Label>
              <RadioGroup.Root value={visibility} onValueChange={details => { setVisibility(details.value as Visibility); }}>
                <HStack gap={4}>
                  <RadioGroup.Item value="PUBLIC">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl>
                      <RadioGroup.ItemIndicator />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>
                      <FormattedMessage id="create.visibilityPublic" />
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                  <RadioGroup.Item value="PRIVATE">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl>
                      <RadioGroup.ItemIndicator />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>
                      <FormattedMessage id="create.visibilityPrivate" />
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                </HStack>
              </RadioGroup.Root>
              <Field.HelperText>
                <FormattedMessage id={visibility === 'PUBLIC' ? 'create.visibilityPublicHint' : 'create.visibilityPrivateHint'} />
              </Field.HelperText>
            </Field.Root>

            <HStack justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => { void navigate(isEditMode ? ROUTES.PROFILE : ROUTES.FEED); }} disabled={mutation.isPending}>
                <FormattedMessage id="create.cancel" />
              </Button>
              {!isEditingPublished && (
                <Button
                  type="button"
                  variant="outline"
                  loading={isSavingDraft}
                  loadingText={intl.formatMessage({ id: 'create.savingDraft' })}
                  disabled={mutation.isPending}
                  onClick={handleSaveDraft}
                >
                  <FormattedMessage id="create.saveDraft" />
                </Button>
              )}
              <Button
                type="submit"
                variant="solid"
                loading={isPublishing}
                loadingText={intl.formatMessage({ id: isEditingPublished ? 'create.savingChanges' : 'create.publishing' })}
                disabled={mutation.isPending || isContentEmpty}
              >
                <FormattedMessage id={isEditingPublished ? 'create.saveChanges' : 'create.publish'} />
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </>
  );
};

const Create = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const idParam = searchParams.get('id');
  const postId = idParam !== null && idParam !== '' ? Number(idParam) : null;
  const isEditMode = postId !== null && Number.isFinite(postId);

  const { data: existingPost, isLoading: postLoading, isError: postLoadError } = usePost(isEditMode ? postId : null);

  if (isEditMode && postLoadError) {
    return (
      <VStack gap={6} align="stretch">
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>
            <FormattedMessage id="create.loadError" />
          </Alert.Title>
        </Alert.Root>
        <Button alignSelf="start" variant="outline" onClick={() => { void navigate(ROUTES.PROFILE); }}>
          <FormattedMessage id="create.cancel" />
        </Button>
      </VStack>
    );
  }

  if (isEditMode && postLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="brand.800" />
      </Center>
    );
  }

  return <CreatePostForm key={postId ?? 'new'} postId={isEditMode ? postId : null} initialPost={existingPost ?? null} />;
};

export default Create;
