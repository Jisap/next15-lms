import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, Play } from "lucide-react"

interface iAppProps {
  course: CourseSidebarDataType["course"]
}

export const CourseSidebar = ({ course }: iAppProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 pr-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="size-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">
              {course.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {course.category}
            </p>
          </div>   
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">4/10 lessons</span>
          </div>

          <Progress value={55} className="h-1.5"/>
          <p className="text-xs text-muted-foreground">55% complete</p>
        </div>
      </div>

      <div className="py-4 pr-4 space-y-3">
        {course.chapter.map((chapter, index) => (
          <Collapsible key={chapter.id} defaultOpen={index === 0}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full p-3 h-auto flex items-center gap-2 group"
              >
                <div className="shrink-0">
                  <ChevronDown className="size-4 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180"/>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">
                    {chapter.position}: {chapter.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    {chapter.lessons.length} lessons
                  </p>
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-2">
              {chapter.lessons.map((lesson) => (
                <p key={lesson.id} className="">
                  {lesson.title}
                </p>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}