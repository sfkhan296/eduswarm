"use client";

import { ToolsSidebar } from "@/components/layout/ToolsSidebar";

/**
 * Client shell inside the server DashboardLayout.
 * Language state lives in LanguageContext (root layout) — no duplication here.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolsSidebar />
      {/* pl-[4.5rem] keeps content clear of the 56px sidebar strip */}
      <main className="flex-1 container mx-auto px-4 py-8 pl-[4.5rem]">
        {children}
      </main>
    </>
  );
}
