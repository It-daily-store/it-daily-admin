"use client";

import "./editor.css";
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu } from "@tiptap/react/menus";
import { TableKit } from "@tiptap/extension-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  LinkIcon,
  Link2OffIcon as LinkOff,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

const extensions = [
  StarterKit.configure({
    // Disable the default code block to use our enhanced one
    codeBlock: false,
  }),
  TextStyle,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-600 underline hover:text-blue-800",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TableKit.configure({
    table: { resizable: true },
  }),
];

interface MenuBarProps {
  editor: any;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showCodeBlockModal, setShowCodeBlockModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const codeLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
    { value: "json", label: "JSON" },
    { value: "bash", label: "Bash" },
    { value: "sql", label: "SQL" },
    { value: "php", label: "PHP" },
    { value: "text", label: "Plain Text" },
  ];

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isUnderline: ctx.editor.isActive("underline") ?? false,
      canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      isLink: ctx.editor.isActive("link") ?? false,
      canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
      isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
      isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
      currentHeading: ctx.editor.isActive("heading", { level: 1 })
        ? "1"
        : ctx.editor.isActive("heading", { level: 2 })
          ? "2"
          : ctx.editor.isActive("heading", { level: 3 })
            ? "3"
            : ctx.editor.isActive("heading", { level: 4 })
              ? "4"
              : ctx.editor.isActive("heading", { level: 5 })
                ? "5"
                : ctx.editor.isActive("heading", { level: 6 })
                  ? "6"
                  : ctx.editor.isActive("paragraph")
                    ? "p"
                    : "",
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
      isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }) ?? false,
      canUndo: ctx.editor.can().chain().undo().run() ?? false,
      canRedo: ctx.editor.can().chain().redo().run() ?? false,
    }),
  });

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleAddImage = () => {
    const url = imageUrl.trim();
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setImageUrl("");
      setShowImageModal(false);
    }
  };

  const handleAddCodeBlock = () => {
    editor.chain().focus().setCodeBlock({ language: selectedLanguage }).run();
    setShowCodeBlockModal(false);
  };

  const handleHeadingChange = (value: string) => {
    if (value === "p") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border-border bg-card sticky top-0 z-50 w-full border-b p-1">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editorState.canUndo}
            title="Undo"
            className="size-[30px] shadow-none"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size={"icon"}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editorState.canRedo}
            title="Redo"
            className="size-[30px] shadow-none"
          >
            <Redo className="h-4 w-4" />
          </Button>
          {/* Text Formatting */}
          <Button
            type="button"
            variant={editorState.isBold ? "default" : "outline"}
            size={"icon"}
            className="size-[30px] shadow-none"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isItalic ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic}
            title="Italic"
            className="size-[30px] shadow-none"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isUnderline ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editorState.canUnderline}
            title="Underline"
            className="size-[30px] shadow-none"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isStrike ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editorState.canStrike}
            title="Strikethrough"
            className="size-[30px] shadow-none"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isCode ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editorState.canCode}
            title="Code"
            className="size-[30px] shadow-none"
          >
            <Code className="h-4 w-4" />
          </Button>

          {/* Headings */}
          <Select
            value={editorState.currentHeading}
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger
              size={"sm"}
              className="bg-background max-w-24 gap-1 px-1 py-1 text-sm"
            >
              <SelectValue placeholder="Heading"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Paragraph</SelectItem>
              <SelectItem value={"1"}>Heading 1</SelectItem>
              <SelectItem value={"2"}>Heading 2</SelectItem>
              <SelectItem value={"3"}>Heading 3</SelectItem>
              <SelectItem value={"4"}>Heading 4</SelectItem>
              <SelectItem value={"5"}>Heading 5</SelectItem>
              <SelectItem value={"6"}>Heading 6</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button
                        type="button"
                        variant={editorState.isHeading1 ? 'default' : 'outline'}
                        size={'icon'}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 1 }).run()
                        }
                        title="Heading 1"
                        className="size-[30px] shadow-none"
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant={editorState.isHeading2 ? 'default' : 'outline'}
                        size={'icon'}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                        title="Heading 2"
                        className="size-[30px] shadow-none"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant={editorState.isHeading3 ? 'default' : 'outline'}
                        size={'icon'}
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }
                        title="Heading 3"
                        className="size-[30px] shadow-none"
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button> */}

          {/* Text Alignment */}
          <Button
            type="button"
            variant={editorState.isAlignLeft ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
            className="size-[30px] shadow-none"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isAlignCenter ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
            className="size-[30px] shadow-none"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isAlignRight ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
            className="size-[30px] shadow-none"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isAlignJustify ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
            className="size-[30px] shadow-none"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          {/* Lists */}
          <Button
            type="button"
            variant={editorState.isBulletList ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            className="size-[30px] shadow-none"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editorState.isOrderedList ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className="size-[30px] shadow-none"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {/* Link */}
          {editorState.isLink ? (
            <Button
              type="button"
              variant="default"
              size={"icon"}
              onClick={handleRemoveLink}
              title="Remove Link"
              className="size-[30px] shadow-none"
            >
              <LinkOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size={"icon"}
              onClick={() => setShowLinkModal(true)}
              title="Add Link"
              className="size-[30px] shadow-none"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Additional options */}
          <Button
            type="button"
            variant={editorState.isBlockquote ? "default" : "outline"}
            size={"icon"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
            className="size-[30px] shadow-none"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="url"
              placeholder="Enter URL (https://example.com)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="url"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImage}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Block Dialog */}
      <Dialog open={showCodeBlockModal} onOpenChange={setShowCodeBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Code Block</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {codeLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCodeBlockModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCodeBlock}>Add Code Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface TipTapEditorProps {
  key?: string;
  content?: string;
  onChange?: (html: string) => void;
  className?: string;
  placeholder?: string;
}

const Editor: React.FC<TipTapEditorProps> = ({
  key = "new",
  content = "",
  onChange,
  className = "",
  placeholder = "Start typing...",
}) => {
  const [showMenu] = React.useState(true);
  const [isEditable] = React.useState(true);

  const editor = useEditor({
    extensions,
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose tiptap-editor-content prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
        placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border-border bg-background relative overflow-y-auto rounded-md border ${className}`}
    >
      <style jsx global>{`
        /* Highlight.js styles for code blocks */
        .hljs {
          color: #c9d1d9;
          background: #0d1117;
        }
        .hljs-comment,
        .hljs-quote {
          color: #8b949e;
          font-style: italic;
        }
        .hljs-variable,
        .hljs-template-variable,
        .hljs-attribute,
        .hljs-tag,
        .hljs-name,
        .hljs-regexp,
        .hljs-link,
        .hljs-selector-id,
        .hljs-selector-class {
          color: #f85149;
        }
        .hljs-number,
        .hljs-meta,
        .hljs-literal,
        .hljs-type,
        .hljs-params {
          color: #79c0ff;
        }
        .hljs-string,
        .hljs-symbol,
        .hljs-bullet {
          color: #a5d6ff;
        }
        .hljs-title,
        .hljs-section {
          color: #d2a8ff;
          font-weight: bold;
        }
        .hljs-keyword,
        .hljs-selector-tag {
          color: #ff7b72;
        }
        .hljs-emphasis {
          font-style: italic;
        }
        .hljs-strong {
          font-weight: bold;
        }
      `}</style>
      <MenuBar editor={editor} />
      <div className="h-full min-h-[200px]">
        {editor && showMenu && (
          <BubbleMenu
            editor={editor}
            options={{ placement: "bottom", offset: 8 }}
          >
            <div className="bg-background flex gap-3 rounded-sm border p-1 text-sm shadow-lg">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`${editor.isActive("bold") ? "text-primary" : ""} cursor-pointer font-bold`}
                type="button"
              >
                Bold
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={
                  editor.isActive("italic")
                    ? "text-primary cursor-pointer italic"
                    : "cursor-pointer italic"
                }
                type="button"
              >
                Italic
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={
                  editor.isActive("strike")
                    ? "text-primary cursor-pointer line-through"
                    : "cursor-pointer line-through"
                }
                type="button"
              >
                Strike
              </button>
            </div>
          </BubbleMenu>
        )}
        <EditorContent key={key} editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
