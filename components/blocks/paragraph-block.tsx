"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useBlocksStore } from "@/store/blocks-store";
import { useEditorStore } from "@/store/editor-store";
import Emoji, { gitHubEmojis } from "@tiptap-pro/extension-emoji";
import "tippy.js/dist/tippy.css";

interface ParagraphBlockProps {
  blockId: string;
  dropAreaId: string;
  content: string;
}

const TiptapToolbar = ({ editor }: { editor: Editor }) => {
  const { activeFormats, updateActiveFormats } = useEditorStore();

  // Update active formats when editor state changes
  useEffect(() => {
    const updateFormats = () => {
      updateActiveFormats({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
      });
    };

    editor.on("transaction", updateFormats);
    return () => {
      editor.off("transaction", updateFormats);
    };
  }, [editor, updateActiveFormats]);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL eingeben:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Add https:// if no protocol is specified
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;

    editor.chain().focus().toggleLink({ href: urlWithProtocol }).run();
  };

  return (
    <div
      className="flex flex-wrap gap-1 mb-2 bg-white/50 z-10"
      role="toolbar"
      aria-label="Text formatting"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.bold ? "bg-gray-300" : ""
        }`}
        aria-label="Bold"
        aria-pressed={activeFormats.bold}
      >
        Fett
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.italic ? "bg-gray-300" : ""
        }`}
        aria-label="Italic"
        aria-pressed={activeFormats.italic}
      >
        Kursiv
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.underline ? "bg-gray-300" : ""
        }`}
        aria-label="Underline"
        aria-pressed={activeFormats.underline}
      >
        Unterstrichen
      </button>
      <button
        onClick={setLink}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.link ? "bg-gray-300" : ""
        }`}
        aria-label="Link"
        aria-pressed={activeFormats.link}
      >
        Link
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.bulletList ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.orderedList}
        aria-label="Bullet List"
        aria-pressed={activeFormats.bulletList}
      >
        Aufzählung
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.orderedList ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.bulletList}
        aria-label="Numbered List"
        aria-pressed={activeFormats.orderedList}
      >
        Nummerierung
      </button>
      <button
        onClick={() => {
          editor.chain().focus().toggleBlockquote().run();
          // Ensure blockquote has a paragraph inside
          if (editor.isActive("blockquote")) {
            const { state } = editor;
            const { selection } = state;
            const node = selection.$anchor.node();
            if (node.type.name === "blockquote" && node.childCount === 0) {
              editor.chain().focus().insertContent("<p></p>").run();
            }
          }
        }}
        className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
          activeFormats.blockquote ? "bg-gray-300" : ""
        }`}
        disabled={activeFormats.blockquote}
        aria-label="Blockquote"
        aria-pressed={activeFormats.blockquote}
      >
        Zitat
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
        aria-label="Horizontal Rule"
      >
        Trennlinie
      </button>
    </div>
  );
};

export function ParagraphBlock({
  blockId,
  dropAreaId,
  content,
}: ParagraphBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const { setFocus, resetFormats } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        blockquote: {
          HTMLAttributes: {
            class: "blockquote",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
        suggestion: {
          items: ({ query }) => {
            return gitHubEmojis
              .filter(
                (emoji) =>
                  emoji.shortcodes.some((shortcode) =>
                    shortcode.toLowerCase().startsWith(query.toLowerCase())
                  ) ||
                  emoji.tags?.some((tag) =>
                    tag.toLowerCase().includes(query.toLowerCase())
                  )
              )
              .slice(0, 5);
          },
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateBlockContent(blockId, dropAreaId, html);
    },
    onFocus: () => {
      setFocus(true);
    },
    onBlur: () => {
      setFocus(false);
      resetFormats();
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
      handleDOMEvents: {
        mousedown: (view) => {
          // Enable text selection on first click
          view.dom.style.cursor = "text";
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        // Ctrl/Cmd + B for bold
        if ((event.ctrlKey || event.metaKey) && event.key === "b") {
          event.preventDefault();
          editor?.chain().focus().toggleBold().run();
          return true;
        }
        // Ctrl/Cmd + I for italic
        if ((event.ctrlKey || event.metaKey) && event.key === "i") {
          event.preventDefault();
          editor?.chain().focus().toggleItalic().run();
          return true;
        }
        // Ctrl/Cmd + U for underline
        if ((event.ctrlKey || event.metaKey) && event.key === "u") {
          event.preventDefault();
          editor?.chain().focus().toggleUnderline().run();
          return true;
        }
        // Ctrl/Cmd + K for link
        if ((event.ctrlKey || event.metaKey) && event.key === "k" && editor) {
          event.preventDefault();
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL eingeben:", previousUrl);

          if (url === null) {
            return true;
          }

          if (url === "") {
            editor.chain().focus().unsetLink().run();
            return true;
          }

          const urlWithProtocol = url.match(/^https?:\/\//)
            ? url
            : `https://${url}`;
          editor.chain().focus().toggleLink({ href: urlWithProtocol }).run();
          return true;
        }
        return false;
      },
    },
  });

  return (
    <div className="h-full flex flex-col relative">
      {editor && <TiptapToolbar editor={editor} />}
      {editor && (
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto border border-gray-300 rounded p-2 mt-2 tiptap-paragraph-editor"
        />
      )}
    </div>
  );
}
