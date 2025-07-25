import "server-only"
import { prisma } from "@/lib/db";



export const getAllCourses = async () => {

  //await new Promise((resolve) => setTimeout(resolve, 3000));


  const data = await prisma.course.findMany({
    where: {
      status: "Published"
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      filekey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
    }
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0]