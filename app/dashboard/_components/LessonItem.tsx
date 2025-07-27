import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { description } from '../../../components/sidebar/chart-area-interactive';

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
      })}
      href="/"
    >
      {lesson.title}
    </Link>
  )
}