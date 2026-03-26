"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────
export type ThemeColor = "green" | "blue" | "purple" | "orange" | "red" | "white";

interface ThemeContextValue {
    /** Current active theme */
    theme: ThemeColor;
    /** Change the theme (persists to localStorage) */
    setTheme: (t: ThemeColor) => void;
    /** True once the client has mounted and theme is loaded */
    mounted: boolean;
}

const STORAGE_KEY = "nimenime-theme";
const DEFAULT_THEME: ThemeColor = "purple";

// ─── Context ────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue>({
    theme: DEFAULT_THEME,
    setTheme: () => {},
    mounted: false,
});

export function useTheme() {
    return useContext(ThemeContext);
}

// ─── Provider ───────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeColor>(DEFAULT_THEME);
    const [mounted, setMounted] = useState(false);

    // Read from localStorage once on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeColor | null;
        if (stored && ["green", "blue", "purple", "orange", "red", "white"].includes(stored)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState(stored);
        }
        setMounted(true);
    }, []);

    // Apply `data-theme` attribute to <html> whenever theme changes
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === DEFAULT_THEME) {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", theme);
        }
    }, [theme, mounted]);

    const setTheme = useCallback((t: ThemeColor) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}
