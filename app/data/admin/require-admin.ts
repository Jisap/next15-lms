
import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * `requireAdmin` es una función asíncrona que verifica si el usuario actual tiene una sesión activa y si su rol es 'admin'.
 * Utiliza `React.cache` para memoizar el resultado de la obtención de la sesión durante un único ciclo de renderizado en el servidor.
 *
 * @description
 * ¿Por qué se usa `React.cache`?
 * En una aplicación Next.js con Server Components, es común que múltiples componentes en el mismo árbol de renderizado
 * necesiten acceder a la misma información, como los datos de la sesión del usuario. Sin `cache`, cada llamada a `requireAdmin`
 * (por ejemplo, en diferentes layouts o componentes) ejecutaría la lógica de `auth.api.getSession` repetidamente,
 * lo que resultaría en múltiples consultas a la base de datos o al servicio de autenticación para la misma petición.
 *
 * `React.cache` envuelve la función y se asegura de que, dentro de un mismo renderizado en el servidor, la función
 * solo se ejecute una vez. Las llamadas subsecuentes a `requireAdmin` en el mismo ciclo de renderizado devolverán
 * el resultado cacheado (la sesión del usuario o la redirección), mejorando significativamente el rendimiento.
 *
 * @returns {Promise<import("better-auth").Session | never>} - Devuelve la sesión del usuario si es un administrador.
 * De lo contrario, redirige al usuario a '/login' o '/not-admin' y nunca resuelve la promesa.
 */

export const requireAdmin = cache(async() => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if(!session){
    return redirect("/login")
  }

  if(session.user.role !== "admin"){
    return redirect("/not-admin")
  }

  return session;
})