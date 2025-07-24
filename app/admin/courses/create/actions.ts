"use server"

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/type";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";



const aj = arcjet // Configuración de protección contra bots y ataques de fuerza bruta
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5
    })
  )

export async function CreateCouse(values: CourseSchemaType): Promise<ApiResponse>{

  const session = await requireAdmin();

  try {

    const req = await request();                  // Reconstruye el objeto de la petición (ip del cliente, headers, cookies) 
    const decision = await aj.protect(req, {      // Se pasa a arcjet la petición que recibe la action para que pase por la protección contra bots y ataques de fuerza bruta.
      fingerprint: session?.user.id
    });

    if(decision.isDenied()){
      if(decision.reason.isRateLimit()){
        return {
          status: "error",
          message: "You have been blocked due to rate limiting"
        }
      }else{
        return {
          status: "error",
          message: "Automated request blocked. If this is a mistake, please contact support"
        }
      }
    }

    const validation = courseSchema.safeParse(values); // Validación de datos de formulario
    
    if(!validation.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    const data = await stripe.products.create({ // Creación de producto de Stripe
      name: validation.data.title,
      description: validation.data.smallDescription,
      default_price_data: {
        currency: "usd",
        unit_amount: validation.data.price * 100,
      }
    })

    const course = await prisma.course.create({  // Creación de curso en BD con la información de Stripe y los datos del formulario

      data: {
        ...validation.data,
        userId: session?.user.id,
        stripePriceId: data.default_price   as string 
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