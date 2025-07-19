"use client"

import { AdminLessonSingularType } from "@/app/data/admin/admin-get-lesson"
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { description } from '../../../../../../../components/sidebar/chart-area-interactive';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { updateLesson } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface iAProps {
  data: AdminLessonSingularType;
  chapterId: string;
  courseId: string;
}

export const LessonForm = ({ data, chapterId, courseId }: iAProps) => { // data es el lesson actual

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data.title,
      chapterId: chapterId,
      courseId: courseId,
      description: data.description ?? undefined,
      videoKey: data.videoKey ?? undefined,
      thumbnailKey: data.thumbnailKey ?? undefined,
    }
  });

  const onSubmit = (values: LessonSchemaType) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateLesson(values, data.id)); // TryCatch recibe una promesa y devuelve un objeto Result o error. La promesa viene de la action editCourse

      if (error) {
        toast.error("An unexpected error occurred");
        return
      }

      if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message)
      }
    })
  };
  return (
    <div className="">
      <Link 
        href={`/admin/courses/${courseId}/edit`}
        className={buttonVariants({
          variant: "outline",
          className: "mb-6"
        })}  
      >
        <ArrowLeft className="size-4" />
        <span>Go Back</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Configuration</CardTitle>
          <CardDescription>Configure the video and description for this lesson.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}  
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Lesson Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <Uploader 
                        onChange={field.onChange}
                        value={field.value}
                        fileTypeAccepted="image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <Uploader 
                        onChange={field.onChange}
                        value={field.value}
                        fileTypeAccepted="video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Lesson"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


