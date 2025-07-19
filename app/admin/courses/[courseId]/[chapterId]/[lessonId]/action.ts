"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";

export const updateLesson = async(
  values: LessonSchemaType,
  lessonId: string
):Promise<ApiResponse> => {
  
  await requireAdmin();

  try {
    
    const result = lessonSchema.safeParse(values);
    if(!result.success){
      return {
        status: "error",
        message: "Invalid data",
      }
    }

    await prisma.lesson.update({
      where:{
        id: lessonId
      },
      data: {
        title: result.data.name,
        description: result.data.description,
        thumbnailKey: result.data.thumbnailKey,
        videoKey: result.data.videoKey,
      },
    });

    return {
      status: "success",
      message: "Lesson updated successfully",
    }

  } catch (error) {
    return {
      status: "error",
      message: "Failed to update course",
    }
  }

}