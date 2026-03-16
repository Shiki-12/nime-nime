"use client";

import { useSyncOnLogin } from "@/hooks/useSyncOnLogin";

/**
 * Invisible client component that triggers localStorage → DB sync
 * when a user is authenticated. Mount once in the root layout.
 */
export default function SyncOnLogin() {
    useSyncOnLogin();
    return null;
}
