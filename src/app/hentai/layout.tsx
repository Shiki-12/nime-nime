import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import HentaiNavbar from "./HentaiNavbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "18+ Section",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function HentaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard: if not logged in, pretend the page doesn't exist
  const session = await auth();
  if (!session?.user) {
    return notFound();
  }

  return (
    <>
      <HentaiNavbar userName={session.user.name ?? "User"} />
      {children}
    </>
  );
}