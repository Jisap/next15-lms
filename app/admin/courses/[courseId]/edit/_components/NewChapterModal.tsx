import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import {  useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chapterSchema, ChapterSchemaType } from "@/lib/zodSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { createChapter } from "../action";
import { toast } from "sonner";



export const NewChapterModal = ({ courseId }: { courseId: string }) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<ChapterSchemaType>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: "",
      courseId: courseId
    }
  });


  const onSubmit = async(values: ChapterSchemaType) => {
    startTransition(async() => {

      const {data: result, error} = await tryCatch(createChapter(values));
      if(error){
        toast.error("An unexpected error occured. Please try again later.");
        return;
      }

      if(result.status === "success"){
        toast.success("Chapter created successfully");
        form.reset();
        setIsOpen(false);
      }else if( result.status === "error"){
        toast.error(result.message);
      }
    })
  }
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="size-4" /> New Chapter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chapter</DialogTitle>
          <DialogDescription>
            What would you like to name your chapter ?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            className="space-y-8" 
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField 
              control={form.control}    // Se ocupa de la validación de los campos
              name="name"               // Nombre del campo
              render={({ field }) => (  // Renderiza el campo
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Name"
                      {...field} 
                    />    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
  
      </DialogContent>
    </Dialog>
  )
}