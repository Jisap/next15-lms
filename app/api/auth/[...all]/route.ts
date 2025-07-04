// import { auth } from "@/lib/auth"; // path to your auth file
// import { toNextJsHandler } from "better-auth/next-js";

// export const { POST, GET } = toNextJsHandler(auth);


import { auth } from "@/lib/auth";
import arcjet from "@/lib/arcjet"
import ip from "@arcjet/ip";
import {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";



/**
 * Configuración para la validación de correos electrónicos de Arcjet.
 * @see https://docs.arcjet.com/email-validation/configuration
 */
const emailOptions = {
  mode: "LIVE", // Bloqueará las solicitudes. Usa "DRY_RUN" para solo registrar.
  // Bloquea correos que son desechables, inválidos o no tienen registros MX.
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

/**
 * Configuración para la detección de bots de Arcjet.
 * @see https://docs.arcjet.com/bot-protection/configuration
 */
const botOptions = {
  mode: "LIVE",
  // Configurado con una lista de bots permitidos.
  // Ver lista completa en: https://arcjet.com/bot-list
  allow: [], // Previene que los bots envíen el formulario.
} satisfies BotOptions;

/**
 * Configuración para el límite de tasa (rate limiting) de Arcjet.
 * @see https://docs.arcjet.com/rate-limiting/configuration
 */
const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m", // Cuenta las solicitudes en una ventana deslizante de 2 minutos.
  max: 5, // Permite 5 envíos dentro de esa ventana.
} satisfies SlidingWindowRateLimitOptions<[]>;

/**
 * Configuración para la protección de registros (signups) de Arcjet.
 * Combina las validaciones de email, bots y límite de tasa.
 * @see https://docs.arcjet.com/signup-protection/configuration
 */
const signupOptions = {
  email: emailOptions,
  // Usa un límite de tasa de ventana deslizante.
  bots: botOptions,
  // Sería inusual que un formulario se envíe más de 5 veces en 2 minutos
  // desde la misma dirección IP.
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

/**
 * Protege una solicitud (`NextRequest`) aplicando las reglas de seguridad de Arcjet.
 * @param req - El objeto NextRequest entrante.
 * @returns Una promesa que se resuelve con la decisión de Arcjet.
 */
async function protect(req: NextRequest): Promise<ArcjetDecision> {
  // Obtiene la sesión del usuario para usar su ID si está autenticado.
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Si el usuario está autenticado, usamos su ID como identificador.
  // Esto permite aplicar límites a través de todos sus dispositivos y sesiones.
  // De lo contrario, se usa la dirección IP.
  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1"; // Fallback a IP local si no hay ninguna.
  }

  // Si es una solicitud de registro, usa la regla especial `protectSignup`.
  // Ver: https://docs.arcjet.com/signup-protection/quick-start
  if (req.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
    // better-auth lee el cuerpo de la solicitud, por lo que necesitamos clonarla
    // para que Arcjet también pueda leerla.
    const body = await req.clone().json();

    // Si el email está en el cuerpo de la solicitud, podemos ejecutar
    // las validaciones de correo electrónico.
    if (typeof body.email === "string") {
      return arcjet
        .withRule(protectSignup(signupOptions))
        .protect(req, { email: body.email, fingerprint: userId });
    } else {
      // De lo contrario, solo aplicamos el límite de tasa y la detección de bots.
      return arcjet
        .withRule(detectBot(botOptions))
        .withRule(slidingWindow(rateLimitOptions))
        .protect(req, { fingerprint: userId });
    }
  } else {
    // Para todas las demás solicitudes de autenticación.
    return arcjet.withRule(detectBot(botOptions)).protect(req, { fingerprint: userId });
  }
}

// Crea los manejadores de ruta estándar de Next.js a partir de la configuración de better-auth.
const authHandlers = toNextJsHandler(auth.handler);

// Exporta el manejador GET directamente.
export const { GET } = authHandlers;

/**
 * Envuelve el manejador POST con las protecciones de Arcjet.
 * Cada solicitud POST pasará primero por Arcjet antes de llegar a la lógica de autenticación.
 */
export const POST = async (req: NextRequest) => {
  // Ejecuta las reglas de protección de Arcjet.
  const decision = await protect(req);

  console.log("Arcjet Decision:", decision);

  // Si Arcjet deniega la solicitud, responde con el estado apropiado.
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      // Límite de tasa excedido.
      return new Response(null, { status: 429 });
    } else if (decision.reason.isEmail()) {
      // El correo electrónico fue bloqueado.
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "El formato del correo electrónico es inválido. ¿Hay algún error tipográfico?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "No permitimos direcciones de correo electrónico desechables.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message =
          "Tu dominio de correo no tiene un registro MX. ¿Hay algún error tipográfico?";
      } else {
        // Esto es un comodín, pero lo anterior debería ser exhaustivo
        // basado en las reglas configuradas.
        message = "Correo electrónico inválido.";
      }

      return Response.json({ message }, { status: 400 });
    } else {
      // Denegado por otra razón (ej. bot, IP, etc.).
      return new Response(null, { status: 403 });
    }
  }

  // Si la solicitud es permitida, procede con el manejador de autenticación original.
  return authHandlers.POST(req);
};
