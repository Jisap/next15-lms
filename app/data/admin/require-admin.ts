
import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export const requireAdmin = async () => {
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
}