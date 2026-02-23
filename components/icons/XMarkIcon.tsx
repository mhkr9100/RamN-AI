
import React from 'react';

// Added props interface to accept size and className, ensuring compatibility with usages like InputBar.tsx
export const XMarkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className || "w-6 h-6"}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
