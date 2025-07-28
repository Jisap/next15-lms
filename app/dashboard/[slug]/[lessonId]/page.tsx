import { getLessonContent } from "@/app/data/course/get-lesson-content"

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
      <h1>{data.title}</h1>
    </div>
  )
}

export default LessonContentPage 