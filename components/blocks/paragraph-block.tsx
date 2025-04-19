"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style"; // Added
import Color from "@tiptap/extension-color"; // Added back
import type { Level } from "@tiptap/extension-heading"; // Added
import { HexColorPicker } from "react-colorful"; // Added
import { useBlocksStore } from "@/store/blocks-store";
import { useEditorStore } from "@/store/editor-store";
import EmojiExtension, {
  EmojiPickerButton,
} from "@/lib/extensions/emoji-extension";
import "tippy.js/dist/tippy.css";

interface ParagraphBlockProps {
  blockId: string;
  layoutId: string;
  zoneId: string;
  content: string;
  viewport?: "mobile" | "tablet" | "desktop";
  readOnly?: boolean;
}

// Color picker component (Copied from heading-block.tsx)
const ColorPicker = ({ editor }: { editor: Editor }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [color, setColor] = React.useState(
    () => editor?.getAttributes("textStyle").color || "#000000"
  );
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle clicks outside the color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (editor) {
      // Reverted: Use setColor from the Color extension
      editor.chain().focus().setColor(newColor).run();
    }
  };

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={togglePicker}
        onMouseDown={(e) => e.preventDefault()}
        className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 flex items-center gap-2"
        aria-label="Text color"
        aria-expanded={isOpen}
      >
        <span
          className="w-4 h-4 border border-gray-300 rounded"
          style={{
            backgroundColor: color,
          }}
        />
        <span>Farbe</span>
      </button>
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HexColorPicker color={color} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

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
        // Added heading tracking
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        heading4: editor.isActive("heading", { level: 4 }),
        heading5: editor.isActive("heading", { level: 5 }),
        heading6: editor.isActive("heading", { level: 6 }),
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
      {/* Heading Buttons First */}
      {([1, 2, 3, 4, 5, 6] as Level[]).map((level) => (
        <button
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
            editor.isActive("heading", { level }) ? "bg-gray-300" : ""
          }`}
          aria-label={`Heading ${level}`}
          aria-pressed={editor.isActive("heading", { level })}
        >
          H{level}
        </button>
      ))}
      {/* Bold */}
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
      {/* Italic */}
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
      {/* Underline */}
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
      {/* Link */}
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
      {/* Bullet List */}
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
      {/* Ordered List */}
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
      {/* Blockquote */}
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
      {/* Horizontal Rule */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        className="px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
        aria-label="Horizontal Rule"
      >
        Trennlinie
      </button>
      {/* Color Picker */}
      <ColorPicker editor={editor} />
      {/* Emoji Picker */}
      <EmojiPickerButton editor={editor} />
    </div>
  );
};

export function ParagraphBlock({
  blockId,
  layoutId,
  zoneId,
  content,
  viewport = "desktop",
  readOnly = false,
}: ParagraphBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const { setFocus, resetFormats } = useEditorStore();

  const textSizeClass =
    viewport === "mobile"
      ? "text-base"
      : viewport === "tablet"
      ? "text-lg"
      : "text-xl";

  const editor = useEditor({
    editable: !readOnly, // Control editability based on readOnly prop
    immediatelyRender: false, // Add this line to prevent SSR hydration mismatch
    extensions: [
      // Load TextStyle and Color first
      TextStyle,
      Color,
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        blockquote: {
          HTMLAttributes: {
            class: "blockquote",
          },
        },
        // Ensure StarterKit doesn't overwrite TextStyle attributes if possible
        // (Note: StarterKit's bold/italic etc. might still interfere)
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
      EmojiExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        const html = editor.getHTML();
        updateBlockContent(blockId, layoutId, zoneId, html);
      }
    },
    onFocus: () => {
      // Only handle focus if not readOnly
      if (!readOnly) {
        setFocus(true);
      }
    },
    onBlur: () => {
      // Only handle blur if not readOnly
      if (!readOnly) {
        setFocus(false);
        resetFormats();
      }
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none ${readOnly ? "cursor-default" : ""}`, // Add cursor style for readOnly
      },
      handleDOMEvents: {
        // Removed mousedown handler to fix selection issue
        // --- Reverted drag event handlers ---
        // dragover: ... (removed)
        // drop: ... (removed)
        // --- End reverted drag event handlers ---
      },
      handleKeyDown: (view, event) => {
        // Prevent all keydown events if readOnly
        if (readOnly) {
          return true;
        }
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

  // Ensure editor is destroyed when component unmounts or readOnly changes
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="h-full flex flex-col relative">
      {editor && !readOnly && <TiptapToolbar editor={editor} />}
      {editor ? ( // Always render EditorContent if editor exists
        <EditorContent
          editor={editor}
          className={`h-full overflow-y-auto ${
            !readOnly ? "border border-gray-300" : "" // Only add border if editable
          } rounded p-2 mt-2 tiptap-paragraph-editor ${textSizeClass} not-prose`} // Added not-prose
        />
      ) : (
        // Fallback for initial render or if editor fails (shouldn't happen with editable prop)
        <div
          className={`prose prose-sm max-w-none ${textSizeClass} p-2`} // Add basic styling
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
