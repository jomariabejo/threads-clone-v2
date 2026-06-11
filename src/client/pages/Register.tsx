import { useId, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Field,
  Heading,
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
import { register } from '../api/auth';

const Register = () => {
  const id = useId();
  const nameId = `${id}-name`;
  const emailId = `${id}-email`;
  const usernameId = `${id}-username`;
  const passwordId = `${id}-password`;
  const intl = useIntl();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => register({ name, email, username, password }),
    onSuccess: () => {
      void navigate(ROUTES.LOGIN, { state: { registered: true } });
    },
  });

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    mutation.reset();
    mutation.mutate();
  };

  return (
    <PageLayout maxW="container.sm">
      <PageMeta
        title={intl.formatMessage({ id: 'auth.register.pageTitle' })}
        description={intl.formatMessage({ id: 'auth.register.pageDescription' })}
      />
      <VStack gap={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2} color="brand.800">
            <FormattedMessage id="auth.register.title" />
          </Heading>
          <Text color="gray.600">
            <FormattedMessage id="auth.register.subtitle" />
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            {mutation.isError && (
              <Alert.Root status="error" borderRadius="lg">
                <Alert.Indicator />
                <Alert.Title>
                  <FormattedMessage id="auth.register.error" />
                </Alert.Title>
              </Alert.Root>
            )}

            <Field.Root required>
              <Field.Label htmlFor={nameId}>
                <FormattedMessage id="auth.register.name" />
              </Field.Label>
              <Input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                required
                autoFocus
                value={name}
                onChange={event => { setName(event.target.value); }}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label htmlFor={emailId}>
                <FormattedMessage id="auth.register.email" />
              </Field.Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={event => { setEmail(event.target.value); }}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label htmlFor={usernameId}>
                <FormattedMessage id="auth.register.username" />
              </Field.Label>
              <Input
                id={usernameId}
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={event => { setUsername(event.target.value); }}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label htmlFor={passwordId}>
                <FormattedMessage id="auth.register.password" />
              </Field.Label>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={event => { setPassword(event.target.value); }}
              />
            </Field.Root>

            <AnimatedButton type="submit" loading={mutation.isPending} aria-label={intl.formatMessage({ id: 'auth.register.submit' })}>
              <FormattedMessage id="auth.register.submit" />
            </AnimatedButton>
          </VStack>
        </Box>

        <Text textAlign="center" color="gray.600">
          <FormattedMessage id="auth.register.haveAccount" />
          {' '}
          <Link to={ROUTES.LOGIN}>
            <FormattedMessage id="auth.register.loginLink" />
          </Link>
        </Text>
      </VStack>
    </PageLayout>
  );
};

export default Register;
