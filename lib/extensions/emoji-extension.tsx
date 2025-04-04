import { Extension } from "@tiptap/core";
import { Editor, ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import React, { FC, useCallback, useState, useRef, useEffect } from "react";
import EmojiPicker, {
  EmojiClickData,
  Theme,
  EmojiStyle,
} from "emoji-picker-react";

// Component that renders the emoji picker
const EmojiPickerComponent: FC<{
  editor: Editor;
  onClose: () => void;
}> = ({ editor, onClose }) => {
  // Handle emoji selection
  const handleEmojiSelect = useCallback(
    (emojiData: EmojiClickData) => {
      // Insert the emoji at current cursor position
      editor.commands.insertContent(emojiData.emoji);
      // Close the picker
      onClose();
    },
    [editor, onClose]
  );

  return (
    <div className="emoji-picker-container">
      <EmojiPicker
        onEmojiClick={handleEmojiSelect}
        theme={Theme.AUTO}
        lazyLoadEmojis={true}
        searchPlaceHolder="Emoji suchen..."
        width={300}
        height={350}
        previewConfig={{
          showPreview: true,
          defaultCaption: "Emoji auswählen",
        }}
        skinTonesDisabled
        searchDisabled={false}
        emojiStyle={EmojiStyle.NATIVE}
      />
    </div>
  );
};

// The actual Tiptap extension
const EmojiExtension = Extension.create({
  name: "emojiPicker",
});

export default EmojiExtension;

// Type definition for HTML elements with tippy instance attached
interface TippyNode extends HTMLElement {
  _tippy?: {
    hide: () => void;
    destroy: () => void;
  };
}

// Button component to add to the toolbar
export const EmojiPickerButton: FC<{ editor: Editor }> = ({ editor }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState(false);

  const toggleEmojiPicker = () => {
    if (!buttonRef.current) return;

    if (!isActive) {
      const tippyInstance = tippy(buttonRef.current, {
        content: document.createElement("div"),
        trigger: "manual",
        interactive: true,
        appendTo: document.body,
        placement: "bottom-start",
        animation: "shift-away",
        showOnCreate: true,
        theme: "light-border",
        maxWidth: "none",
        arrow: false,
        offset: [0, 8],
        zIndex: 9999,
        onHide: () => {
          setIsActive(false);
        },
        onDestroy: () => {
          setIsActive(false);
        },
      });

      // Create a div element to render our emoji picker into
      const container = document.createElement("div");
      container.className = "border-0 overflow-hidden";

      // Set up React render
      const reactRenderer = new ReactRenderer(EmojiPickerComponent, {
        props: {
          editor,
          onClose: () => {
            tippyInstance.hide();
            tippyInstance.destroy();
          },
        },
        editor,
      });

      // Set the content to our React component's element
      container.appendChild(reactRenderer.element);
      tippyInstance.setContent(container);

      // Show the tippy instance
      tippyInstance.show();

      // Update state
      setIsActive(true);
    } else {
      // If already active, hide any existing tippy instances on this element
      const button = buttonRef.current as TippyNode;
      if (button._tippy) {
        button._tippy.hide();
        button._tippy.destroy();
      }
      setIsActive(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    // Capture the current value of the ref inside the effect
    const button = buttonRef.current as TippyNode;

    return () => {
      // Use the captured value in cleanup
      if (button?._tippy) {
        button._tippy.destroy();
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={toggleEmojiPicker}
      className={`emoji-picker-button px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 ${
        isActive ? "bg-gray-300" : ""
      }`}
      aria-label="Emoji einfügen"
    >
      😀
    </button>
  );
};
