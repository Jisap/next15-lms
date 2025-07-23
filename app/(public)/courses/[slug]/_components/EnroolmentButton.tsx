"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { enrollInCourseAction } from "../actions";
import { Loader2 } from "lucide-react";

export const EnroolmentButton = ({ courseId }: { courseId: string }) => {

  const [isPending, startTransition] = useTransition();
  

  const onSubmit = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(enrollInCourseAction(courseId)); // Nos aseguramos de que el usuario tenga una suscripción activa para el curso -> pasarela de pagos de stripe

      if (error) {
        toast.error("An unexpected error occurred");
        return
      }

      if (result.status === "success") {
        toast.success(result.message);   
      } else if (result.status === "error") {
        toast.error(result.message)
      }
    })
  };


  return (
    <Button 
      className="w-full"
      onClick={onSubmit}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="animate-spin size-4" />
          Loading...
        </>
      ) : (
        <>
          Enroll Now!
        </>
      )}
    </Button>
  )
}

