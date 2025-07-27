import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { description } from '../../../components/sidebar/chart-area-interactive';
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

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
  return (
    <Link
      className={buttonVariants({
        variant: "outline",
        className: cn("w-full p-2.5 h-auto justify-start transition-all")
      })}
      href="/"
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          <div className={cn(
            "size-5 rounded-full border-2 bg-background flex justify-center items-center"
          )}>
            <Play className={cn(
              "size-2.5 fill-current"
            )}/>
          </div>
        </div>

        <div>
          <p>
            {lesson.position}. {lesson.title}
          </p>
        </div>
      </div>
    </Link>
  )
}