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
/** Dark-mode themes (6 originals — :root default is "purple") */
export type DarkTheme = "purple" | "blue" | "green" | "orange" | "red" | "white";
/** Light-mode themes (4 fully self-contained) */
export type LightTheme = "amethyst" | "maroon" | "frost" | "matcha";
/** Union of all theme IDs */
export type ThemeColor = DarkTheme | LightTheme;

/** Derived mode — not stored as a separate attribute */
export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
    /** Current active theme (data-theme) */
    theme: ThemeColor;
    /** Change the theme (persists to localStorage, sets data-theme) */
    setTheme: (t: ThemeColor) => void;
    /** Derived display mode based on current theme */
    mode: ThemeMode;
    /** Switch mode — auto-selects default theme for that mode */
    setMode: (m: ThemeMode) => void;
    /** True once the client has mounted and theme is loaded */
    mounted: boolean;
}

const STORAGE_KEY = "nimenime-theme";
const DEFAULT_DARK_THEME: DarkTheme = "purple";
const DEFAULT_LIGHT_THEME: LightTheme = "amethyst";

export const DARK_THEMES: DarkTheme[] = ["purple", "blue", "green", "orange", "red", "white"];
export const LIGHT_THEMES: LightTheme[] = ["amethyst", "maroon", "frost", "matcha"];
const ALL_THEMES: ThemeColor[] = [...DARK_THEMES, ...LIGHT_THEMES];

function deriveMode(theme: ThemeColor): ThemeMode {
    return (LIGHT_THEMES as string[]).includes(theme) ? "light" : "dark";
}

// ─── Context ────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue>({
    theme: DEFAULT_DARK_THEME,
    setTheme: () => {},
    mode: "dark",
    setMode: () => {},
    mounted: false,
});

export function useTheme() {
    return useContext(ThemeContext);
}

// ─── Provider ───────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeColor>(DEFAULT_DARK_THEME);
    const [mounted, setMounted] = useState(false);

    // Read from localStorage once on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeColor | null;
        if (stored && ALL_THEMES.includes(stored)) {
            setThemeState(stored);
        }
        setMounted(true);
    }, []);

    // Apply `data-theme` attribute to <html> whenever theme changes
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;

        // "purple" is :root default — remove attribute so :root vars apply
        if (theme === DEFAULT_DARK_THEME) {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", theme);
        }

        // Clean up any leftover data-mode attribute from previous versions
        root.removeAttribute("data-mode");
    }, [theme, mounted]);

    const setTheme = useCallback((t: ThemeColor) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
    }, []);

    // setMode: switch to the default theme for that mode
    const setMode = useCallback((m: ThemeMode) => {
        const newTheme = m === "dark" ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    const mode = deriveMode(theme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}
