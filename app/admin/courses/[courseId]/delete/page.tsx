"use client"


import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tryCatch } from '@/hooks/try-catch'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { startTransition, useTransition } from 'react'
import { toast } from 'sonner'
import { DeleteCourse } from './action'
import { on } from 'events'
import { Loader2, Trash2 } from 'lucide-react'

const DeleteCourseRoute = () => {

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { courseId} = useParams<{ courseId: string }>();

  const onSubmit = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(DeleteCourse(courseId));

      if (error) {
        toast.error("An unexpected error occurred");
        return
      }

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message)
      }
    })
  };

  return (
    <div className='max-w-xl mx-auto w-full'>
      <Card className='mt-32'>
        <CardHeader>
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-between'>
          <Link href="/admin/courses" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>

          <Button variant="destructive" onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Deleting...
              </>
            ):(
              <>
                <Trash2 className='size-4' />
                Delete Course
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeleteCourseRoute