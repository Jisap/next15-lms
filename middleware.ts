import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);                 // El código busca una cookie de sesión. Esta cookie es la prueba de que el usuario ha iniciado sesión previamente.

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));       // Si no se encuentra una cookie de sesión, redirige al usuario a la página de inicio.
  }

  return NextResponse.next();                                      // Si SÍ hay cookie: El middleware considera que el usuario probablemente está autenticado y le permite continuar
}

export const config = {        // Specify the routes the middleware applies to       
  matcher: ["/admin/:path*"],  // Cuando un usuario intenta acceder a cualquier URL que comience con /admin/ este middleware se activa antes de que se renderice la página.
};