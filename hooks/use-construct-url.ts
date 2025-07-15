import { env } from "process"

interface Props{
  key: string
}

export const useConstructUrl = ({ key }: Props) => {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`
}