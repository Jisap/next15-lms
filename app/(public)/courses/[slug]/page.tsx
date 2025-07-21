import { getIndividualCourse } from '@/app/data/course/get-course'
import { useConstructUrl } from '@/hooks/use-construct-url'
import Image from 'next/image'
import React from 'react'

interface iAppProps {
  params: Promise<{
    slug: string
  }>
}


const SlugPage = async({ params }: iAppProps) => {
  
  const { slug } = await params;

  const course = await getIndividualCourse(slug);

  const thumbnailUrl = useConstructUrl( course.filekey )

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 mt-5'>
      <div className='order-1 lg:col-span-2'>
        <div className='relative aspect-video w-full overflow-hidden rounded-xl shadow-lg'>
          <Image 
            src={thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"	
          />
        </div>
      </div>
    </div>
  )
}

export default SlugPage