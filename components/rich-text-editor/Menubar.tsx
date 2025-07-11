
import { type Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"
import { BoldIcon, Heading, Heading1Icon, Heading2Icon, Heading3Icon, Italic, ListIcon, ListOrderedIcon, Strikethrough } from "lucide-react";
import { cn } from "@/lib/utils";

interface iAppProps {
  editor: Editor | null;
}

export const Menubar = ({ editor }: iAppProps) => {

  if(!editor) return null;

  return (
    <div className="border border-input rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
      <TooltipProvider>
        <div>
          {/* Bold */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("bold")}
                onPressedChange={()=> editor.chain().focus().toggleBold().run()}
                className={cn(
                  editor.isActive("bold") && "bg-muted text-muted-foreground"
                )}
              >
                <BoldIcon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Bold
            </TooltipContent>
          </Tooltip>
          {/* Italic */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  editor.isActive("italic") && "bg-muted text-muted-foreground"
                )}
              >
                <Italic />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Italic
            </TooltipContent>
          </Tooltip>
          {/* Strike */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  editor.isActive("strike") && "bg-muted text-muted-foreground"
                )}
              >
                <Strikethrough />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Strike
            </TooltipContent>
          </Tooltip>
          {/* h1 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  editor.isActive("heading", { level: 1 }) && "bg-muted text-muted-foreground"
                )}
              >
                <Heading1Icon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Heading 1
            </TooltipContent>
          </Tooltip>
          {/* h2 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  editor.isActive("heading", { level: 2 }) && "bg-muted text-muted-foreground"
                )}
              >
                <Heading2Icon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Heading 2
            </TooltipContent>
          </Tooltip>
          {/* h3 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(
                  editor.isActive("heading", { level: 3 }) && "bg-muted text-muted-foreground"
                )}
              >
                <Heading3Icon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Heading 3
            </TooltipContent>
          </Tooltip>
          {/* bullet list */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  editor.isActive("bulletList") && "bg-muted text-muted-foreground"
                )}
              >
                <ListIcon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Heading 1
            </TooltipContent>
          </Tooltip>
          {/* ordered list */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  editor.isActive("orderedList") && "bg-muted text-muted-foreground"
                )}
              >
                <ListOrderedIcon />
              </Toggle>
            </TooltipTrigger>

            <TooltipContent>
              Ordered List
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border mx-2"></div>
      </TooltipProvider>
    </div>
  )
}

