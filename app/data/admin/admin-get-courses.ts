import "server-only"
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";



export const adminGetCourses = async () => {

  //await new Promise((resolve) => setTimeout(resolve, 3000));

  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      filekey: true,
      slug: true,
    }
  });

  return data;
}

export type AdminCourseType = Awaited<ReturnType<typeof adminGetCourses>>[0]