import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4}  from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3 } from "@/lib/S3Client";
import  { detectBot, fixedWindow } from "arcjet";
import arcjet from "@/lib/arcjet";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";


export const fileUploadSchema = z.object({ // Esquema de validación para la petición.
  fileName: z.string().min(1, { message: "File name is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

const aj = arcjet
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

export async function POST(request: Request) {                                  // Endpoint que maneja las peticiones POST para obtener la URL de subida.
  
  const session = await auth.api.getSession({                                    // Se obtiene la sesión del usuario.
    headers: await headers()
  });

  try {

    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string
    });

    if(decision.isDenied()){
      return NextResponse.json(
        {
          error: "You are not allowed to perform this action"
        }, 
        {
          status: 429
        })
    }

    const body = await request.json();                                          // Se obtiene el cuerpo de la petición.
    
    const validation = fileUploadSchema.safeParse(body);                        // 1. Se valida que el cuerpo sea correcto.
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { fileName, contentType, size } = validation.data;                    // Se extraen los datos de la petición.

    
    const uniqueKey = `${uuidv4()}-${fileName}}`                                // 2. Genera una clave única para el archivo para evitar sobreescrituras en S3.

    
    const command = new PutObjectCommand({                                      // 3. Crea un comando 'PutObject' que describe la subida que se va a realizar.
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey
    });
    
    const presignedUrl = await getSignedUrl(S3, command, {                      // 4. Genera la URL firmada y temporal. El cliente que la reciba tendrá permiso para ejecutar el comando anterior.
      expiresIn: 360, // URL expire in 6 minutos
    });

    const response = {                                                          // Se devuelve la respuesta al cliente, url y clave única
      presignedUrl,
      key: uniqueKey
    }

    
    return NextResponse.json(response);                                         // 5. Se parsea la respuesta

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate presigned url" }, 
      { status: 500 }
    );
  }
}