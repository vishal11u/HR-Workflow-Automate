"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
