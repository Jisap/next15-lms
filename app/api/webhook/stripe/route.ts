import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import Stripe from "stripe";


// Stripe conecta con nuestro webhook y nos notifica cuando el usuario ha pagado

export async function POST(req: Request) {
  const body = await req.text();                                     // 1º obtenemos el body de la petición

  const headerList = await headers();

  const signature = headerList.get("Stripe-Signature") as string;;   // y la signature de la petición
  if (!signature) {
    return new Response("No signature header", {
      status: 400,
    });
  }

  let event: Stripe.Event;                                           // 2º Verificamos la firma

  try {

    event = Stripe.webhooks.constructEvent(                          // Confirma que la petición viene realmente de Stripe y no ha sido manipulada. Usa un "secreto" que solo tú y Stripe conocen.
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

  } catch (error) {  
    return new Response("Webhook error", { status: 400 })            // Si la firma no es válida, rechaza la petición
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if(event.type === "checkout.session.completed"){                   // 3º Filtramos el tipo de evento
    const courseId = session.metadata?.courseId;                     // Se extraen los datos de la session
    const customerId = session.customer as string;
    
    if(!courseId){
      throw new Error("Course id not found in metadata")
    }

    const user = await prisma.user.findUnique({                      
      where: {                                                       // Buscamos el usuario por su id de stripe
        stripeCustomerId: customerId 
      }
    })

    if(!user){
      throw new Error("User not found")
    }

    await prisma.enrollment.update({                                  // Buscamos la inscripción del usuario por su id de stripe
      where: {
        id: session.metadata?.enrollmentId as string
      },
      data: {
        userId: user.id,
        courseId: courseId,
        amount: session.amount_total as number,
        status: "Active"                                              // Actualizamos el status a "Active"
      },
    });
  }

  return new  Response(null, { status: 200 });                        // Respondemos a Stripe con un 200 OK
}