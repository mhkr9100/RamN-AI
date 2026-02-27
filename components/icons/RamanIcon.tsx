import React from 'react';

export const RamanIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M80 10 L150 110 H10 L80 10Z"
            stroke="currentColor"
            strokeWidth="3"
            fill="currentColor"
            fillOpacity="0.05"
        />
        <line x1="10" y1="60" x2="50" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="150" y1="80" x2="110" y2="58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="120" y1="60" x2="150" y2="40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="150" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
);
