"use client"

import { AdminLessonSingularType } from "@/app/data/admin/admin-get-lesson"
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { description } from '../../../../../../components/sidebar/chart-area-interactive';
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

interface iAProps {
  data: AdminLessonSingularType;
  chapterId: string;
  courseId: string;
}

export const LessonForm = ({ data, chapterId, courseId }: iAProps) => {

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
            <form className="space-y-6">
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


