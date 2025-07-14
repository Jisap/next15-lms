"use client"

import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";

export async function CreateCouse(values: CourseSchemaType): Promise<ApiResponse>{
  try {
    const validation = courseSchema.safeParse(values);
    
    if(!validation.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: "sdsdfs"
      }
    });

    return {
      status: "success",
      message: "Course created successfully",
    }

  } catch (error) {
    return {
      status: "error",
      message: "Failed to create course",
    }
  }
}