import { getLessonContent } from "@/app/data/course/get-lesson-content"
import { CourseContent } from "./_components/CourseContent";
import { Suspense } from "react";
import { LessonSkeleton } from "./_components/LessonSkeleton";

interface iAppProps {
  params: Promise<{
    lessonId: string
  }>
}

const LessonContentPage = async ({ params }: iAppProps) => { // LessonContentPage se encarga de recibir los parámetros de la ruta y delega la carga de datos a LessonContentLoader.

  const { lessonId } = await params;

  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContentLoader lessonId={lessonId} />
    </Suspense>
  )
}

export default LessonContentPage 


const LessonContentLoader = async({ lessonId }:{ lessonId: string }) => { 
  
  const data = await getLessonContent(lessonId)

  return (
    <CourseContent data={data} />
  )
}