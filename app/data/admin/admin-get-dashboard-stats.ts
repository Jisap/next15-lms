import "server-only"
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin"


export const adminGetDashboardStats = async() => {
  await requireAdmin();

  const [
    totalSignups, 
    totalCustomers, 
    totalCourses, 
    totalLessons
  ] = await Promise.all([
    // Total signups
    prisma.user.count(),
    // Total customers
    prisma.user.count({
      where: {
        enrollment: {
          some: {

          }
        }
      }
    }),
    // Total courses
    prisma.course.count(),
    // Total lessons
    prisma.lesson.count(),
  ]);

  return {
    totalSignups,
    totalCustomers,
    totalCourses,
    totalLessons
  }
}