"use client"

import { useEffect, useState } from "react"
import { generateHTML } from "@tiptap/html"
import { type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import parse from 'html-react-parser';

export const RenderDescription = ({ json }:{ json:JSONContent }) => {

  const [output, setOutput] = useState("");

  useEffect(() => {                              // La función generateHTML esta diseñada para ser usada solo en el navegador
    const generatedOutput = generateHTML(json, [ // useEffect solo se ejecuta en el lado del cliente después de que el componente se ha montado en el navegador
      StarterKit,                                // con useMemo nextjs 1º intenta prerenderizado en el lado del server -> useMemo ejecutaba la función en entorno de node -> error por entorno no adecuado
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
    setOutput(generatedOutput);
  }, [json]);

  return (
    <div className="prose dark:prose-invert prose-li:marker:text-primary">
      {parse(output)}
    </div>
  )
}
