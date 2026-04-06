"use client";

import { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React.ReactNode;
}

export default function SafeImage({ fallback, src, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    if (error || !src) {
        return <>{fallback}</>;
    }

    return (
        <img
            {...props}
            src={src}
            onError={(e) => {
                setError(true);
                props.onError?.(e);
            }}
        />
    );
}
