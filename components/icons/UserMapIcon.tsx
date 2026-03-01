
import React from 'react';

export function UserMapIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 9V3" />
            <path d="M12 21v-6" />
            <path d="M9 12H3" />
            <path d="M21 12h-6" />
            <path d="M17.65 6.35L19.78 4.22" />
            <path d="M4.22 19.78l2.13-2.13" />
            <path d="M6.35 6.35L4.22 4.22" />
            <path d="M19.78 19.78l-2.13-2.13" />
        </svg>
    );
}
