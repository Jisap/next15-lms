"use server"

import { requireUser } from "@/app/data/user/require-user"
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/type"
import { redirect } from "next/navigation";

import Stripe from "stripe";


// Esta action  se asegura de que el usuario que intenta inscribirse en un curso tenga una 
// cuenta de cliente correspondiente en la plataforma de pagos Stripe. Si no la tiene, la crea.

export const enrollInCourseAction = async (courseId:string):Promise<ApiResponse | never> => {
  
  const user = await requireUser();                                              // 1º asegurarse de que hay un usuario con la sesión iniciada.      

  let checkoutUrl: string;

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

    const result = await prisma.$transaction(async (tx) => {                     // Garantiza que todas las operaciones sobre la base de datos (verificar si existe una inscripción, crearla o actualizarla) se completen con éxito como un solo bloque
      
      const existingEnrollment = await tx.enrollment.findUnique({                // Comprobamos si el usuario ya tiene una inscripción para ese curso. 
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        select: {
          status: true,
          id: true
        }
      })

      if(existingEnrollment?.status === "Active"){                               // Si ya existe una inscripción activa, se devuelve un mensaje
        return {
          status: "success",
          message: "You are already enrolled in this course"
        }
      }

      let enrollment;
      if(existingEnrollment){                                                    // Si existe simplemente una subscripción actualizamos el status a Pending
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id
          },
          data: {
            amount: course.price,
            status: "Pending",
            updatedAt: new Date()
          }
        })
      } else {                                                                  // Si no existe, creamos una nueva subscripción
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: course.price,
            status: "Pending",
          }
        })
      }

      const chekoutSession = await stripe.checkout.sessions.create({ // Creamos una especie de ticket de pago temporal y seguro
        customer: stripeCustomerId,
        line_items: [
          {
            price: "price_1RnkRt4agEHB5BalQThmdVHS",
            quantity: 1,
          },
        ],

        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          enrollmentId: enrollment.id
        }
      });

      return {
        enrollment: enrollment,                                    // checkoutSession devuelve el user que compro el producto
        checkoutUrl: chekoutSession.url                            // y la url de la compra
      }
    })

    checkoutUrl = result.checkoutUrl as string;                    // Creamos la url de compra desde el resultado de la transacción
  
  } catch (error) {
    if(error instanceof Stripe.errors.StripeError){
      return {
        status: "error",
        message: "Payment system error. Please try again later"
      }
    }
    return {
      status: "error",
      message: "Failed to enroll in course"
    }
  }

  redirect(checkoutUrl); // Redirigimos a la pasarela de pago de Stripe
}