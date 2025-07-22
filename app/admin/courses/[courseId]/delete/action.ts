"use server"

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
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

export const DeleteCourse = async(courseId: string):Promise<ApiResponse> => {
  
  const session = await requireAdmin();

  try {

    const req = await request();                  // Reconstruye el objeto de la petición (ip del cliente, headers, cookies) 
    const decision = await aj.protect(req, {      // Se pasa a arcjet la petición que recibe la action para que pase por la protección contra bots y ataques de fuerza bruta.
      fingerprint: session?.user.id
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

    await prisma.course.delete({
      where: {
        id: courseId
      }
    })

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deleted successfully",
    }

  } catch (error) {
    return {
      status: "error",
      message: "Failed to delete course",
    }
  }

}

