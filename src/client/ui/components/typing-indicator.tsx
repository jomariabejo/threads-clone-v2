import { Box, HStack, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FormattedMessage } from 'react-intl';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
`;

interface TypingIndicatorProps {
  count: number;
}

export const TypingIndicator = ({ count }: TypingIndicatorProps) => {
  if (count === 0) return null;

  return (
    <HStack gap={1} py={1} px={3} align="center">
      <Text color="fg.subtle" fontSize="xs" fontStyle="italic">
        {count === 1
          ? <FormattedMessage id="typing.one" />
          : <FormattedMessage id="typing.many" values={{ count }} />}
      </Text>
      <HStack gap="2px" align="center" pb="2px">
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            w="4px"
            h="4px"
            borderRadius="full"
            bg="fg.subtle"
            display="inline-block"
            animation={`${bounce} 1.4s infinite ease-in-out`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </HStack>
    </HStack>
  );
};
