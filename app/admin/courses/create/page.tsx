"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { courseCategories, courseLevels, courseSchema, CourseSchemaType, courseStatus } from "@/lib/zodSchemas"
import { ArrowLeftIcon, Loader2, PlusIcon, SparkleIcon } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import slugify from "slugify"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor/Editor"
import { Uploader } from "@/components/file-uploader/Uploader"
import { useTransition } from "react"
import { tryCatch } from "@/hooks/try-catch"
import { CreateCouse } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet"



const CourseCreationPage = () => {

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      filekey: "",
      price: 0,
      duration: 0,
      level: "Beginner",
      category: "Development",
      status: "Draft",
      slug: "",
      smallDescription: "",
    }
  });

  const onSubmit = (values: CourseSchemaType) => {
    startTransition(async () => {
      const {data:result, error} = await tryCatch(CreateCouse(values));
      
      if(error){
        toast.error("An unexpected error occurred");
        return
      }

      if(result.status === "success"){
        toast.success(result.message);
        form.reset();
        router.push("/admin/courses");
      }else if(result.status === "error"){
        toast.error(result.message)
      }
    })
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/courses" 
          className={buttonVariants({
            variant: "outline",
            size: "icon"
          })}
        >
          <ArrowLeftIcon className="size-4"/>
        </Link>

        <h1 className="text-2xl font-bold">
          Create Courses
        </h1>
      </div>

     <Card>
       <CardHeader>
         <CardTitle>Basic Information</CardTitle>
         <CardDescription>
          Provide basic information about the course.
         </CardDescription>
       </CardHeader>

       <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField 
                control={form.control}    // Se ocupa de la validación de los campos
                name="title"              // Nombre del campo
                render={({ field }) => (  // Renderiza el campo
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end gap-4">
                <FormField
                  control={form.control}    
                  name="slug"              
                  render={({ field }) => (  
                    <FormItem className="w-full">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Slug"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-fit"
                  onClick={(() => {
                    const titleValue = form.getValues("title");
                    const slug = slugify(titleValue);
                    form.setValue("slug", slug, {shouldValidate: true});
                  })}
                >
                  Generate Slug <SparkleIcon className="ml-1" size={16} />
                </Button>
              </div>

              <FormField
                control={form.control}
                name="smallDescription"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Small Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Small Description"
                        className="min-h-[120px]"
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
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filekey"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Thumbnail image</FormLabel>
                    <FormControl>
                      <Uploader 
                        onChange={field.onChange}   // Cuando el value cambie esta función lo actualiza en form
                        value={field.value}         // El valor del state del uploader es el que react-hook-form tiene reservado para el campo fileKey
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}  
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {courseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Value" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {courseLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Duration"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {courseStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    Creating...
                    <Loader2 className="animate-spin ml-1" />
                  </>
                ):(
                  <>
                    Create Course <PlusIcon className="ml-1" size={16} />
                  </>
                )}
              </Button>
            </form>
          </Form>
       </CardContent>
     </Card>
    </>
  )
}

export default CourseCreationPage