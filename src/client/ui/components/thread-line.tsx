import { Box } from '@chakra-ui/react';

interface ThreadLineProps {
  height?: number | string;
  width?: number | string;
}

export const ThreadLine = ({ height = '100%', width = '2px' }: ThreadLineProps) => (
  <Box w={width} h={height} bg="border" flexShrink={0} />
);
