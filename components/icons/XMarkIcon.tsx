import React from 'react';

export const XMarkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6L6 18" />
        <path d="M6 6L18 18" />
    </svg>
);
