import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user needs onboarding (no accounts = brand new user)
  try {
    const token = await getToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const res = await fetch(`${apiUrl}/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const accounts: unknown[] = data?.accounts ?? [];
      if (accounts.length === 0) {
        redirect("/onboarding");
      }
    }
  } catch {
    // If check fails, allow access — don't block users
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

