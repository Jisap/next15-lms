"use client"

import { ThemeToggle } from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { on } from "events";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default  function Home() {

  const router = useRouter()
  const { data: session } = authClient.useSession()

  const signOut = async() => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          toast.success('Signed out')
        }
      }
    })
  }

  return (
    <div className="p-24">
      <h1 className="text-2xl">hello world</h1>
      <ThemeToggle />

      {session ? (
        <div>
          <p>{session.user.name}</p>
          <Button onClick={signOut}>Logout</Button>
        </div>
      ):(
        <Button
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
      )}
    </div>
  );
}
