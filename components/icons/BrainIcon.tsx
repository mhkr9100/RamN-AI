
import React from 'react';

export const BrainIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
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
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 5.86 3 3 0 1 0 5.203 2.5 3 3 0 1 0 5.6 0 3 3 0 1 0 5.203-2.5 4 4 0 0 0 .52-5.86 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5" />
        <path d="M12 5V21" />
        <path d="M18 9h2" />
        <path d="M4 9h2" />
        <path d="M16 13h4" />
        <path d="M4 13h4" />
        <path d="M16 17h2" />
        <path d="M6 17h2" />
    </svg>
);
