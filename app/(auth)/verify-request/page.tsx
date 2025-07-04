"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"



const VerifyRequest = () => {

  const router = useRouter();
  const [otp, setOtp] = useState("");                         // Aqui se almacena el OTP recibido por email
  const [emailPending, startTransition] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") as string;
  const isOtpCompleted = otp.length === 6;

  const verifyOtp = () => {
    startTransition(async () => {
      await authClient.signIn.emailOtp({                      // Se llama al API de better-auth para verificar el OTP
        email: email,
        otp: otp,
        fetchOptions: {                                       // better-auth busca en su base de datos el código OTP que generó para ese email. Compara si el código proporcionado es correcto y si no ha expirado.
          onSuccess: () => {
            toast.success('Email Verified')
            router.push("/")                                  // Si el código es correcto, redirecciona al usuario a la página de inicio
          },
          onError: (error) => {
            toast.error("Error verifying email/OTP")          // Si el código es incorrecto, muestra un error
          }
        }
      })
    })
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Please check your email
        </CardTitle>

        <CardDescription>
          We have sent a verification email code yo your email address. Please open the email and paste the code below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP 
            maxLength={6} 
            className="gap-2" 
            value={otp} 
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">Enter the 6 digit code sent to your email</p>
        </div>

        <Button 
          className="w-full" 
          onClick={verifyOtp} 
          disabled={emailPending || !isOtpCompleted}
        >
          {emailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ):(
              "Verify Account"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default VerifyRequest