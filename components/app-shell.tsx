"use client";

import Link from "next/link";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset">
        <SidebarHeader className="gap-3 px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/workspace" />}
                size="lg"
                isActive={pathname.startsWith("/workspace")}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    PathSeeker
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Route Intelligence
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/workspace" />}
                    isActive={pathname === "/workspace"}
                  >
                    Plan Route
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/workspace/history" />}
                    isActive={pathname === "/workspace/history"}
                  >
                    History
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/workspace/saved-places" />}
                    isActive={pathname === "/workspace/saved-places"}
                  >
                    Saved Places
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/workspace/saved-presets" />}
                    isActive={pathname === "/workspace/saved-presets"}
                  >
                    Saved Presets
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-3 px-2 py-3">
          <SidebarSeparator />
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8 ring-1 ring-border",
                  },
                }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {user?.firstName ?? "Signed In"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ?? ""}
                </p>
              </div>
            </div>
            <SignOutButton>
              <Button variant="ghost" size="sm" aria-label="Sign out">
                Sign out
              </Button>
            </SignOutButton>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-12 items-center border-b border-border/60 bg-background/90 px-3 backdrop-blur md:px-4">
          <SidebarTrigger />
          <p className="ml-3 text-xs text-muted-foreground">
            Minimal, traffic-aware route planning.
          </p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-3 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}