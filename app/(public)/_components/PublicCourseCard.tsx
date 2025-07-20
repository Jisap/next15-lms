import { PublicCourseType } from "@/app/data/course/get-all-courses"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useConstructUrl } from "@/hooks/use-construct-url"
import Image from "next/image"

interface iAppProps {
  data: PublicCourseType
}

export const PublicCourseCard = ({data}: iAppProps) => {

  const thumbnailUrl = useConstructUrl( data.filekey )

  return (
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>
      <Image 
        src={ thumbnailUrl }
        alt={ data.title }
        width={ 600 }
        height={ 400 }
        className="w-full rounded-t-xl aspect-video h-full object-cover"
      />
    </Card>
  )
}