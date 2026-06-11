import { useEffect, useMemo, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { tiptapJsonToHtml } from '@/client/utilities/tiptap';

const CLAMP_MAX_HEIGHT = '150px';

interface PostContentProps {
  content: string;
  clamp?: boolean;
  onOverflowChange?: (isOverflowing: boolean) => void;
}

export const PostContent = ({ content, clamp = false, onOverflowChange }: PostContentProps) => {
  const html = useMemo(() => tiptapJsonToHtml(content), [content]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clamp || !onOverflowChange) return undefined;
    const element = contentRef.current;
    if (!element) return undefined;

    const checkOverflow = () => {
      onOverflowChange(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => { observer.disconnect(); };
  }, [clamp, onOverflowChange, html]);

  return (
    <Box
      ref={contentRef}
      color="fg"
      fontSize="md"
      lineHeight="1.6"
      maxH={clamp ? CLAMP_MAX_HEIGHT : undefined}
      overflow={clamp ? 'hidden' : undefined}
      css={{
        '& p': { margin: 0 },
        '& p + p': { marginTop: '0.5em' },
        '& h1': { fontSize: '1.5em', fontWeight: '700', margin: '0.5em 0' },
        '& h2': { fontSize: '1.25em', fontWeight: '700', margin: '0.5em 0' },
        '& ul, & ol': { paddingInlineStart: '1.5em' },
        '& blockquote': { borderInlineStart: '3px solid', borderColor: 'border.emphasized', paddingInlineStart: '1em', color: 'fg.muted' },
        '& pre': { bg: 'bg.muted', borderRadius: 'md', padding: '0.75em', overflowX: 'auto' },
        '& code': { bg: 'bg.muted', borderRadius: 'sm', px: '0.25em' },
        '& pre code': { bg: 'transparent', padding: 0 },
        '& a': { color: 'brand.700', textDecoration: 'underline' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
