import { adminGetCourses } from "@/app/data/admin/admin-get-courses"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { AdminCourseCard, AdminCourseCardSkeleton } from "./_components/AdminCourseCard"
import { EmptyState } from "@/components/general/EmptyState"
import { Suspense } from "react"


const CoursesPage = () => {

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>
      
        <Link href="/admin/courses/create" className={buttonVariants()}>
          Create Course
        </Link>
      </div>

      <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
        <RenderCourses />
      </Suspense>
    </>
  )
}

export default CoursesPage

export const RenderCourses = async() => {
  const data = await adminGetCourses();
  return(
    <>
      {
        data.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Create a new course to get started"
            buttonText="Create Course"
            href="/admin/courses/create"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
            {data.map((course) => (
              <AdminCourseCard key={course.id} data={course} />
            ))}
          </div>
        )
      }
    </>
  )
}

export const AdminCourseCardSkeletonLayout = async() => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
      {Array.from({length: 4}).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  )
}

