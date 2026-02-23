
import React, { useEffect, useState } from 'react';
import { Agent } from '../types';

interface RamanBottleVisualProps {
    isRolling: boolean;
    activeAgents: Agent[];
    selectedIds: string[];
}

export const RamanBottleVisual: React.FC<RamanBottleVisualProps> = ({ isRolling, activeAgents, selectedIds }) => {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRolling) {
            interval = setInterval(() => {
                setRotation(prev => (prev + 15) % 360);
            }, 50);
        } else {
            setRotation(0);
        }
        return () => clearInterval(interval);
    }, [isRolling]);

    if (!isRolling && selectedIds.length === 0) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="relative w-64 h-64 border border-white/5 rounded-full bg-white/[0.02] flex items-center justify-center backdrop-blur-sm shadow-2xl">
                {/* Central Prism */}
                <div className="w-12 h-12 bg-[#001f3f] border border-blue-400/50 rounded-lg flex items-center justify-center text-xl shadow-[0_0_20px_rgba(96,165,250,0.3)] z-10">
                    💎
                </div>

                {/* The "Bottle Hands" (Light Rays) */}
                <div 
                    className="absolute inset-0 transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Hand 1: Magenta */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-gradient-to-t from-blue-400 to-transparent opacity-60"></div>
                    {/* Hand 2: Cyan */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-0.5 bg-gradient-to-l from-cyan-400 to-transparent opacity-60"></div>
                    {/* Hand 3: Indigo */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-gradient-to-b from-indigo-400 to-transparent opacity-60"></div>
                </div>

                {/* Agents on the Clock */}
                {activeAgents.map((agent, i) => {
                    const angle = (i / activeAgents.length) * 360;
                    const radius = 100;
                    const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
                    const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
                    const isSelected = selectedIds.includes(agent.id);

                    return (
                        <div 
                            key={agent.id}
                            className={`absolute w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-700 ${isSelected ? 'bg-blue-600 border-white scale-125 shadow-[0_0_15px_white]' : 'bg-black border-white/10 text-slate-500 scale-100'}`}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                            <span className="text-xs">{agent.icon}</span>
                            {isSelected && !isRolling && (
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
