import "server-only"
import { prisma } from "@/lib/db";
import { requireUser } from "../user/require-user";
import { notFound } from "next/navigation";


export const getCourseSidebarData = async( slug: string ) => {
  const session = await requireUser();

  const course = await prisma.course.findUnique({ // Busca el curso en base al slug
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      filekey: true,
      duration: true,
      level: true,
      category: true,
      slug: true,
      chapter: {
        orderBy:{
          position: "asc"
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc"
            },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
            }
          }
        }
      }
    }
  });

  if(!course) {
    return notFound()
  }

  const enrollment = await prisma.enrollment.findUnique({ // Tiene que tener una inscripción activa para poder ver el curso
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: course.id,
      },
    },
  });

  if(!enrollment || enrollment.status !== "Active") {
    return notFound()
  }


  return {
    course,
  }
}


export type CourseSidebarDataType = Awaited<ReturnType<typeof getCourseSidebarData>>

