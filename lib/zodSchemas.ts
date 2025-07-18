import { description } from "@/components/sidebar/chart-area-interactive";
import { th } from "date-fns/locale";
import { title } from "process";
import z from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Development",
  "Bussiness",
  "Finance",
  "It & Software",
  "Office productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Education",
  "Food & Drink",
  "Travel",
  "Entertainment",
  "Sports",
  "Music",
  "Photography",
  "Videography",
  "Art",
  "Gaming",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, {message: "Title must be at least 3 characters long"})
    .max(100, {message: "Title must be at most 100 characters long"}),
  description: z
    .string()
    .min(3, {message: "Description must be at least 3 characters long"}),
  filekey: z
    .string()
    .min(1,{message: "Filekey is required"}),
  price: z
    .coerce.number()
    .min(1, {message: "Price must be a positive number"}),
  duration: z
    .coerce.number()
    .min(1, {message: "Duration must be at least 1 hours"})
    .max(500, {message: "Duration must be at most 500 hours"}),
  level: z.enum(courseLevels, {message: "Level is required"}),
  category: z.enum(courseCategories, {message: "Category is required"}),
  smallDescription: z
    .string()
    .min(3, {message: "Small description must be at least 3 characters long"})
    .max(200, {message: "Small description must be at most 200 characters long"}),
  slug: z.string()
    .min(3, {message: "Slug must be at least 3 characters long"}),
  status: z.enum(courseStatus, {message: "Status is required"}),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;




export const chapterSchema = z.object({
  name: z.string().min(3, {message: "Name must be at least 3 characters long"}),
  courseId: z.string().uuid({message: "Invalid course id"}),
});

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

export const lessonSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "Invalid course id" }),
  chapterId: z.string().uuid({ message: "Invalid chapter id" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" })
    .optional(),
  thumbnailKey: z
    .string()
    .optional(),
  videoKey: z
    .string()
    .optional(),
})

export type LessonSchemaType = z.infer<typeof lessonSchema>;