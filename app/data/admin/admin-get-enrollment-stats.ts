import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin"



export const adminGetEnrollmentStats = async () => {
  await requireAdmin();

  const thirtyDaysAgo = new Date();                              // Obtiene la fecha actual

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);           // Establece una fecha de 30 días atrás

  const enrollments = await prisma.enrollment.findMany({         // Busca las suscripciones en los últimos 30 días
    where: {
      createdAt: {
        gte: thirtyDaysAgo,                                      // mayor o igual que la fecha de hace 30 días
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    }
  });

  const last30days: {date: string, enrollments: number}[] = [];          // Crear un array vacío para almacenar los datos de las suscripciones en los últimos 30 días. Solo las fechas, enrollments despues
    
  for(let i=29; i >=0; i--){                                             // Blucle for que recorra los últimos 30 días 
    const date = new Date();
    date.setDate(date.getDate() - i);                                    // Generamos dinámicamente cada una de las fechas de los últimos 30 días, desde la más lejana (hace 29 días) hasta la de hoy.
    last30days.push({                                                    // Agrega los datos de las suscripciones en los últimos 30 días al array
      date: date.toISOString().split("T")[0],                            // Splitea la fecha en formato ISO y extrae solo la fecha
      enrollments: 0
    });
  }

  enrollments.forEach((enrollment) => {
    // const enrollmentDate = enrollment.createdAt.toISOString().split("T")[0];    // Extrae la fecha de la suscripción
    // const dayIndex = last30days.findIndex(day => day.date === enrollmentDate);  // Busca el índice del array donde se encuentra la fecha de la suscripción
  
    // if(dayIndex !== -1){                                                        // Si el índice es diferente a -1, significa que la fecha de la suscripción está en el array
    //   last30days[dayIndex].enrollments++;                                       // Incrementa el valor de enrollments en el índice correspondiente
    // }

    const enrollmentDate = enrollment.createdAt.toISOString().split("T")[0];       // Extrae la fecha de la suscripción
    const day = last30days.find(day => day.date === enrollmentDate);               // Busca el objeto del día correspondiente a la fecha de la suscripción

    if (day) {                                                                     // Si se encuentra el día, incrementa el contador de inscripciones
      day.enrollments++;
    }
  })

    return last30days;
  }

  
