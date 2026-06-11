import { Box, Image } from '@chakra-ui/react';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: number;
}

const DEFAULT_SIZE = 36;
const INITIALS_FONT_RATIO = 0.4;
const INITIALS_LENGTH = 2;

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, INITIALS_LENGTH).toUpperCase();
};

export const UserAvatar = ({ name, src, size = DEFAULT_SIZE }: UserAvatarProps) => {
  const sizePx = `${size}px`;

  return (
    <Box
      w={sizePx}
      h={sizePx}
      borderRadius="full"
      bg="brand.800"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="600"
      fontSize={`${size * INITIALS_FONT_RATIO}px`}
      flexShrink={0}
      overflow="hidden"
    >
      {src ? <Image src={src} alt={name} boxSize="100%" objectFit="cover" /> : getInitials(name)}
    </Box>
  );
};
