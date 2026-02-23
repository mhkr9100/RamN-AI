
import React from 'react';

export const PrismIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Simple Prism Triangle */}
        <path 
            d="M50 15L85 85H15L50 15Z" 
            stroke="url(#prism_edge)" 
            strokeWidth="3" 
            fill="url(#prism_glass)"
        />
        
        <defs>
            <linearGradient id="prism_edge" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E2E8F0" stopOpacity="0.9"/>
                <stop offset="1" stopColor="#94A3B8" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="prism_glass" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.15"/>
                <stop offset="1" stopColor="white" stopOpacity="0.05"/>
            </linearGradient>
        </defs>
    </svg>
);
