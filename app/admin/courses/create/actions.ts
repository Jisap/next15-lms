"use server"

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { headers } from "next/headers";

export async function CreateCouse(values: CourseSchemaType): Promise<ApiResponse>{

  try {

    const session = await auth.api.getSession({
      headers: await headers()
    });
    const validation = courseSchema.safeParse(values);
    
    if(!validation.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    const course = await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string
      }
    });

    return {
      status: "success",
      message: `Course "${course.title}" created successfully`,
    }

  } catch {
    return {
      status: "error",
      message: "Failed to create the course. Please check server logs for details.",
    }
  }
}