import { type ReactNode } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { PublicHeader } from './header';
import { Footer } from './footer';
import { SkipLink } from '../components/skip-link';
import { PageTransition } from '../components/page-transition';

interface PageLayoutProps {
  maxW?: string;
  py?: number;
  children: ReactNode;
}

export const PageLayout = ({
  maxW = 'container.md',
  py = 8,
  children,
}: PageLayoutProps) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <SkipLink />
      <PublicHeader />
      <Container as="main" id="main-content" maxW={maxW} py={py} flex="1" w="full">
        <PageTransition>
          {children}
        </PageTransition>
      </Container>
      <Footer />
    </Box>
  );
};
