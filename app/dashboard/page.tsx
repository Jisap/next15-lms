import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";
import { title } from 'process';
import { description } from '../../components/sidebar/chart-area-interactive';





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
        <p>The courses you are enrolled in</p>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">Here you can see all the courses you can purchase.</p>
        </div>
      </section>
    </>
  )
}

export default DashboardPage