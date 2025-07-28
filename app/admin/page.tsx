import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { SectionCards } from "@/components/sidebar/section-cards";
import { adminGetEnrollmentStats } from "../data/admin/admin-get-enrollment-stats";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { adminGetRecentCourses } from "../data/admin/admin-get-recent-courses";
import { EmptyState } from "@/components/general/EmptyState";
import { AdminCourseCard, AdminCourseCardSkeleton } from "./courses/_components/AdminCourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Suspense } from "react";


export default async function AdminIndexPage() {

  const enrollmentData = await adminGetEnrollmentStats();

  return (
    <>
      <SectionCards />

      <ChartAreaInteractive data={enrollmentData} />    

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Recent Courses
          </h2>
          <Link
            className={buttonVariants({
              variant: "outline",
            })}
            href="/admin/courses"
          >
            View All Courses
          </Link>
        </div>

        <Suspense fallback={<RenderRecentCoursesSkeletonLayout />}>
          <RenderRecentCourses />
        </Suspense>
      </div>
    </>
  )
}


export const RenderRecentCourses = async() => {
  
  const data = await adminGetRecentCourses();
  if(data.length === 0) {
    return (
      <EmptyState 
        buttonText="Create a new Course"
        description="You haven't created any courses yet. Create some to see them here."
        title="You dont have any Courses yet!"
        href="/admin/courses/create"
      />
    )
  }

  return (
    <div className="relative px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {data.map((course) => (
            <CarouselItem key={course.id} className="md:basis-1/2">
              <AdminCourseCard data={course} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export const RenderRecentCoursesSkeletonLayout = async() => {
  return (
    <div className="relative px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <AdminCourseCardSkeleton key={index} />  
        ))}
      </div>
    </div>
)}
