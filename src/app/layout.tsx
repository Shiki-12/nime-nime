import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import SyncOnLogin from "@/components/SyncOnLogin";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/hooks/useTheme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nime-nime.web.id'),
  title: 'Nimenime - Nonton Anime Sub Indo',
  description: 'Nonton anime subtitle Indonesia gratis, update setiap hari dengan kualitas HD hanya di Nimenime.',
  openGraph: {
    title: 'Nimenime - Nonton Anime Sub Indo',
    description: 'Nonton anime subtitle Indonesia gratis, update setiap hari dengan kualitas HD.',
    url: 'https://nime-nime.web.id',
    siteName: 'Nimenime',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimenime - Nonton Anime Sub Indo',
    description: 'Nonton anime subtitle Indonesia gratis, update setiap hari dengan kualitas HD.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            <SyncOnLogin />
            <AnnouncementBar />
            <Navbar />
            <main className="pt-[calc(60px+var(--announcement-height,0px))]">{children}</main>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

