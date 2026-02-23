
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, UserMapNode } from '../types';

interface UserMapViewProps {
    userProfile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
}

// Massive 100+ node structure: Profile of a Marketing Entrepreneur & Startup Founder
const BUSINESS_MAP: UserMapNode = {
    id: 'root',
    label: 'LEAD ARCHITECT',
    children: [
        {
            id: 'biz-ventures',
            label: 'BUSINESS VENTURES',
            children: [
                { id: 'bv1', label: 'SCATTER AI (SAAS)', children: [
                    { id: 'bv1-1', label: 'Refraction Engine' },
                    { id: 'bv1-2', label: 'Agent Marketplace' },
                    { id: 'bv1-3', label: 'Series A Roadmap' },
                    { id: 'bv1-4', label: 'Vector DB Ops' },
                    { id: 'bv1-5', label: 'Product-Led Growth' }
                ]},
                { id: 'bv2', label: 'FLUX GROWTH (AGENCY)', children: [
                    { id: 'bv2-1', label: 'Performance PPC' },
                    { id: 'bv2-2', label: 'SEO Authority Hub' },
                    { id: 'bv2-3', label: 'B2B Lead Scoring' },
                    { id: 'bv2-4', label: 'Retention Strategy' },
                    { id: 'bv2-5', label: 'Conversion Design' }
                ]},
                { id: 'bv3', label: 'LATENT CAPITAL', children: [
                    { id: 'bv3-1', label: 'Seed Portfolio' },
                    { id: 'bv3-2', label: 'Deal Flow Scout' },
                    { id: 'bv3-3', label: 'LP Relations' },
                    { id: 'bv3-4', label: 'Exit Strategies' }
                ]}
            ]
        },
        {
            id: 'tech-stack',
            label: 'TECH ECOSYSTEM',
            children: [
                { id: 'ts1', label: 'PRIMARY: GOOGLE WORKSPACE', children: [
                    { id: 'ts1-1', label: 'Drive Archive 2TB' },
                    { id: 'ts1-2', label: 'Sheets Automation' },
                    { id: 'ts1-3', label: 'Docs Collaboration' }
                ]},
                { id: 'ts2', label: 'INFRASTRUCTURE', children: [
                    { id: 'ts2-1', label: 'Vercel / Next.js' },
                    { id: 'ts2-2', label: 'Supabase DB' },
                    { id: 'ts2-3', label: 'Pinecone Vector' },
                    { id: 'ts2-4', label: 'Docker Swarms' },
                    { id: 'ts2-5', label: 'GitHub CI/CD' }
                ]},
                { id: 'ts3', label: 'AI TOOLING', children: [
                    { id: 'ts3-1', label: 'Cursor (Primary IDE)' },
                    { id: 'ts3-2', label: 'Gemini 3 Pro API' },
                    { id: 'ts3-3', label: 'Midjourney/Imagen' },
                    { id: 'ts3-4', label: 'VEO Engine' }
                ]}
            ]
        },
        {
            id: 'marketing-strat',
            label: 'MARKETING SYSTEMS',
            children: [
                { id: 'ms1', label: 'CONTENT OPS', children: [
                    { id: 'ms1-1', label: 'Auto-Podcasting' },
                    { id: 'ms1-2', label: 'Ghostwriting V3' },
                    { id: 'ms1-3', label: 'Short-form Vid' },
                    { id: 'ms1-4', label: 'Newsletter Stack' }
                ]},
                { id: 'ms2', label: 'VIRAL MECHANICS', children: [
                    { id: 'ms2-1', label: 'Waitlist FOMO' },
                    { id: 'ms2-2', label: 'Referral Loops' },
                    { id: 'ms2-3', label: 'Network Effects' }
                ]},
                { id: 'ms3', label: 'DISTRIBUTION', children: [
                    { id: 'ms3-1', label: 'Twitter Inbound' },
                    { id: 'ms3-2', label: 'LinkedIn Brand' },
                    { id: 'ms3-3', label: 'Product Hunt Launch' }
                ]}
            ]
        },
        {
            id: 'cog-profile',
            label: 'COGNITIVE MATRIX',
            children: [
                { id: 'cp1', label: 'CORE TRAITS', children: [
                    { id: 'cp1-1', label: 'High Logic Depth' },
                    { id: 'cp1-2', label: 'Extreme Agency' },
                    { id: 'cp1-3', label: 'Zero-Friction Obsession' },
                    { id: 'cp1-4', label: 'Rapid Iteration' }
                ]},
                { id: 'cp2', label: 'PREFERENCES', children: [
                    { id: 'cp2-1', label: 'Dark Mode (Void)' },
                    { id: 'cp2-2', label: 'Async Communication' },
                    { id: 'cp2-3', label: 'Minimalist UI' },
                    { id: 'cp2-4', label: 'Markdown Native' }
                ]},
                { id: 'cp3', label: 'VALUES', children: [
                    { id: 'cp3-1', label: 'Truth/Accuracy' },
                    { id: 'cp3-2', label: 'Technical Elegance' },
                    { id: 'cp3-3', label: 'Scalable Systems' }
                ]}
            ]
        },
        {
            id: 'bio-logistics',
            label: 'BIO & LOGISTICS',
            children: [
                { id: 'bl1', label: 'GEOGRAPHY', children: [
                    { id: 'bl1-1', label: 'London HQ' },
                    { id: 'bl1-2', label: 'Bali Summer Hub' },
                    { id: 'bl1-3', label: 'Digital Nomad Native' }
                ]},
                { id: 'bl2', label: 'SKILLS', children: [
                    { id: 'bl2-1', label: 'React / TS Master' },
                    { id: 'bl2-2', label: 'System Architecture' },
                    { id: 'bl2-3', label: 'Prompt Engineering' },
                    { id: 'bl2-4', label: 'Capital Allocation' },
                    { id: 'bl2-5', label: 'Storytelling' }
                ]},
                { id: 'bl3', label: 'HABITS', children: [
                    { id: 'bl3-1', label: '3AM Deep Work' },
                    { id: 'bl3-2', label: 'Espresso Dependency' },
                    { id: 'bl3-3', label: 'Biohacking Protocol' }
                ]}
            ]
        },
        {
            id: 'finance-goals',
            label: 'NORTH STARS',
            children: [
                { id: 'fg1', label: 'REVENUE', children: [
                    { id: 'fg1-1', label: '$10M ARR Milestone' },
                    { id: 'fg1-2', label: '75% Gross Margin' },
                    { id: 'fg1-3', label: 'IPO Preparation' }
                ]},
                { id: 'fg2', label: 'IMPACT', children: [
                    { id: 'fg2-1', label: '10k Power Users' },
                    { id: 'fg2-2', label: 'AI Industry Moat' },
                    { id: 'fg2-3', label: 'Founder Community' }
                ]}
            ]
        },
        {
            id: 'personal-tastes',
            label: 'AESTHETIC & TASTE',
            children: [
                { id: 'pt1', label: 'DESIGN', children: [
                    { id: 'pt1-1', label: 'Futurism' },
                    { id: 'pt1-2', label: 'Cyber-Modern' },
                    { id: 'pt1-3', label: 'Swiss Typography' }
                ]},
                { id: 'pt2', label: 'LIFESTYLE', children: [
                    { id: 'pt2-1', label: 'Minimalist Travel' },
                    { id: 'pt2-2', label: 'High-Performance Gear' },
                    { id: 'pt2-3', label: 'Specialty Coffee' }
                ]}
            ]
        }
    ]
};

interface PositionedNode extends UserMapNode {
    x: number;
    y: number;
    parentId?: string;
    depth: number;
}

export const UserMapView: React.FC<UserMapViewProps> = ({ userProfile }) => {
    const rootLabel = userProfile.name.toUpperCase();
    const mapData = useMemo(() => ({ ...BUSINESS_MAP, label: rootLabel }), [rootLabel]);

    const [scale, setScale] = useState(0.4);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.1));
    const handleReset = () => { setPosition({x:0, y:0}); setScale(0.4); };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.node-element')) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Calculate massive radial layout to avoid congestion
    const positionedNodes = useMemo(() => {
        const nodes: PositionedNode[] = [];
        
        const processNode = (node: UserMapNode, depth: number, angle: number, angleSpread: number, parentX: number, parentY: number, parentId?: string) => {
            // MASSIVE SPACING: Exponentially increase distance per level
            // Level 0: 0
            // Level 1: 800px
            // Level 2: 1800px
            // Level 3: 2800px
            const baseDistance = depth === 0 ? 0 : 700 + (depth - 1) * 900;
            const x = depth === 0 ? 0 : parentX + Math.cos(angle) * (depth === 1 ? 800 : 700);
            const y = depth === 0 ? 0 : parentY + Math.sin(angle) * (depth === 1 ? 800 : 700);
            
            nodes.push({ ...node, x, y, parentId, depth });

            if (node.children && node.children.length > 0) {
                const count = node.children.length;
                const nextSpread = depth === 0 ? Math.PI * 2 : angleSpread * 0.9;
                const startAngle = depth === 0 ? 0 : angle - nextSpread / 2;
                
                node.children.forEach((child, i) => {
                    const step = count === 1 ? 0 : nextSpread / (count - (depth === 0 ? 0 : 1));
                    const nextAngle = depth === 0 ? (i / count) * Math.PI * 2 : startAngle + i * step;
                    processNode(child, depth + 1, nextAngle, nextSpread, x, y, node.id);
                });
            }
        };

        processNode(mapData, 0, 0, Math.PI * 2, 0, 0);
        return nodes;
    }, [mapData]);

    return (
        <div 
            className={`h-full w-full bg-[#020202] rounded-[3rem] border border-white/5 overflow-hidden relative select-none shadow-inner transition-all duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header UI */}
            <div className="absolute top-10 left-10 z-20 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]" />
                    <span className="text-xs font-black text-white uppercase tracking-[0.5em]">Global Identity Matrix</span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] pl-7">Mapping Recursive Intelligence Nodes</span>
            </div>

            {/* Controls */}
            <div className="absolute top-10 right-10 z-30 flex items-center gap-4">
                <div className="flex items-center bg-black/80 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl">
                    <button onClick={handleZoomOut} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all text-2xl">−</button>
                    <div className="w-16 flex items-center justify-center text-[10px] font-black font-mono text-indigo-400 border-x border-white/5">{Math.round(scale * 100)}%</div>
                    <button onClick={handleZoomIn} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-all text-2xl">+</button>
                </div>
                <button onClick={handleReset} className="h-15 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-xl transition-all">Reset</button>
            </div>

            {/* Metrics */}
            <div className="absolute bottom-10 left-10 z-20 flex gap-10 pointer-events-none opacity-40">
                <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total Nodes</span><span className="text-lg font-mono text-indigo-400 font-black">{positionedNodes.length}</span></div>
                <div className="w-px h-10 bg-white/10 self-center" />
                <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Logic Layer</span><span className="text-lg font-mono text-indigo-400 font-black">Level 4</span></div>
            </div>

            {/* The Infinite Panning Map Canvas */}
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                }}
            >
                {/* SVG Connections Layer - CLEAN & VISIBLE */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    <g>
                        {positionedNodes.map(node => {
                            if (!node.parentId) return null;
                            const parent = positionedNodes.find(p => p.id === node.parentId);
                            if (!parent) return null;
                            
                            // High Visibility pure lines
                            return (
                                <path 
                                    key={`edge-${node.id}`}
                                    d={`M ${parent.x} ${parent.y} L ${node.x} ${node.y}`}
                                    stroke="rgba(99, 102, 241, 0.6)"
                                    strokeWidth={node.depth === 1 ? "4" : "2"}
                                    strokeDasharray={node.depth > 2 ? "10 10" : "none"}
                                    fill="none"
                                />
                            );
                        })}
                    </g>
                </svg>

                {/* Nodes Layer - SPACED & CLEAN */}
                <div className="relative pointer-events-auto">
                    {positionedNodes.map(node => (
                        <div 
                            key={node.id}
                            className="node-element absolute -translate-x-1/2 -translate-y-1/2 group/node"
                            style={{ left: node.x, top: node.y }}
                        >
                            <div className={`
                                flex flex-col items-center justify-center p-5 px-10 rounded-3xl border transition-all duration-500 shadow-2xl backdrop-blur-3xl cursor-default
                                ${node.id === 'root'
                                    ? 'bg-white text-black font-black text-sm ring-[15px] ring-indigo-500/10 scale-125 z-50'
                                    : node.children && node.children.length > 0
                                    ? 'bg-[#0a0a0a] border-indigo-500/80 text-white font-black text-xs hover:border-white z-40'
                                    : 'bg-black/90 border-white/20 text-slate-400 hover:text-white hover:border-white/50 text-[11px] font-bold z-30'
                                }
                            `}>
                                <span className="uppercase tracking-[0.3em] whitespace-nowrap">{node.label}</span>
                                {node.children && node.children.length > 0 && node.id !== 'root' && (
                                    <span className="text-[8px] text-indigo-500 font-mono mt-1 uppercase font-black">{node.children.length} SUB-NODES</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subtle Guide Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:100px_100px]" />
        </div>
    );
};
