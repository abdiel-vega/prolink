import { DashboardSidebar } from "@/components/layouts/DashboardSidebar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-4 pl-0.5">
        {children}
      </main>
    </div>
  );
}
