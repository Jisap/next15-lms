import "server-only"
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin"

export const adminGetRecentCourses = async () => {

  //await new Promise(resolve => setTimeout(resolve, 3000));

  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    //take:3,
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
    },
  })

  return data;
}