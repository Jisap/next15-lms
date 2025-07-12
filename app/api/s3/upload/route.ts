import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { env } from "process";
import z from "zod";
import { v4 as uuidv4}  from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3 } from "@/lib/S3Client";


export const fileUploadSchema = z.object({ // Esquema de validación para la petición.
  fileName: z.string().min(1, { message: "File name is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

export async function POST(request: Request) {                                  // Endpoint que maneja las peticiones POST para obtener la URL de subida.
  
  try {
    const body = await request.json();
    
    const validation = fileUploadSchema.safeParse(body);                        // 1. Valida que el cuerpo de la petición sea correcto.
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { fileName, contentType, size } = validation.data;

    
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

    const response = {
      presignedUrl,
      key: uniqueKey
    }

    
    return NextResponse.json(response);                                         // 5. Devuelve la URL y la clave al cliente.

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate presigned url" }, 
      { status: 500 }
    );
  }
}