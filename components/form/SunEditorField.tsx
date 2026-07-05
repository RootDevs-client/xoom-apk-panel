"use client";

import { useTheme } from "next-themes";
import { BadgeAlert } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { FontFamily } from "@tiptap/extension-text-style";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";

interface SunEditorFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  height?: string;
  className?: string;
  maxLength?: number;
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const btn = (label: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      data-active={active ? "true" : undefined}
      className="px-2 py-1 text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors data-[active=true]:bg-accent data-[active=true]:text-accent-foreground text-muted-foreground"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/30">
      {btn("Undo", () => editor.chain().focus().undo())}
      {btn("Redo", () => editor.chain().focus().redo())}
      <span className="w-px bg-border mx-1" />
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
      {btn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
      {btn("Sub", () => editor.chain().focus().toggleSubscript().run(), editor.isActive("subscript"))}
      {btn("Sup", () => editor.chain().focus().toggleSuperscript().run(), editor.isActive("superscript"))}
      <span className="w-px bg-border mx-1" />
      {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      {btn("P", () => editor.chain().focus().setParagraph().run(), editor.isActive("paragraph"))}
      <span className="w-px bg-border mx-1" />
      {btn("Left", () => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }))}
      {btn("Center", () => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }))}
      {btn("Right", () => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }))}
      <span className="w-px bg-border mx-1" />
      {btn("UL", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("OL", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      <span className="w-px bg-border mx-1" />
      {btn("Table", insertTable)}
      {btn("Link", addLink)}
      {btn("Image", addImage)}
      <span className="w-px bg-border mx-1" />
      {btn("Code", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
      {btn("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
      {btn("HR", () => editor.chain().focus().setHorizontalRule().run())}
      <span className="w-px bg-border mx-1" />
      {btn("Clear", () => editor.chain().focus().clearNodes().unsetAllMarks().run())}
    </div>
  );
}

function EditorWrapper({
  value,
  placeholder: placeholderText,
  height,
  isDark,
  onChange,
}: {
  value: string;
  placeholder: string;
  height: string;
  isDark: boolean;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholderText }),
      TextStyle,
      Color,
      Highlight,
      Subscript,
      Superscript,
      FontFamily,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none px-4 py-3 tiptap-editor",
        style: `min-height: ${height}px`,
      },
    },
  });

  return (
    <>
      <MenuBar editor={editor} />
      <div className={isDark ? "dark" : ""}>
        <style>{`
          .tiptap-editor {
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: ${isDark ? "#e0e0e0" : "#1a1a1a"};
            background: ${isDark ? "#1e1e1e" : "#ffffff"};
          }
          .tiptap-editor p { margin: 0.5em 0; }
          .tiptap-editor h1 { font-size: 1.75em; font-weight: 700; margin: 0.75em 0 0.5em; }
          .tiptap-editor h2 { font-size: 1.5em; font-weight: 600; margin: 0.75em 0 0.5em; }
          .tiptap-editor h3 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.5em; }
          .tiptap-editor ul, .tiptap-editor ol { padding-left: 1.5em; margin: 0.5em 0; }
          .tiptap-editor li { margin: 0.25em 0; }
          .tiptap-editor blockquote {
            border-left: 3px solid ${isDark ? "#555" : "#ddd"};
            padding-left: 1em;
            margin: 0.5em 0;
            color: ${isDark ? "#aaa" : "#666"};
            font-style: italic;
          }
          .tiptap-editor pre {
            background: ${isDark ? "#2d2d2d" : "#f5f5f5"};
            border-radius: 4px;
            padding: 0.75em 1em;
            font-family: monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin: 0.5em 0;
          }
          .tiptap-editor code {
            background: ${isDark ? "#2d2d2d" : "#f5f5f5"};
            border-radius: 3px;
            padding: 0.15em 0.3em;
            font-size: 0.9em;
          }
          .tiptap-editor a { color: #ff642b; text-decoration: underline; }
          .tiptap-editor img { max-width: 100%; height: auto; border-radius: 4px; margin: 0.5em 0; }
          .tiptap-editor hr { border: none; border-top: 1px solid ${isDark ? "#444" : "#e5e5e5"}; margin: 1em 0; }
          .tiptap-editor table {
            width: 100%;
            border-collapse: collapse;
            margin: 0.5em 0;
            overflow: hidden;
          }
          .tiptap-editor th, .tiptap-editor td {
            border: 1px solid ${isDark ? "#444" : "#e5e5e5"};
            padding: 0.5em 0.75em;
            text-align: left;
          }
          .tiptap-editor th {
            background: ${isDark ? "#2a2a2a" : "#f9f9f9"};
            font-weight: 600;
          }
          .tiptap-editor p.is-editor-empty:first-child::before {
            color: ${isDark ? "#666" : "#aaa"};
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

export default function SunEditorField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Start writing...",
  required = false,
  height = "300",
  className = "",
  maxLength,
}: SunEditorFieldProps<T>) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const charCount = value ? value.replace(/<[^>]*>/g, "").length : 0;

        return (
          <div className={`w-full space-y-1 ${className}`}>
            {label && (
              <label className="text-sm font-dm-sans font-medium block">
                {label}
                {required && (
                  <span className="text-red-500 ml-0.5 font-bold">*</span>
                )}
              </label>
            )}

            <div
              className={`rounded-lg overflow-hidden border transition-colors ${
                error ? "border-red-400" : "border-input"
              }`}
            >
              <EditorWrapper
                value={value ?? ""}
                placeholder={placeholder}
                height={height}
                isDark={isDark}
                onChange={onChange}
              />
            </div>

            <div className="flex items-center justify-between">
              {error && (
                <div className="flex items-center gap-1">
                  <BadgeAlert className="text-red-500 h-4 w-4 shrink-0" />
                  <p className="text-red-500 text-xs font-dm-sans font-medium">
                    {error.message}
                  </p>
                </div>
              )}
              {maxLength && (
                <span
                  className={`text-xs ml-auto ${
                    charCount > maxLength
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {charCount}/{maxLength}
                </span>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
