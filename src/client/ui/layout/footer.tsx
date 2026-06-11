import { Box, Flex, Text } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { FormattedMessage } from 'react-intl';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? 'gray.400' : 'gray.600';

  return (
    <Box as="footer" bg={isDark ? 'gray.800' : 'gray.100'} py={4} px={8}>
      <Flex justify="center" align="center" gap={4} direction={{ base: 'column', sm: 'row' }}>
        <Text fontSize="sm" color={textColor}>
          <FormattedMessage id="footer.copyright" values={{ year: CURRENT_YEAR }} />
        </Text>
      </Flex>
      <Text fontSize="xs" color={textColor} textAlign="center" mt={3}>
        <FormattedMessage id="footer.cookiesEssential" />
      </Text>
    </Box>
  );
};
