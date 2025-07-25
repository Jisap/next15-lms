import "server-only"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db";
import { headers } from "next/headers"


export const checkifCourseBought = async (courseId:string):Promise<boolean> => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if(!session?.user) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { // Selector especial que une dos campos
        courseId: courseId,
        userId: session.user.id
      },
    },

    select: {
      status: true
    }
  })

  return enrollment?.status === "Active" ? true : false;

}