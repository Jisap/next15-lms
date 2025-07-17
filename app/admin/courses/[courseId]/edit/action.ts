"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import arcjet, { fixedWindow , detectBot } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet // Configuración de protección contra bots y ataques de fuerza bruta
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }))
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5
    })
  )

export const editCourse = async(
  data: CourseSchemaType,
  courseId: string

): Promise<ApiResponse> => {
  
  const user = await requireAdmin();

  try{

    const req = await request();                  // Reconstruye el objeto de la petición (ip del cliente, headers, cookies) 
    const decision = await aj.protect(req, {      // Se pasa a arcjet la petición que recibe la action para que pase por la protección contra bots y ataques de fuerza bruta.
      fingerprint: user.user.id
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You have been blocked due to rate limiting"
        }
      } else {
        return {
          status: "error",
          message: "Automated request blocked. If this is a mistake, please contact support"
        }
      }
    }

    const result = courseSchema.safeParse(data); // Validación de datos de formulario

    if(!result.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id
      },
      data: {
        ...result.data
      }
    })

    return {
      status: "success",
      message: "Course updated successfully"
    }
  }catch{
    return {
      status: "error",
      message: "Failed to update the course. Please check server logs for details."
    }
  }
}

export const reorderLessons = async(
  chapterId: string,
  lessons: { id:string; position: number }[],
  courseId: string
): Promise<ApiResponse> => {
  try{

    if(!lessons || lessons.length === 0){
      return {
        status: "error",
        message: "No lesson provided for reordering"
      }
    }

    const updates = lessons.map((lesson) => 
      prisma.lesson.update({
        where: {
          id:lesson.id,
          chapterId: chapterId
        },
        data: {
          position: lesson.position
        }
      })
    )

    await prisma.$transaction(updates); // Ejecuta las actualizaciones en una transacción

    revalidatePath(`/admin/courses/${courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen

    return {
      status: "success",
      message: "Lessons reordered successfully"
    }

  }catch{
    return {
      status: "error",
      message: "Failed to reorder lessons. Please check server logs for details."
    }
  }
}



