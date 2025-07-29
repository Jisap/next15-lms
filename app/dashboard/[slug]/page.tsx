import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { fi } from "date-fns/locale";
import { redirect } from "next/navigation";


interface iAppProps {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

const CourseSlugRoute = async({ params, children }: iAppProps) => {

  const { slug } = await params;

  const course = await getCourseSidebarData(slug); // Obtiene los datos del curso en base al slug de la url para un usuario suscrito  
  const firstChapter = course.course.chapter[0];
  const firstLesson = firstChapter.lessons[0];

  if(firstLesson){
    redirect(`/dashboard/${slug}/${firstLesson.id}`)
  }

  return (
    <div className="flex items-center justify-center h-full text-center">
      <h2 className="text-2xl font-bold mb-2">No lesson available</h2>
      <p className="text-muted-foreground">This course does not have any lessons yet.</p>
    </div>
  )
}

export default CourseSlugRoute