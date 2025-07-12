"use client"

import { useCallback, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import { Card, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { RenderEmptyState, RenderErrorState } from "./RenderState"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface UploaderStep {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting:boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video"
}


export const Uploader = () => {

  const [fileState, setFileState] = useState<UploaderStep>({ // state
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
  })

  const uploadFile = async(file:File) => { // setState
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }))

    try {
      const presignedResponse = await fetch("/api/s3/upload",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          asImage: true,
        }),
      });

      if(!presignedResponse.ok){
        toast.error("Failed to generate presigned url");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if(event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted)
            }));
          }
        }

        xhr.onload = () => {
          if(xhr.status === 200 || xhr.status === 204){
            setFileState((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              key: key,
            }));
            toast.success("File uploaded successfully");

            resolve()
          
          }else{
            reject(new Error("Upload failed..."))
          }

          xhr.onerror = () => {
            reject(new Error("Upload failed..."))
          };

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        }
      });

    } catch (error) {
      toast.error("Something went wrong");
      setFileState((prev) => ({
        ...prev,
        progress: 0,
        error: true,
        uploading: false,
      }));
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {  // 
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileState({
        file: file,
        uploading: true,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        error: false,
        id: uuidv4(),
        isDeleting: false,
        fileType: "image"
      })
    }
  }, []);

  const rejectedFiles = (fileRejection: FileRejection[]) => {
    if(fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files")
    
      const fileSizeToBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large"
      )

      if(fileSizeToBig){
        toast.error("File size is too large, max is 5MB")
      }

      if(tooManyFiles){
        toast.error("Too many files selected, max is 1")
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
     onDrop,
     accept: {"image/*": []},
     maxFiles: 1,
     multiple: false,
     maxSize: 5*1024*1024, // 5MB
     onDropRejected: rejectedFiles
  })

  return (
    <Card 
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive 
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}  
    >
      <CardContent className="flex items-center justify-center w-full h-full p-4">
        <input {...getInputProps()} />
        <RenderEmptyState  isDragActive={isDragActive} />
        {/* <RenderErrorState /> */}
      </CardContent>
    </Card>
  )
}