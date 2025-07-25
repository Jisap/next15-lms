import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins"
import { resend } from "./resend";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({email, otp}){
        const { data, error } = await resend.emails.send({   // Tranporter usado para enviar el OTP al usuario
          from: 'Jisap LMS <onboarding@resend.dev>',
          to: [email],
          subject: 'Jisap LMS - Verify your email',
          html: `<p>YourOTP is <strong>${otp}</strong></p>`,
        });
      }
    }),
    admin() // Da toda la lógica de backend para un panel de administración, permitiéndote a ti centrarte únicamente en construir la interfaz de usuario (UI) que consuma estos servicios.
  ]
})