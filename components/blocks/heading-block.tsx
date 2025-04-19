"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useBlocksStore } from "@/store/blocks-store";
import { useEditorStore } from "@/store/editor-store";
import EmojiExtension, {
  EmojiPickerButton,
} from "@/lib/extensions/emoji-extension";
import type { Level } from "@tiptap/extension-heading";
import { HexColorPicker } from "react-colorful";
import "tippy.js/dist/tippy.css";

interface HeadingBlockProps {
  blockId: string;
  layoutId: string;
  zoneId: string;
  level?: Level;
  content: string;
  onChange: (data: { level: Level; content: string }) => void;
  readOnly?: boolean;
}

// Color picker component
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

// Toolbar component for the heading block
const HeadingToolbar = ({ editor }: { editor: Editor }) => {
  const { updateActiveFormats } = useEditorStore();

  // Update active formats when editor state changes
  useEffect(() => {
    const updateFormats = () => {
      updateActiveFormats({
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

  const headingLevels: Level[] = [1, 2, 3, 4, 5, 6];

  return (
    <div
      className="flex flex-wrap gap-1 mb-2 bg-white/50 z-10"
      role="toolbar"
      aria-label="Heading formatting"
    >
      {headingLevels.map((level) => (
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
      <ColorPicker editor={editor} />
      <EmojiPickerButton editor={editor} />
    </div>
  );
};

export function HeadingBlock({
  blockId,
  layoutId,
  zoneId,
  level = 1,
  content,
  onChange,
  readOnly = false,
}: HeadingBlockProps) {
  const { updateBlockContent } = useBlocksStore();
  const { setFocus, resetFormats } = useEditorStore();
  const editorRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextStyle,
      Color,
      EmojiExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateBlockContent(blockId, layoutId, zoneId, html);
      const currentLevel =
        ([1, 2, 3, 4, 5, 6] as Level[]).find((l) =>
          editor.isActive("heading", { level: l })
        ) || level;
      onChange({ level: currentLevel, content: html });
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
        // Removed mousedown handler to fix selection issue
        keydown: (_, event) => {
          // Prevent Enter key from creating new lines
          if (event.key === "Enter") {
            event.preventDefault();
            return true;
          }
          return false;
        },
        // Removed commented-out dragstart handler
      },
    },
  });

  // Set initial heading level
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.chain().focus().setHeading({ level }).run();
    }
  }, [editor, level]);

  return (
    <div className="h-full flex flex-col relative">
      {!readOnly && editor && <HeadingToolbar editor={editor} />}
      {editor && !readOnly ? (
        <EditorContent
          ref={editorRef}
          editor={editor}
          className="h-fit overflow-hidden border border-gray-300 rounded p-2 mt-2 tiptap-heading-editor"
        />
      ) : (
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
