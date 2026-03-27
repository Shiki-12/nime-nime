import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  // Auth guard: must be logged in
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  // NSFW guard: read directly from DB to prevent stale-token bypass
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nsfwEnabled: true },
  });

  if (!dbUser?.nsfwEnabled) {
    return notFound();
  }

  return (
    <>
      <HentaiNavbar userName={session.user.name ?? "User"} />
      {children}
    </>
  );
}