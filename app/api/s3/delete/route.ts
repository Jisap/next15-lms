import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";


const aj = arcjet
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5
    })
  )

export async function DELETE(request: Request) {

  const session = await requireAdmin(); 

  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error: "You are not allowed to perform this action"
        },
        {
          status: 429
        })
    }


    const body = await request.json();
    const key = body.key

    if(!key){
      return NextResponse.json(
        { error: "Missing or invalid object key"}, 
        { status: 400 }
      )
    }

    const command = new DeleteObjectCommand({ 
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES, 
      Key: key 
    });

    await S3.send(command);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {error: "Missing or invalid bject key"}, 
      { status: 500 }
    )
  }
}