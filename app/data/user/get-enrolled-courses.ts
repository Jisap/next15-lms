import "server-only"
import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";


export const getEnrolledCourses = async() => {
  const user = await requireUser();

  const data = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "Active",
    },
    select: {
      Course: {
        select: {
          id: true,
          smallDescription: true,
          title: true,
          filekey: true,
          price: true,
          category: true,
          level: true,
          slug: true,
          duration: true,
          chapter: {
            select: {
              id: true,
              title: true,
              position: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  position: true,
                  lessonProgress: {
                    where: {
                      userId: user.id,
                    },
                    select: {
                      id: true,
                      completed: true,
                      lessonId: true,
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return data;
}

export type EnrolledCourseType = Awaited<ReturnType<typeof getEnrolledCourses>>[0]