import React from 'react';

export const PrismIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M12 2L2 19H22L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.05"
        />
        <path d="M12 2L8 19" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        <path d="M12 2L16 19" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        <path d="M5 14H19" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
    </svg>
);
