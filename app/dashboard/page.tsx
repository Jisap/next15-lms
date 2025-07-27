import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";
import { PublicCourseCard } from "../(public)/_components/PublicCourseCard";
import Link from "next/link";






const DashboardPage = async() => {

  const [courses, enrolledCourses] = await Promise.all([
    getAllCourses(),
    getEnrolledCourses(),
   
  ]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">Here you can see all the courses you have access to.</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState 
          title="No Courses purchased"
          description="You have not purchased any courses yet. Purchase a course to access it here."
          buttonText="Browse Courses"
          href="/courses"
        />
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(({ Course }) => (
            <Link key={Course.id} href={`/dashboard/${Course.slug}`}>
              {Course.title}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">Here you can see all the courses you can purchase.</p>
        </div>

        {courses.filter(                                      // iteramos sobre los cursos disponibles
          (course) => !enrolledCourses.some(                  // y por cada uno verificamos dentro de [enrolledCourses]      
          ({Course:enrolled}) => enrolled.id === course.id    // si existe alguno que coincida con el id del curso que se itera
        )).length === 0 ? (                                   // si no hay cursos que coincidan, mostramos el estado vacio
          <EmptyState 
            title="No Courses Available"
            description="You have already purchased all the courses available."
            buttonText="Browse Courses"
            href="/courses"
          />
        ): (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(                                      
                (course) => !enrolledCourses.some(                       
                  ({ Course: enrolled }) => enrolled.id === course.id    
                )).map((course) => (
                  <PublicCourseCard 
                    key={course.id} 
                    data={course} 
                  />
                ))}

          </div>
        )}
      </section>
    </>
  )
}

export default DashboardPage