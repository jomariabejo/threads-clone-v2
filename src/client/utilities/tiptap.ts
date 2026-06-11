import StarterKit from '@tiptap/starter-kit';
import { generateHTML } from '@tiptap/html';
import type { Extensions, JSONContent } from '@tiptap/core';

const PREVIEW_LENGTH = 100;
const ALLOWED_LINK_PROTOCOLS = ['http', 'https', 'mailto'];
const ALLOWED_HREF_PATTERN = /^(https?:|mailto:)/i;

export const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

// Shared between the editor and the read-only renderer so saved content round-trips identically.
export const TIPTAP_EXTENSIONS: Extensions = [
  StarterKit.configure({
    link: {
      protocols: ALLOWED_LINK_PROTOCOLS,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      openOnClick: false,
    },
  }),
];

const appendText = (node: JSONContent, parts: string[]): void => {
  if (typeof node.text === 'string') {
    parts.push(node.text);
  }
  for (const child of node.content ?? []) {
    appendText(child, parts);
  }
};

export const extractPlainTextPreview = (tiptapJsonString: string, maxLength: number = PREVIEW_LENGTH): string => {
  try {
    const json = JSON.parse(tiptapJsonString) as JSONContent;
    const parts: string[] = [];
    appendText(json, parts);
    const text = parts.join(' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  } catch {
    return '';
  }
};

// Rewrites link marks with a non-http(s)/mailto href (e.g. "javascript:") to "#",
// guarding against hand-crafted API payloads that bypass the editor's own URL validation.
const sanitizeNode = (node: JSONContent): JSONContent => {
  const sanitized: JSONContent = { ...node };

  if (sanitized.marks) {
    sanitized.marks = sanitized.marks.map(mark => {
      const href = mark.attrs?.href;
      if (mark.type === 'link' && typeof href === 'string' && !ALLOWED_HREF_PATTERN.test(href)) {
        return { ...mark, attrs: { ...mark.attrs, href: '#' } };
      }
      return mark;
    });
  }

  if (sanitized.content) {
    sanitized.content = sanitized.content.map(sanitizeNode);
  }

  return sanitized;
};

export const tiptapJsonToHtml = (tiptapJsonString: string): string => {
  try {
    const json = JSON.parse(tiptapJsonString) as JSONContent;
    return generateHTML(sanitizeNode(json), TIPTAP_EXTENSIONS);
  } catch {
    return '';
  }
};
