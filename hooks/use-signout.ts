"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"



export const useSignout = () => {
  
  const router = useRouter()
  
  const handleSignOut = async () => {

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          toast.success('Signed out')
        },
        onError: () => {
          toast.error('Error signing out')
        }
      }
    })
  }

  return handleSignOut
}

