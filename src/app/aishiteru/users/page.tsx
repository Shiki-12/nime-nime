import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import { RoleSelect, DeleteButton } from "./UserActions";
import AdminPagination from "../AdminPagination";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

// ── Relative time helper ────────────────────────────────────────────
function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// ── Role badge styling ──────────────────────────────────────────────
function roleBadgeClass(role: string): string {
    switch (role) {
        case "OWNER":
            return "bg-amber-500/15 text-amber-400 ring-amber-500/30";
        case "ADMIN":
            return "bg-red-500/15 text-red-400 ring-red-500/30";
        default:
            return "bg-white/5 text-hn-text-muted ring-white/10";
    }
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    const currentUserId = session.user.id;
    const requesterRole = role as "ADMIN" | "OWNER";
    const masterOwnerEmail = process.env.MASTER_OWNER_EMAIL;

    // ── Pagination params ───────────────────────────────────────────
    const params = await searchParams;
    const rawPage = parseInt(params.page ?? "1", 10);
    const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    // ── Fetch paginated users + total count ─────────────────────────
    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            take: ITEMS_PER_PAGE,
            skip,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        }),
        prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-hn-text">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-hn-text-muted">
                        {totalCount} registered user{totalCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* ── Users Table ────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-hn-border/50">
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    User
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Joined
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Change Role
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {users.map((user) => {
                                const isSelf = user.id === currentUserId;
                                const isMasterOwner = user.email === masterOwnerEmail;
                                return (
                                    <tr
                                        key={user.id}
                                        className="transition-colors duration-200 hover:bg-white/[0.02]"
                                    >
                                        {/* User */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-hn-card ring-1 ring-white/[0.08]">
                                                    <SafeImage
                                                        src={user.image ?? undefined}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                        fallback={
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-hn-text-muted">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-hn-text">
                                                        {user.name}
                                                        {isSelf && (
                                                            <span className="ml-1.5 text-[10px] text-hn-primary">
                                                                (you)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="truncate text-xs text-hn-text-muted">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-3.5 text-xs text-hn-text-muted whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        {/* Role badge */}
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${roleBadgeClass(isMasterOwner ? "OWNER" : user.role)}`}
                                            >
                                                {isMasterOwner ? "OWNER" : user.role}
                                            </span>
                                        </td>

                                        {/* Role select */}
                                        <td className="px-6 py-3.5">
                                            {isMasterOwner ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-hn-text-muted/60" title="Master Owner Immunity actived">
                                                    <span>🔒</span> Master Owner
                                                </div>
                                            ) : (
                                                <RoleSelect
                                                    targetUserId={user.id}
                                                    targetName={user.name}
                                                    targetRole={user.role}
                                                    requesterRole={requesterRole}
                                                    isSelf={isSelf}
                                                />
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/aishiteru/users/${user.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-sky-400 ring-1 ring-sky-500/20 transition-all duration-200 hover:bg-sky-500/10 hover:ring-sky-500/40"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                                                        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                                        <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                                                    </svg>
                                                    View
                                                </Link>
                                                {!isMasterOwner && (
                                                    <DeleteButton
                                                        targetUserId={user.id}
                                                        targetName={user.name}
                                                        targetRole={user.role}
                                                        requesterRole={requesterRole}
                                                        isSelf={isSelf}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-white/[0.04]">
                    {users.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const isMasterOwner = user.email === masterOwnerEmail;
                        return (
                            <div
                                key={user.id}
                                className="flex flex-col gap-3 p-4 transition-colors duration-200"
                            >
                                {/* Top row: avatar + info + badge */}
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-hn-card ring-1 ring-white/[0.08]">
                                        <SafeImage
                                            src={user.image ?? undefined}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                            fallback={
                                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-hn-text-muted">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium text-hn-text">
                                                {user.name}
                                                {isSelf && (
                                                    <span className="ml-1 text-[10px] text-hn-primary">
                                                        (you)
                                                    </span>
                                                )}
                                            </p>
                                            <span
                                                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${roleBadgeClass(isMasterOwner ? "OWNER" : user.role)}`}
                                            >
                                                {isMasterOwner ? "OWNER" : user.role}
                                            </span>
                                        </div>
                                        <p className="truncate text-xs text-hn-text-muted">
                                            {user.email}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-hn-text-muted/60">
                                            Joined {formatDate(user.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom row: actions */}
                                <div className="flex items-center gap-2 pl-[52px]">
                                    <Link
                                        href={`/aishiteru/users/${user.id}`}
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-sky-400 ring-1 ring-sky-500/20 transition-all duration-200 hover:bg-sky-500/10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5">
                                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                            <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                                        </svg>
                                        View
                                    </Link>
                                    {isMasterOwner ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-hn-text-muted/60 uppercase tracking-widest pt-1">
                                            <span>🔒</span> Master Owner
                                        </div>
                                    ) : (
                                        <>
                                            <RoleSelect
                                                targetUserId={user.id}
                                                targetName={user.name}
                                                targetRole={user.role}
                                                requesterRole={requesterRole}
                                                isSelf={isSelf}
                                            />
                                            <DeleteButton
                                                targetUserId={user.id}
                                                targetName={user.name}
                                                targetRole={user.role}
                                                requesterRole={requesterRole}
                                                isSelf={isSelf}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {users.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-sm text-hn-text-muted">
                        <span className="mb-2 text-3xl">🏜️</span>
                        No users found.
                    </div>
                )}
            </div>

            {/* ── Pagination ─────────────────────────────────────────── */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                basePath="/aishiteru/users"
            />
        </div>
    );
}
