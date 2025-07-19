import { cn } from "@/lib/utils"
import { CloudUploadIcon, ImageIcon, Loader2, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import Image from "next/image"

export const RenderEmptyState = ({isDragActive}: {isDragActive: boolean}) => {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon 
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary"
          )}
        />
      </div>

      <p className="text-base font-semibold text-foreground">
        Drag and drop your files here, or <span className="text-primary font-bold cursor-pointer">click to upload</span> 
      </p>

      <Button type="button" className="mt-4 w-fit">
        Select Files
      </Button>
    </div>
  )
}

export const RenderErrorState = () => {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon
          className={cn(
            "size-6 text-destructive",
            
          )}
        />
      </div>

      <p className="text-base font-semibold">
        Upload Failed
      </p>
      <p className="text-xl mt-1 text-muted-foreground">
        Something went wrong.
      </p>
      <Button 
        type="button"
        className=" mt-4"
      >
        Retry File Selection
      </Button>
    </div>
  )
}

export const RenderUploadedState = ({ 
  previewUrl, 
  isDeleting, 
  handleRemoveFile,
  fileType
} : { 
  previewUrl: string ,
  isDeleting: boolean,
  handleRemoveFile: () => void,
  fileType: "image" | "video"
}) => {
  
  return(
    <div className="relative group w-full h-full flex items-center justify-center">
      {fileType === "video" ? (
        <video 
          src={previewUrl}
          controls
          className="rounded-md w-full h-full"
        />
      ): (
        <Image 
          src={previewUrl}
          alt="uploaded file"
          fill
          className="object-contain p-2"
        />
      )}

      <Button
        variant="destructive"
        size="icon"
        onClick={handleRemoveFile}
        disabled={isDeleting}
        className={cn(
          "absolute top-4 right-4",
        )}
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ):(
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  )
}


export const RenderUploadingState = ({
  progress,
  file,
}:{
  progress: number,
  file: File
}) => {
  return(
    <div className="text-center flex justify-center items-center flex-col">
      <p>{progress}%</p>
      <p className="mt-2 text-sm font-medium text-foreground">Uploading...</p>
      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
        {file.name}
      </p>
    </div>
  )
}