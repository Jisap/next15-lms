import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import Image from "next/image";
import Link from "next/link";

interface iAppProps {
  data: PublicCourseType;
}

export const EnrolledCourseCard = ({ data }: iAppProps) => {
  const thumbnailUrl = useConstructUrl(data.filekey);

  return (
    <Link href={`/dashboard/${data.slug}`} className="relative h-full">
      <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>
      <Card className="group relative h-full w-full overflow-hidden rounded-xl aspect-video p-0">
        <Image
          src={thumbnailUrl}
          alt={data.title}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 "
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 p-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-primary group-hover:underline transition-colors">
            {data.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
};

export const EnrolledCourseCardSkeleton = () => {
  return (
    <Skeleton className="h-full w-full rounded-xl aspect-video" />
  );
};
