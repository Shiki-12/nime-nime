import Swal, { type SweetAlertOptions } from "sweetalert2";

/**
 * ─── Theme-Aware SweetAlert2 Mixins ─────────────────────────────────
 *
 * Read the current CSS theme variables at call-time so the dialog
 * always matches whichever theme (green/blue/purple) is active.
 *
 * Because Swal.mixin() captures styles at *creation* time and our
 * theme can change at runtime, we use a factory function that reads
 * the computed CSS variables each time a dialog is opened.
 */

/** Read a CSS variable from :root at runtime. */
function cssVar(name: string, fallback: string = ""): string {
    if (typeof window === "undefined") return fallback;
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback;
}

/**
 * Confirmation dialog (primary-colored confirm button).
 * Reads theme colors on every call.
 */
function swalConfirmFire(
    options?: SweetAlertOptions
) {
    const bg = cssVar("--hn-card", "#0f1a14");
    const primary = cssVar("--hn-primary", "#00ff88");
    const dark = cssVar("--hn-dark", "#060b08");

    return Swal.fire({
        customClass: {
            popup: "!rounded-2xl !border !border-white/10 !shadow-2xl !shadow-black/60",
            title: "!text-white !font-bold !text-lg",
            htmlContainer: "!text-white/50 !text-sm",
            confirmButton:
                "!font-bold !text-xs !rounded-full !px-5 !py-2.5 !shadow-lg !transition-all",
            cancelButton:
                "!bg-white/10 hover:!bg-white/20 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !transition-all",
            actions: "!gap-3",
        },
        background: bg,
        color: "#ffffff",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: primary,
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: true,
        didOpen: (popup) => {
            // Apply dynamic styles that can't be set via customClass
            const confirmBtn = popup.querySelector<HTMLElement>(".swal2-confirm");
            if (confirmBtn) {
                confirmBtn.style.backgroundColor = primary;
                confirmBtn.style.color = dark;
                confirmBtn.style.boxShadow = `0 4px 14px ${primary}33`;
            }
        },
        ...options,
    });
}

/**
 * Destructive dialog (red confirm button).
 * Used for "Clear All" or high-risk actions.
 */
function swalDestructiveFire(
    options?: SweetAlertOptions
) {
    const bg = cssVar("--hn-card", "#0f1a14");

    return Swal.fire({
        customClass: {
            popup: "!rounded-2xl !border !border-white/10 !shadow-2xl !shadow-black/60",
            title: "!text-white !font-bold !text-lg",
            htmlContainer: "!text-white/50 !text-sm",
            confirmButton:
                "!bg-red-500 hover:!bg-red-600 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !shadow-lg !shadow-red-500/25 !transition-all",
            cancelButton:
                "!bg-white/10 hover:!bg-white/20 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !transition-all",
            actions: "!gap-3",
        },
        background: bg,
        color: "#ffffff",
        showCancelButton: true,
        confirmButtonText: "Yes, clear all",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        ...options,
    });
}

/**
 * Toast notification (non-intrusive).
 * Used for error/info toasts such as "Save Failed".
 */
function swalToast(options?: SweetAlertOptions) {
    const bg = cssVar("--hn-card", "#0f1a14");

    return Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        background: bg,
        color: "#ffffff",
        ...options,
    });
}

// ─── Backwards-compatible wrappers ──────────────────────────────────
// The rest of the codebase calls `swalConfirm.fire({...})` and
// `swalDestructive.fire({...})`, so we expose `.fire()` methods.

const swalConfirm = { fire: swalConfirmFire };
const swalDestructive = { fire: swalDestructiveFire };

export { swalConfirm, swalDestructive, swalToast };
