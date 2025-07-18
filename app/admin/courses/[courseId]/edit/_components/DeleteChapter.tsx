
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteChapter } from "../action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";




export const DeleteChapter = ({
  chapterId,
  courseId
}: {
  chapterId: string;
  courseId: string;
}) => {

  const [Open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = async () => {

    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteChapter({
        chapterId: chapterId,
        courseId: courseId
      }));

      if (error) {
        toast.error("An unexpected error occured. Please try again later.");
        return;
      }

      if (result.status === "success") {
        toast.success("Chapter deleted successfully");
        setOpen(false);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    })
  }

  return (
    <AlertDialog open={Open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the chapter and all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={onSubmit}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}