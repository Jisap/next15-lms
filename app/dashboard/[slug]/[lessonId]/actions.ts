"use server"

import { requireUser } from "@/app/data/user/require-user"
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { revalidatePath } from "next/cache";

export const MarklessonComplete = async (
  lessonId: string,
  slug: string
):Promise<ApiResponse> => {
  
  const session = await requireUser();

  try{

    await prisma.lessonProgress.upsert({ // upsert to update or create
      where: {
        userId_lessonId: {               // unique constraint
          userId: session.id,
          lessonId: lessonId
        },
      },
      update: {
        completed: true                  // update the record
      },
      create: {                          // create a new record if it doesn't exist
        userId: session.id,
        lessonId: lessonId,
        completed: true
      }
    })

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: "Lesson marked as complete",
    }

  }catch{
    return {
      status: "error",
      message: "Failed to mark lesson as complete",
    }
  }

}