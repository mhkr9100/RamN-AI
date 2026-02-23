
import React from 'react';

export const OrchestraIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Ambient Glow */}
        <circle cx="50" cy="50" r="30" fill="white" opacity="0.03" />
        
        {/* Prism Geometry (Equilateral Triangle) */}
        <path 
            d="M50 20L85 80H15L50 20Z" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeOpacity="0.3"
            fill="url(#prism_glass_grad)"
        />
        
        {/* The Incoming Beam - Pure White Intent */}
        <line 
            x1="5" y1="55" 
            x2="38" y2="55" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />

        {/* Refraction Point Glint */}
        <circle cx="38" cy="55" r="1.5" fill="white" />

        {/* The Spectrum - Refracted Intelligence Rays */}
        <g strokeLinecap="round">
            {/* Top Ray (Cyan) */}
            <path d="M62 55 L95 35" stroke="#22D3EE" strokeWidth="2.5" opacity="0.9" />
            
            {/* Upper Middle (Indigo) */}
            <path d="M62 55 L95 48" stroke="#818CF8" strokeWidth="2.5" opacity="0.9" />
            
            {/* Lower Middle (Purple) */}
            <path d="M62 55 L95 62" stroke="#A855F7" strokeWidth="2.5" opacity="0.9" />
            
            {/* Bottom Ray (Pink) */}
            <path d="M62 55 L95 75" stroke="#D946EF" strokeWidth="2.5" opacity="0.9" />
        </g>

        <defs>
            <linearGradient id="prism_glass_grad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.08"/>
                <stop offset="1" stopColor="white" stopOpacity="0.02"/>
            </linearGradient>
            
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
);
