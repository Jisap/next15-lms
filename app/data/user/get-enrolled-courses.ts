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
              lessons: {
                select: {
                  id: true
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