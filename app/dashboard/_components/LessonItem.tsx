import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { description } from '../../../components/sidebar/chart-area-interactive';
import { cn } from "@/lib/utils";
import { Check, Play } from "lucide-react";

interface iAppProps {
  lesson: {
    id: string;
    title: string;
    position: number;
    description: string | null;
  };
  slug: string;
}


export const LessonItem = ({ lesson, slug }: iAppProps) => {

  const completed = true;

  return (
    <Link
      className={buttonVariants({
        variant: completed ? "secondary" : "outline",
        className: cn(
          "w-full p-2.5 h-auto justify-start transition-all",
          completed && "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200"
        )
      })}
      href="/"
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          {completed ? (
            <div className="size-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
              <Check className="size-3 text-white" />
            </div>
          ) : (
            <div className={cn(
              "size-5 rounded-full border-2 bg-background flex justify-center items-center"
            )}>
              <Play className={cn(
                "size-2.5 fill-current"
              )}/>
            </div>
          )}
        </div>

        <div>
          <p className={cn(
            "text-xs font-medium truncate",
            completed && "text-green-800 dark:text-green-200"
          )}>
            {lesson.position}. {lesson.title}
          </p>
        </div>
      </div>
    </Link>
  )
}