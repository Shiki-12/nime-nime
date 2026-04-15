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
                password: true,
                isVerified: true,
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
                                    Account Status
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
                                const isGoogleUser = user.password === null;
                                const isVerified = isGoogleUser || user.isVerified;
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

                                        {/* Account Status */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                {/* Provider Badge */}
                                                {isGoogleUser ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-blue-500/10 text-blue-400 ring-blue-500/20 backdrop-blur-sm">
                                                        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                        Google
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-white/5 text-hn-text-muted ring-white/10 backdrop-blur-sm">
                                                        <svg className="h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3z" /><path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839z" /></svg>
                                                        Email
                                                    </span>
                                                )}
                                                {/* Verification Badge */}
                                                {isVerified ? (
                                                    <span className="inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 backdrop-blur-sm">
                                                        <svg className="h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-rose-500/10 text-rose-400 ring-rose-500/20 backdrop-blur-sm">
                                                        <svg className="h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
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
                        const isGoogleUser = user.password === null;
                        const isVerified = isGoogleUser || user.isVerified;
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
                                        {/* Account Status Badges - Mobile */}
                                        <div className="mt-1.5 flex items-center gap-1">
                                            {isGoogleUser ? (
                                                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset bg-blue-500/10 text-blue-400 ring-blue-500/20 backdrop-blur-sm">
                                                    <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                    Google
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset bg-white/5 text-hn-text-muted ring-white/10 backdrop-blur-sm">
                                                    <svg className="h-2 w-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3z" /><path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839z" /></svg>
                                                    Email
                                                </span>
                                            )}
                                            {isVerified ? (
                                                <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 backdrop-blur-sm">
                                                    ✓ Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ring-1 ring-inset bg-rose-500/10 text-rose-400 ring-rose-500/20 backdrop-blur-sm">
                                                    ⚠ Unverified
                                                </span>
                                            )}
                                        </div>
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
