
import React from 'react';

export const ScatterIcon: React.FC<{ size?: number; className?: string; id?: string }> = ({ size = 24, className = "", id }) => (
    <svg 
        id={id}
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* A central focus point that "scatters" outward */}
        <circle cx="50" cy="50" r="4" fill="white">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Scattered particles in an orbital-like dispersion */}
        <circle cx="35" cy="35" r="2" fill="white" opacity="0.6" />
        <circle cx="65" cy="40" r="3" fill="white" opacity="0.4" />
        <circle cx="45" cy="70" r="2.5" fill="white" opacity="0.7" />
        <circle cx="70" cy="65" r="1.5" fill="white" opacity="0.3" />
        <circle cx="25" cy="60" r="2" fill="white" opacity="0.5" />
        <circle cx="80" cy="45" r="1.5" fill="white" opacity="0.2" />
        <circle cx="50" cy="20" r="2" fill="white" opacity="0.4" />
        <circle cx="20" cy="40" r="1" fill="white" opacity="0.3" />

        {/* Subtle connecting filaments */}
        <g stroke="white" strokeWidth="0.5" opacity="0.1">
            <line x1="50" y1="50" x2="35" y2="35" />
            <line x1="50" y1="50" x2="65" y2="40" />
            <line x1="50" y1="50" x2="45" y2="70" />
            <line x1="50" y1="50" x2="25" y2="60" />
        </g>

        {/* Glowing atmospheric rings */}
        <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.05" />
        <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" strokeDasharray="2 12" opacity="0.03" />
    </svg>
);
