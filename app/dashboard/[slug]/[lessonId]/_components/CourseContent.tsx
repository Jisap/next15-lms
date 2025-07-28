import { LessonContentType } from "@/app/data/course/get-lesson-content"
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"


interface iAppProps {
  data: LessonContentType
}

export const CourseContent = ({ data }: iAppProps) => {
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <h1>Video player</h1>

      <div className="py-4 border-b">
        <Button variant="outline">
          <CheckCircle className="size-4 mr-2 text-green-500" />
          Mark as Complete
        </Button>
      </div>

      <div>
        <h1>{data.title}</h1>
        {data.description && (
          <RenderDescription json={JSON.parse(data.description)} />
        )}
      </div>
    </div>
  )
}