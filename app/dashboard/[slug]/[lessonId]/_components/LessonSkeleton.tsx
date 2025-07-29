import { Skeleton } from "@/components/ui/skeleton"


export const LessonSkeleton = () => {
  return (
    <div className="flex flex-col h-full pl-6">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}