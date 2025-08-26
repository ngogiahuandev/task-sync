"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardLayoutProps } from "@/types/dashboard";
import { defaultSidebarNavigation } from "@/components/dashboard/constance";

export function DashboardLayout({
  children,
  breadcrumbItems = [],
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar navigation={defaultSidebarNavigation} />
        <SidebarInset className="flex flex-col">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
