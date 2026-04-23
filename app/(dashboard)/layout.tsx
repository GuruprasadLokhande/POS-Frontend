"use client";

import { SidebarProvider } from "../context/sidebar-context";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/*
        Full viewport column layout.
        - h-screen + overflow-hidden = no body scroll
        - Topbar is sticky at top
        - main scrolls independently
      */}
      <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}