"use server"

import { requireUser } from "@/app/data/user/require-user"
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/type"


// Esta action  se asegura de que el usuario que intenta inscribirse en un curso tenga una 
// cuenta de cliente correspondiente en la plataforma de pagos Stripe. Si no la tiene, la crea.

export const enrollInCourseAction = async (courseId:string):Promise<ApiResponse> => {
  
  const user = await requireUser();                                              // 1º asegurarse de que hay un usuario con la sesión iniciada.      
  
  try {

    const course = await prisma.course.findUnique({                             // 2º Buscamos el curso en base de datos  
      where: {
        id: courseId
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      }
    })

    if(!course){
      return {
        status: "error",
        message: "Course not found"
      }
    }

    let stripeCustomerId:string                                                   // 3º Verificamos que el usuario sea un cliente de stripe
    const userWithStripeCustomerId = await prisma.user.findUnique({               // Para ello buscamos en bd si el usuario tiene ya un id de stripe guardado
      where: {
        id: user.id
      },
      select:{
        stripeCustomerId: true
      }
    })

    if(userWithStripeCustomerId?.stripeCustomerId){                               // Si ya existe, lo usamos
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId
    }else{                                                                        // Si no existe, lo creamos
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      })

      stripeCustomerId = customer.id                                              // Guardamos el id de stripe en la tabla de usuarios

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          stripeCustomerId: stripeCustomerId
        }
      })
    }

    return {
      status: "success",
      message: "Stripe customer created",
    }

  } catch (error) {
    return {
      status: "error",
      message: "Failed to enroll in course"
    }
  }
}