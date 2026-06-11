import { useId, useState, type SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Alert,
  Box,
  Field,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PageLayout } from '../ui/layout/page-layout';
import { AnimatedButton } from '../ui/components/animated-button';
import { Link } from '../ui/components/link';
import { PageMeta } from '../ui/components/page-meta';
import { ROUTES } from '../utilities/constants';
import { apiClient } from '../api/client';
import { login } from '../api/auth';
import { setCredentials } from '../redux/auth';
import { type AppDispatch } from '../redux/store';
import type { CurrentUserResponseDto } from '../api/types';

const Login = () => {
  const id = useId();
  const usernameId = `${id}-username`;
  const passwordId = `${id}-password`;
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const justRegistered = (location.state as { registered?: boolean } | null)?.registered === true;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const { token } = await login({ username, password });
      const { data: user } = await apiClient.get<CurrentUserResponseDto>('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ token, user }));
      void navigate(ROUTES.FEED);
    },
  });

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    mutation.reset();
    mutation.mutate();
  };

  return (
    <PageLayout maxW="container.lg" py={12}>
      <PageMeta
        title={intl.formatMessage({ id: 'auth.login.pageTitle' })}
        description={intl.formatMessage({ id: 'auth.login.pageDescription' })}
      />
      <Flex align="stretch" borderRadius="2xl" overflow="hidden" boxShadow="card" border="1px solid" borderColor="border" bg="bg.panel">
        <Flex
          display={{ base: 'none', lg: 'flex' }}
          direction="column"
          align="center"
          justify="center"
          gap={6}
          flex="1"
          bg="brand.800"
          color="white"
          px={10}
          py={12}
        >
          <Box bg="white" borderRadius="2xl" p={5} boxShadow="lg">
            <Image src="/brand/not-expanded.png" alt={intl.formatMessage({ id: 'app.name' })} boxSize="100px" />
          </Box>
          <VStack gap={2}>
            <Heading size="xl" textAlign="center" fontWeight="700">
              <FormattedMessage id="app.name" />
            </Heading>
            <Text textAlign="center" color="whiteAlpha.800" maxW="320px" lineHeight="1.7">
              <FormattedMessage id="auth.login.tagline" />
            </Text>
          </VStack>
        </Flex>

        <Box flex="1" p={{ base: 6, md: 10 }}>
          <VStack gap={6} align="stretch">
            <VStack display={{ base: 'flex', lg: 'none' }} gap={3}>
              <Image src="/brand/not-expanded.png" alt={intl.formatMessage({ id: 'app.name' })} boxSize="64px" />
            </VStack>

            <Box textAlign="center">
              <Heading as="h1" size="2xl" mb={2} color="brand.800">
                <FormattedMessage id="auth.login.title" />
              </Heading>
              <Text color="gray.600">
                <FormattedMessage id="auth.login.subtitle" />
              </Text>
            </Box>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                {justRegistered && !mutation.isError && (
                  <Alert.Root status="success" borderRadius="lg">
                    <Alert.Indicator />
                    <Alert.Title>
                      <FormattedMessage id="auth.login.registered" />
                    </Alert.Title>
                  </Alert.Root>
                )}

                {mutation.isError && (
                  <Alert.Root status="error" borderRadius="lg">
                    <Alert.Indicator />
                    <Alert.Title>
                      <FormattedMessage id={axios.isAxiosError(mutation.error) && mutation.error.response?.status === 403
                        ? 'auth.login.suspended'
                        : 'auth.login.error'}
                      />
                    </Alert.Title>
                  </Alert.Root>
                )}

                <Field.Root required>
                  <Field.Label htmlFor={usernameId}>
                    <FormattedMessage id="auth.login.username" />
                  </Field.Label>
                  <Input
                    id={usernameId}
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    autoFocus
                    value={username}
                    onChange={event => { setUsername(event.target.value); }}
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label htmlFor={passwordId}>
                    <FormattedMessage id="auth.login.password" />
                  </Field.Label>
                  <Input
                    id={passwordId}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={event => { setPassword(event.target.value); }}
                  />
                </Field.Root>

                <AnimatedButton type="submit" loading={mutation.isPending} aria-label={intl.formatMessage({ id: 'auth.login.submit' })}>
                  <FormattedMessage id="auth.login.submit" />
                </AnimatedButton>
              </VStack>
            </Box>

            <Text textAlign="center" color="gray.600">
              <FormattedMessage id="auth.login.noAccount" />
              {' '}
              <Link to={ROUTES.REGISTER}>
                <FormattedMessage id="auth.login.registerLink" />
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </PageLayout>
  );
};

export default Login;
