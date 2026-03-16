import Swal from "sweetalert2";

/**
 * Pre-configured SweetAlert2 instance matching the dark anime streaming theme.
 * Uses Tailwind CSS classes via customClass for consistent styling.
 */
const swalConfirm = Swal.mixin({
    // ── Dark theme via custom CSS + Tailwind classes ──
    customClass: {
        popup: "!bg-[#27263a] !rounded-2xl !border !border-white/10 !shadow-2xl !shadow-black/60",
        title: "!text-white !font-bold !text-lg",
        htmlContainer: "!text-white/50 !text-sm",
        confirmButton:
            "!bg-[#ffbade] hover:!bg-[#ff9ec2] !text-[#191826] !font-bold !text-xs !rounded-full !px-5 !py-2.5 !shadow-lg !shadow-[#ffbade]/20 !transition-all",
        cancelButton:
            "!bg-white/10 hover:!bg-white/20 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !transition-all",
        actions: "!gap-3",
    },
    background: "#27263a",
    color: "#ffffff",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false, // Disables default SweetAlert styles so Tailwind takes full control
});

/**
 * Destructive confirmation dialog (red confirm button).
 * Used for "Clear All" or high-risk actions.
 */
const swalDestructive = Swal.mixin({
    customClass: {
        popup: "!bg-[#27263a] !rounded-2xl !border !border-white/10 !shadow-2xl !shadow-black/60",
        title: "!text-white !font-bold !text-lg",
        htmlContainer: "!text-white/50 !text-sm",
        confirmButton:
            "!bg-red-500 hover:!bg-red-600 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !shadow-lg !shadow-red-500/25 !transition-all",
        cancelButton:
            "!bg-white/10 hover:!bg-white/20 !text-white !font-bold !text-xs !rounded-full !px-5 !py-2.5 !transition-all",
        actions: "!gap-3",
    },
    background: "#27263a",
    color: "#ffffff",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
});

export { swalConfirm, swalDestructive };
