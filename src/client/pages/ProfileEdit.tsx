import { useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Center, Field, HStack, IconButton, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import { LuCamera, LuX } from 'react-icons/lu';
import { FormattedMessage, useIntl } from 'react-intl';
import { getMediaUrl } from '@/client/api/client';
import { useCurrentUser } from '@/client/hooks/api/use-current-user';
import { useUpdateProfile } from '@/client/hooks/api/use-update-profile';
import { PageMeta } from '@/client/ui/components/page-meta';
import { UserAvatar } from '@/client/ui/components/user-avatar';
import { ROUTES, profileUserPath } from '@/client/utilities/constants';

const MAX_BIO_LENGTH = 500;
const MAX_AVATAR_SIZE_MB = 10;
const BYTES_PER_MB = 1024 * 1024;
const AVATAR_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const AVATAR_PREVIEW_SIZE = 120;

interface FormError {
  id: string;
  values?: Record<string, number>;
}

const ProfileEdit = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState<FormError | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);

  if (user && loadedUserId !== user.id) {
    setLoadedUserId(user.id);
    setBio(user.bio ?? '');
    setPreview(getMediaUrl(user.profileImageUrl));
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop() ?? '';
    if (!AVATAR_EXTENSIONS.has(extension)) {
      setError({ id: 'profileEdit.invalidFileType' });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_MB * BYTES_PER_MB) {
      setError({ id: 'profileEdit.fileTooLarge', values: { max: MAX_AVATAR_SIZE_MB } });
      return;
    }

    setError(null);
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setAvatarFile(null);
    setPreview(getMediaUrl(user?.profileImageUrl));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    setError(null);

    updateProfile.mutate(
      { bio, avatar: avatarFile ?? undefined },
      { onSuccess: () => { void navigate(ROUTES.PROFILE); } }
    );
  };

  if (isLoading || !user) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="brand.800" />
      </Center>
    );
  }

  return (
    <>
      <PageMeta
        title={intl.formatMessage({ id: 'profileEdit.pageTitle' })}
        description={intl.formatMessage({ id: 'profileEdit.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="fg">
            <FormattedMessage id="profileEdit.heading" />
          </Text>
          <Button size="sm" variant="outline" onClick={() => { void navigate(profileUserPath(user.id)); }}>
            <FormattedMessage id="profileEdit.viewPublicProfile" />
          </Button>
        </HStack>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={6} align="stretch">
            {(error ?? updateProfile.isError) && (
              <Alert.Root status="error" borderRadius="lg">
                <Alert.Indicator />
                <Alert.Title>
                  {error ? <FormattedMessage id={error.id} values={error.values} /> : <FormattedMessage id="profileEdit.error" />}
                </Alert.Title>
              </Alert.Root>
            )}

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="profileEdit.avatarLabel" />
              </Field.Label>
              <Center>
                <Box position="relative">
                  <UserAvatar name={user.name} src={preview} size={AVATAR_PREVIEW_SIZE} />
                  <IconButton
                    aria-label={intl.formatMessage({ id: 'profileEdit.changeAvatar' })}
                    size="sm"
                    position="absolute"
                    bottom={0}
                    right={0}
                    borderRadius="full"
                    bg="brand.800"
                    color="white"
                    _hover={{ bg: 'brand.700' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <LuCamera size={20} />
                  </IconButton>
                  {avatarFile && (
                    <IconButton
                      aria-label={intl.formatMessage({ id: 'profileEdit.removeAvatar' })}
                      size="sm"
                      position="absolute"
                      top={0}
                      right={0}
                      borderRadius="full"
                      bg="red.500"
                      color="white"
                      _hover={{ bg: 'red.600' }}
                      onClick={handleRemoveImage}
                    >
                      <LuX size={16} />
                    </IconButton>
                  )}
                </Box>
              </Center>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleImageSelect} style={{ display: 'none' }} />
            </Field.Root>

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="profileEdit.usernameLabel" />
              </Field.Label>
              <Box px={4} py={2} bg="bg.muted" borderRadius="md" color="fg.muted" fontSize="md">
                {user.username}
              </Box>
            </Field.Root>

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="profileEdit.emailLabel" />
              </Field.Label>
              <Box px={4} py={2} bg="bg.muted" borderRadius="md" color="fg.muted" fontSize="md">
                {user.email}
              </Box>
            </Field.Root>

            <Field.Root>
              <Field.Label>
                <FormattedMessage id="profileEdit.bioLabel" />
              </Field.Label>
              <Textarea
                value={bio}
                onChange={event => { setBio(event.target.value.slice(0, MAX_BIO_LENGTH)); }}
                placeholder={intl.formatMessage({ id: 'profileEdit.bioPlaceholder' })}
                size="lg"
                minH="120px"
                resize="vertical"
                maxLength={MAX_BIO_LENGTH}
              />
              <Text fontSize="sm" color="fg.subtle" mt={1} textAlign="end">
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
            </Field.Root>

            <HStack justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => { void navigate(ROUTES.PROFILE); }} disabled={updateProfile.isPending}>
                <FormattedMessage id="profileEdit.cancel" />
              </Button>
              <Button type="submit" variant="solid" loading={updateProfile.isPending} loadingText={intl.formatMessage({ id: 'profileEdit.saving' })}>
                <FormattedMessage id="profileEdit.save" />
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </>
  );
};

export default ProfileEdit;
