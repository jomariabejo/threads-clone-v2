import { useCallback, useEffect } from 'react';
import { Box, chakra, HStack, IconButton, Image, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu';
import { getMediaUrl } from '@/client/api/client';
import type { PostFileResponseDto } from '@/client/api/types';

interface MediaViewerProps {
  files: PostFileResponseDto[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const MediaViewer = ({ files, currentIndex, onClose, onIndexChange }: MediaViewerProps) => {
  const goNext = useCallback(() => {
    if (currentIndex < files.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, files.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') goNext();
      else if (event.key === 'ArrowLeft') goPrev();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [onClose, goNext, goPrev]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (files.length === 0) return null;

  const currentFile = files[currentIndex];
  const hasMultiple = files.length > 1;

  return (
    <Box position="fixed" inset={0} zIndex="modal" display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" inset={0} bg="blackAlpha.900" onClick={onClose} />

      <HStack position="absolute" top={0} insetX={0} justify="space-between" align="center" px={4} py={3} zIndex={1}>
        {hasMultiple ? (
          <Text color="whiteAlpha.800" fontSize="sm" fontWeight="500">
            {currentIndex + 1} / {files.length}
          </Text>
        ) : <Box />}
        <IconButton aria-label="Close viewer" variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.200' }} onClick={onClose} borderRadius="full" size="md">
          <LuX size={22} />
        </IconButton>
      </HStack>

      {hasMultiple && currentIndex > 0 && (
        <IconButton
          aria-label="Previous"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={event => { event.stopPropagation(); goPrev(); }}
          borderRadius="full"
          size="lg"
          position="absolute"
          left={3}
          zIndex={1}
        >
          <LuChevronLeft size={28} />
        </IconButton>
      )}

      {hasMultiple && currentIndex < files.length - 1 && (
        <IconButton
          aria-label="Next"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={event => { event.stopPropagation(); goNext(); }}
          borderRadius="full"
          size="lg"
          position="absolute"
          right={3}
          zIndex={1}
        >
          <LuChevronRight size={28} />
        </IconButton>
      )}

      <Box
        position="relative"
        zIndex={1}
        w="90vw"
        h="85vh"
        maxW="90vw"
        maxH="85vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={event => { event.stopPropagation(); }}
      >
        {currentFile.fileType === 'IMAGE' ? (
          <Image src={getMediaUrl(currentFile.url)} alt="Post attachment" maxW="100%" maxH="100%" objectFit="contain" borderRadius="md" />
        ) : (
          <chakra.video src={getMediaUrl(currentFile.url)} controls autoPlay maxW="100%" maxH="100%" borderRadius="md" bg="black" />
        )}
      </Box>

      {hasMultiple && (
        <HStack position="absolute" bottom={5} left="50%" transform="translateX(-50%)" gap={2} zIndex={1}>
          {files.map((file, idx) => (
            <Box
              key={file.id}
              w={idx === currentIndex ? '8px' : '6px'}
              h={idx === currentIndex ? '8px' : '6px'}
              borderRadius="full"
              bg={idx === currentIndex ? 'white' : 'whiteAlpha.500'}
              transition="all 0.2s"
              cursor="pointer"
              onClick={event => { event.stopPropagation(); onIndexChange(idx); }}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
};
