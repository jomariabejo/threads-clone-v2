import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import { Box, HStack, IconButton, Separator } from '@chakra-ui/react';
import {
  LuBold,
  LuCode,
  LuHeading1,
  LuHeading2,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
  LuQuote,
  LuRedo,
  LuStrikethrough,
  LuUndo,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { useIntl } from 'react-intl';
import { TIPTAP_EXTENSIONS } from '@/client/utilities/tiptap';

interface RichTextEditorProps {
  content: JSONContent | null;
  onChange: (json: JSONContent, isEmpty: boolean) => void;
  placeholder?: string;
}

interface ToolbarAction {
  icon: IconType;
  labelId: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
}

interface ToolbarGroup {
  id: string;
  actions: ToolbarAction[];
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    id: 'marks',
    actions: [
      { icon: LuBold, labelId: 'create.toolbar.bold', isActive: editor => editor.isActive('bold'), run: editor => { editor.chain().focus().toggleBold().run(); } },
      { icon: LuItalic, labelId: 'create.toolbar.italic', isActive: editor => editor.isActive('italic'), run: editor => { editor.chain().focus().toggleItalic().run(); } },
      { icon: LuStrikethrough, labelId: 'create.toolbar.strike', isActive: editor => editor.isActive('strike'), run: editor => { editor.chain().focus().toggleStrike().run(); } },
      { icon: LuCode, labelId: 'create.toolbar.codeBlock', isActive: editor => editor.isActive('codeBlock'), run: editor => { editor.chain().focus().toggleCodeBlock().run(); } },
    ],
  },
  {
    id: 'headings',
    actions: [
      { icon: LuHeading1, labelId: 'create.toolbar.heading1', isActive: editor => editor.isActive('heading', { level: 1 }), run: editor => { editor.chain().focus().toggleHeading({ level: 1 }).run(); } },
      { icon: LuHeading2, labelId: 'create.toolbar.heading2', isActive: editor => editor.isActive('heading', { level: 2 }), run: editor => { editor.chain().focus().toggleHeading({ level: 2 }).run(); } },
    ],
  },
  {
    id: 'blocks',
    actions: [
      { icon: LuList, labelId: 'create.toolbar.bulletList', isActive: editor => editor.isActive('bulletList'), run: editor => { editor.chain().focus().toggleBulletList().run(); } },
      { icon: LuListOrdered, labelId: 'create.toolbar.orderedList', isActive: editor => editor.isActive('orderedList'), run: editor => { editor.chain().focus().toggleOrderedList().run(); } },
      { icon: LuQuote, labelId: 'create.toolbar.blockquote', isActive: editor => editor.isActive('blockquote'), run: editor => { editor.chain().focus().toggleBlockquote().run(); } },
    ],
  },
];

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const intl = useIntl();

  const editor = useEditor({
    extensions: [...TIPTAP_EXTENSIONS, Placeholder.configure({ placeholder: placeholder ?? '' })],
    content: content ?? undefined,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getJSON(), updatedEditor.isEmpty);
    },
  });

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(intl.formatMessage({ id: 'create.toolbar.linkPrompt' }), previousUrl ?? '');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <Box borderRadius="lg" border="1px solid" borderColor="border" overflow="hidden">
      <HStack gap={1} flexWrap="wrap" p={2} borderBottom="1px solid" borderColor="border" bg="bg.muted">
        {TOOLBAR_GROUPS.map((group, groupIndex) => (
          <HStack gap={1} key={group.id}>
            {groupIndex > 0 && <Separator orientation="vertical" h="20px" mx={1} />}
            {group.actions.map(action => (
              <IconButton
                key={action.labelId}
                aria-label={intl.formatMessage({ id: action.labelId })}
                size="sm"
                variant={action.isActive(editor) ? 'solid' : 'ghost'}
                onClick={() => { action.run(editor); }}
              >
                <action.icon size={16} />
              </IconButton>
            ))}
          </HStack>
        ))}
        <Separator orientation="vertical" h="20px" mx={1} />
        <IconButton
          aria-label={intl.formatMessage({ id: 'create.toolbar.link' })}
          size="sm"
          variant={editor.isActive('link') ? 'solid' : 'ghost'}
          onClick={handleSetLink}
        >
          <LuLink size={16} />
        </IconButton>
        <Separator orientation="vertical" h="20px" mx={1} />
        <IconButton
          aria-label={intl.formatMessage({ id: 'create.toolbar.undo' })}
          size="sm"
          variant="ghost"
          disabled={!editor.can().undo()}
          onClick={() => { editor.chain().focus().undo().run(); }}
        >
          <LuUndo size={16} />
        </IconButton>
        <IconButton
          aria-label={intl.formatMessage({ id: 'create.toolbar.redo' })}
          size="sm"
          variant="ghost"
          disabled={!editor.can().redo()}
          onClick={() => { editor.chain().focus().redo().run(); }}
        >
          <LuRedo size={16} />
        </IconButton>
      </HStack>

      <Box
        p={3}
        minH="200px"
        bg="bg.panel"
        css={{
          '& .tiptap': { outline: 'none', minHeight: '170px' },
          '& .tiptap p': { margin: 0, lineHeight: '1.6' },
          '& .tiptap p + p': { marginTop: '0.5em' },
          '& .tiptap h1': { fontSize: '1.5em', fontWeight: '700', margin: '0.5em 0' },
          '& .tiptap h2': { fontSize: '1.25em', fontWeight: '700', margin: '0.5em 0' },
          '& .tiptap ul, & .tiptap ol': { paddingInlineStart: '1.5em' },
          '& .tiptap blockquote': { borderInlineStart: '3px solid', borderColor: 'border.emphasized', paddingInlineStart: '1em', color: 'fg.muted' },
          '& .tiptap pre': { bg: 'bg.muted', borderRadius: 'md', padding: '0.75em', overflowX: 'auto' },
          '& .tiptap code': { bg: 'bg.muted', borderRadius: 'sm', px: '0.25em' },
          '& .tiptap pre code': { bg: 'transparent', padding: 0 },
          '& .tiptap a': { color: 'brand.700', textDecoration: 'underline' },
          '& .tiptap p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)',
            float: 'left',
            color: 'fg.subtle',
            height: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
