
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { env } from "./lib/env"
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Middleware de autenticación específico para rutas protegidas.
export async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);                 // El código busca una cookie de sesión. Esta cookie es la prueba de que el usuario ha iniciado sesión previamente.

   if (!sessionCookie) {
     return NextResponse.redirect(new URL("/", request.url));       // Si no se encuentra una cookie de sesión, redirige al usuario a la página de inicio.
   }

  return NextResponse.next();                                      // Si SÍ hay cookie: El middleware considera que el usuario probablemente está autenticado y le permite continuar
}

// Configuración del matcher para que el middleware se aplique a todas las rutas,
// excepto a los archivos estáticos y de imagen. Esto permite una protección global.
export const config = {
  matcher: ["/((?!_next/static|_next/image/favicon.ico|api/auth).*)"]
};

// Configuración de Arcjet para la protección contra bots en todas las rutas.
const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",                      // Regla para detectar y bloquear bots maliciosos.
      allow: [                           // Permite el paso a bots conocidos y beneficiosos (buscadores, monitores, etc.).
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "STRIPE_WEBHOOK"
      ]
    })
  ]
})

// Nextjs busca config cuando existe un archivo middleware y ejecuta 
// la función exportada como default en las rutas que coincidan con el matcher.
// createMiddleware ejecuta primero arcjet y luego authMiddleware.
//
export default createMiddleware(aj, async (request: NextRequest) => {                        // Después de la protección de Arcjet, se aplica la lógica de autenticación condicional.
  if (request.nextUrl.pathname.startsWith("/admin")) {                                       // Si la ruta es de administrador, se invoca el middleware de autenticación.
    return authMiddleware(request)
  }

  return NextResponse.next()                                                                 // Para cualquier otra ruta, se permite el paso (ya ha sido procesada por Arcjet).

});