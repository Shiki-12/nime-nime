import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay (in ms).
 * Returns the debounced value — only updates after the
 * user stops changing the input for `delay` milliseconds.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
