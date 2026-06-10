import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth-options";

/**
 * Landing page — redirects authenticated users to dashboard,
 * unauthenticated users to login.
 */
export default function Home() {
  redirect("/dashboard");
}
