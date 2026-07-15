import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { redirect } from "next/navigation";
import { publicLocalConfig } from "@/server/local/config";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!publicLocalConfig().complete) redirect("/setup");

  return <DashboardShell>{children}</DashboardShell>;
}
