"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SyncOnLogin from "@/components/SyncOnLogin";
import { ThemeProvider } from "@/hooks/useTheme";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMaintenancePage = pathname === "/maintenance";

  if (isMaintenancePage) {
    return children;
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <SyncOnLogin />
        <AnnouncementBar />
        <Navbar />
        <main className="pt-[calc(60px+var(--announcement-height,0px))]">{children}</main>
        <Footer />
      </ThemeProvider>
    </SessionProvider>
  );
}
