
import React from 'react';

interface LoadingSpinnerProps {
    width?: number;
    height?: number;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ width = 40, height = 20, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Resolving">
      <svg width={width} height={height} viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            @keyframes minimal-fade {
              0%, 100% { opacity: 0.1; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            .dot {
              animation: minimal-fade 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
              fill: currentColor;
            }
            .dot-1 { animation-delay: 0s; }
            .dot-2 { animation-delay: 0.3s; }
            .dot-3 { animation-delay: 0.6s; }
          `}
        </style>
        
        <circle cx="20" cy="15" r="3" className="dot dot-1" />
        <circle cx="30" cy="15" r="3" className="dot dot-2" />
        <circle cx="40" cy="15" r="3" className="dot dot-3" />
      </svg>
    </div>
  );
};
