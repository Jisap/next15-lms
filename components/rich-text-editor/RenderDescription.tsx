"use client"

import { useMemo } from "react"
import { generateHTML } from "@tiptap/react"
import { type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import parse from 'html-react-parser';

export const RenderDescription = ({ json }:{ json:JSONContent }) => {

  const outPut = useMemo(() => { // Memorizamos una función que recoge el contenido del richEditor y convierte a html
    return generateHTML(json, [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ])
  },[json])


  return (
    <div className="prose dark:prose-invert prose-li:marker:text-primary">
      {parse(outPut)}
    </div>
  )
}

