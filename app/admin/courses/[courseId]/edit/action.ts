"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import arcjet, { fixedWindow , detectBot } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { chapterSchema, ChapterSchemaType, courseSchema, CourseSchemaType, lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { title } from 'process';

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

  await requireAdmin();

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

export const reorderChapters = async(
  courseId: string,
  chapters: { id:string; position: number }[],
): Promise<ApiResponse> => {

  await requireAdmin();

  try{

    if(!chapters || chapters.length === 0){
      return {
        status: "error",
        message: "No chapter provided for reordering"
      }
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId
        },
        data: {
          position: chapter.position
        }
      })
    )

    await prisma.$transaction(updates); // Ejecuta las actualizaciones en una transacción

    revalidatePath(`/admin/courses/${courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen

    return {
      status: "success",
      message: "Chapters reordered successfully"
    }

  }catch{
    return {
      status: "error",
      message: "Failed to reorder chapters. Please check server logs for details."
    }
  }
}

export const createChapter = async(values: ChapterSchemaType): Promise<ApiResponse> => {
  
  await requireAdmin();

  try{

    const result = chapterSchema.safeParse(values); // Validación de datos de formulario
    if(!result.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    await prisma.$transaction(async(tx) => {      // Iniciamos una transacción para que se ejecuten todas las operaciones en la misma transacción

      // tx representa la transacción actual
      // que se compone de dos partes:
      const maxPos = await tx.chapter.findFirst({ // 1º Busca el capítulo con la posición más alta para el curso actual. Esto se hace para saber en que posición debe insertarse el nuevo capítulo (simempre al final)
        where: {
          courseId: result.data.courseId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        }
      })

      await tx.chapter.create({                   // 2º Crea el nuevo registro en la tabla de capítulos 
        data:{
          title : result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1  // Si maxPos es undefined -> valor por defecto es 0 y a este se le suma 1 
        }                                        // Si maxPos es un número -> se suma 1 al valor de maxPos
      })
    })

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen
  
    return {
      status: "success",
      message: "Chapter created successfully"
    }
    
  }catch{
    return {
      status: "error",
      message: "Failed to create chapter. Please check server logs for details."
    }
  }
}

export const createLesson = async(values: LessonSchemaType): Promise<ApiResponse> => {
  
  await requireAdmin();

  try{

    const result = lessonSchema.safeParse(values); // Validación de datos de formulario
    if(!result.success){
      return {
        status: "error",
        message: "Invalid form data"
      }
    }

    await prisma.$transaction(async(tx) => {      // Iniciamos una transacción para que se ejecuten todas las operaciones en la misma transacción

      // tx representa la transacción actual
      // que se compone de dos partes:
      const maxPos = await tx.lesson.findFirst({  // 1º Busca la lesson con la posición más alta para el curso actual. Esto se hace para saber en que posición debe insertarse la lesson (siempre al final)
        where: {
          chapterId: result.data.chapterId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        }
      })

      await tx.lesson.create({                    // 2º Crea el nuevo registro en la tabla de lessons
        data:{
          title : result.data.name,
          description: result.data.description,
          videoKey: result.data.videoKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          position: (maxPos?.position ?? 0) + 1   // Si maxPos es undefined -> valor por defecto es 0 y a este se le suma 1 
        }                                         // Si maxPos es un número -> se suma 1 al valor de maxPos
      })
    })

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen
  
    return {
      status: "success",
      message: "Lesson created successfully"
    }
    
  }catch{
    return {
      status: "error",
      message: "Failed to create lesson. Please check server logs for details."
    }
  }
}

export const deleteChapter = async({
  chapterId,
  courseId
}:{
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> => {
  
  await requireAdmin();
  
  try {
    
    const courseWithChapters = await prisma.course.findUnique({                // Buscamos el curso que contiene el chapter a eliminar
      where: {
        id: courseId
      },
      select: {
       chapter: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true
          }
       }
      }
    })

    if (!courseWithChapters){
      return {
        status: "error",
        message: "Course not found"
      }
    }

    const chapters = courseWithChapters.chapter;                               // Obtenemos los capítulos del curso: "chapters"

    const chapterToDelete = chapters.find((chap) => chap.id === chapterId);    // Desde "chapters" buscamos el capítulo a eliminar "chapterToDelete"

    if (!chapterToDelete){                                                     // Validación de la existencia del capítulo a eliminar
      return {
        status: "error",
        message: "Chapter not found in the course"
      }
    }

    const remainingChapters = chapters.filter((chap) => chap.id !== chapterId); // Obtenemos los capítulos restantes del curso: RemainingChapters

    const updates = remainingChapters.map((chap, index) => {                    // Actualizamos los capítulos restantes con la nueva posición
      return prisma.chapter.update({                                            // Al hacer map obtenemos un índice para cada chapter que queda y para eliminar el cero sumamos 1
        where: { id: chap.id },
        data: { position: index + 1}
      })
    })                                                                           // update es un array que contiene operaciones de actualización en prisma

    await prisma.$transaction([                                                  // Ejecutamos las actualizaciones en una transacción
      ...updates,                                                                // 1º Spread de las operaciones de actualización
      prisma.chapter.delete({                                                    // 2º Borrado del capítulo de la action
        where: { 
          id: chapterId,
        }
      })
    ]); // El resultado final es un único array con las operaciones de actualización y borrado

    revalidatePath(`/admin/courses/${courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen

    return {
      status: "success",
      message: "Chapter deleted and position reordered successfully"
    }


  } catch (error) {
    return {
      status: "error",
      message: "Failed to delete chapter.."
    }
  }
}
export const deleteLesson = async({
  chapterId,
  lessonId,
  courseId
}:{
  chapterId: string;
  lessonId: string;
  courseId: string;
}): Promise<ApiResponse> => {
  
  await requireAdmin();
  
  try {
    
    const chapterWithLessons = await prisma.chapter.findUnique({             // Buscamos el capítulo que contiene la lesson a eliminar
      where: {
        id: chapterId
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc"
          },
          select: {
            id: true,
            position: true
          }
        }
      }
    })

    if(!chapterWithLessons){
      return {
        status: "error",
        message: "Chapter not found"
      }
    }

    const lessons = chapterWithLessons.lessons;                              // Obtenemos las lessons del capítulo: "lessons"

    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId); // Desde lessons buscamos la lesson a eliminar "lessonToDelete"

    if(!lessonToDelete){                                                     // Validación de la existencia de la lesson
      return {
        status: "error",
        message: "Lesson not found in the chapter"
      }
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId); // Obtenemos las lessons restantes del capítulo: RemainingLessons

    const updates = remainingLessons.map((lesson, index) => {                    // Actualizamos las lessons restantes con la nueva posición
      return prisma.lesson.update({                                              // Al hacer map obtenemos un índice para cada lesson que queda y para eliminar el cero sumamos 1
        where: { id: lesson.id },
        data: { position: index + 1}
      })
    })                                                                           // update es un array que contiene operaciones de actualización en prisma

    await prisma.$transaction([                                                  // Ejecutamos las actualizaciones en una transacción
      ...updates,                                                                // 1º Spread de las operaciones de actualización
      prisma.lesson.delete({                                                     // 2º Borrado de la lesson de la action
        where: { 
          id: lessonId,
          chapterId: chapterId
        }
      })
    ]); // El resultado final es un único array con las operaciones de actualización y borrado

    revalidatePath(`/admin/courses/${courseId}/edit`) // Actualiza el cache de la página para que los cambios se reflejen

    return {
      status: "success",
      message: "Lesson deleted and position reordered successfully"
    }


  } catch (error) {
    return {
      status: "error",
      message: "Failed to delete lesson.."
    }
  }
}




