
import { adminGetLesson } from "@/app/data/admin/admin-get-lesson"
import { LessonForm } from "./_components/LessonForm";


interface Props{
  params: Promise<{ 
    lessonId: string;
    chapterId: string;
    courseId: string;
  }>;
}

const LessonIdPage = async({ params }: Props) => {

  const { lessonId, chapterId, courseId } = await params;

  const lesson = await adminGetLesson(lessonId);



  return (
    <LessonForm 
      data={lesson} 
      chapterId={chapterId} 
      courseId={courseId}
    />
  )
}

export default LessonIdPage