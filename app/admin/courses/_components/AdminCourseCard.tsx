import { AdminCourseType } from "@/app/data/admin/admin-get-courses"
import { Card, CardContent } from "@/components/ui/card"
import { useConstructUrl } from "@/hooks/use-construct-url"
import { School, TimerIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


interface iAppProps {
  data: AdminCourseType
}

export const AdminCourseCard = ({data}: iAppProps) => {

  const thumbnailUrl = useConstructUrl({ key: data.filekey })

  return (
    <Card className="group relative">
      {/* absolute dropdown */}
      <div>
      </div>

      <Image 
        src={thumbnailUrl }
        alt={ data.title }
        width={ 600 }
        height={ 400 }
        className="w-full rounded-t-lg aspect-video h-full object-cover"
      />

      <CardContent>
        <Link 
          href={`/admin/courses/${data.id}`} 
          className="font-medium text-lg line-clamp-2 hover:underline text-primary/70 group-hover:text-primary transition-colors">
          {data.title}
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.smallDescription}
        </p>

        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon  className="size-6 p-1 rounded-md text-primary bg-primary/10"/>
            <p className="text-sm text-muted-foreground">{data.duration}h</p>
          </div>
          <div className="flex items-center gap-x-2">
            <School  className="size-6 p-1 rounded-md text-primary bg-primary/10"/>
            <p className="text-sm text-muted-foreground">{data.level}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// https://jisap-lms.fly.storage.tigris.dev/