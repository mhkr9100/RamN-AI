import React from 'react';

export const RamanIcon: React.FC<{ size?: number; className?: string; opacity?: number }> = ({ size = 24, className = "", opacity = 1 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 700 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ opacity }}
    >
        <defs>
            <linearGradient id="prismGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0e0e0" />
                <stop offset="100%" stopColor="#888888" />
            </linearGradient>
        </defs>
        {/* Triangle Prism — north-pointing */}
        <polygon
            points="410,120 180,440 640,440"
            fill="url(#prismGrad)"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinejoin="round"
        />
        {/* Entry ray — from left into triangle left face */}
        <line x1="60" y1="280" x2="295" y2="280" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        {/* Exit ray 1 — upper fan */}
        <line x1="520" y1="300" x2="660" y2="200" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        {/* Exit ray 2 — middle fan */}
        <line x1="520" y1="320" x2="660" y2="300" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        {/* Exit ray 3 — lower fan */}
        <line x1="520" y1="340" x2="660" y2="400" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
    </svg>
);
