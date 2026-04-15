import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="bg-background">
      <AppShell>{children}</AppShell>
    </div>
  );
}
