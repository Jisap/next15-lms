"use client"

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";

export const RichTextEditor = () => {

  const editor = useEditor({
    extensions: [
      StarterKit
    ]
  })

  return (
    <div>
      <Menubar editor={editor} />
    </div>
  )
}

