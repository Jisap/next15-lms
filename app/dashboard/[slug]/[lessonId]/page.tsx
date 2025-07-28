import { getLessonContent } from "@/app/data/course/get-lesson-content"
import { CourseContent } from "./_components/CourseContent";

interface iAppProps {
  params: Promise<{
    lessonId: string
  }>
}

const LessonContentPage = async({ params }: iAppProps) => {

  const { lessonId } = await params;
  const data = await getLessonContent(lessonId)

  return (
    <div>
      <CourseContent data={data} />
    </div>
  )
}

export default LessonContentPage 