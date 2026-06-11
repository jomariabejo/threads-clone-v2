import { Box, HStack, Skeleton, SkeletonCircle, SkeletonText, VStack } from '@chakra-ui/react';

export const PostCardSkeleton = () => (
  <Box p={4} bg="bg.panel" border="1px solid" borderColor="border" borderRadius="xl" boxShadow="card">
    <HStack align="start" gap={3}>
      <SkeletonCircle size="36px" />
      <VStack align="stretch" gap={2} flex={1}>
        <HStack gap={2} align="baseline">
          <Skeleton height="16px" width="80px" />
          <Skeleton height="12px" width="60px" />
        </HStack>
        <Skeleton height="20px" width="60%" />
        <SkeletonText noOfLines={2} gap="2" />
        <Skeleton height="160px" borderRadius="lg" />
        <HStack gap={4} pt={2}>
          <Skeleton height="32px" width="60px" borderRadius="full" />
          <Skeleton height="32px" width="60px" borderRadius="full" />
        </HStack>
      </VStack>
    </HStack>
  </Box>
);
