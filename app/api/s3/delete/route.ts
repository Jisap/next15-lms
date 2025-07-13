import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const key = body.key

    if(!key){
      return NextResponse.json(
        { error: "Missing or invalid bject key"}, 
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