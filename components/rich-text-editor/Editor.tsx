"use client"

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";
import TextAlign from "@tiptap/extension-text-align";

export const RichTextEditor = ({ field }: { field: any }) => {

  let initialContent: any = '<p>Hello world</p>';
  if (field.value) {
    try {
      initialContent = JSON.parse(field.value);
    } catch {
      // Si no es JSON válido, lo tratamos como texto plano para TipTap
      initialContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: field.value ? [{ type: "text", text: field.value }] : []
          }
        ]
      };
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none"
      },
    },

    immediatelyRender: false, // Disable the rendering of the editor immediately after it is mounted

    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON())); // Update the value of the field with the current editor content in formated JSON string
    },
    content: initialContent, // Usar el contenido inicial robusto
  })

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

