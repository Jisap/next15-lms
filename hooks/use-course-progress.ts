"use client"

import { CourseSidebarDataType } from '@/app/data/course/get-course-sidebar-data';
import { use, useMemo } from 'react';


interface iAppProps {
  courseData: CourseSidebarDataType["course"]
}

interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export const useCourseProgress = ({ courseData }: iAppProps): CourseProgressResult => {
  return useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;

    courseData.chapter.forEach((chapter) => { // Recorremos cada capítulo
      chapter.lessons.forEach((lesson) => {   // Recorremos cada lección
        totalLessons ++;

        // Comprobamos si la lección está completa
        const isCompleted = lesson.lessonProgress.some(
          (progress) => progress.lessonId === lesson.id && progress.completed
        );

        if (isCompleted) {
          completedLessons ++
        }
      })
    })

    const progressPercentage = 
      totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    }
  },[courseData])

}