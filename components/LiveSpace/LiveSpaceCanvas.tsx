import React, { useState, useEffect } from 'react';

interface LiveSpaceCanvasProps {
    showSheet: boolean;
    showDoc: boolean;
    namesPopulated: boolean;
    enriched: boolean;
    demoMode?: boolean;
}

export const LiveSpaceCanvas: React.FC<LiveSpaceCanvasProps> = ({ showSheet, showDoc, namesPopulated, enriched, demoMode }) => {
    const [view, setView] = useState<'sheet' | 'doc'>('sheet');
    
    // Auto-switch view when assets are opened
    useEffect(() => {
        if (showDoc && !showSheet) setView('doc');
        if (showSheet) setView('sheet');
    }, [showSheet, showDoc]);

    const initialRows = [
        ['RANK', 'MODEL_ID', 'PROVIDER', 'LATENCY', 'SPECIALIZATION'],
        ['1', '', '', '', ''],
        ['2', '', '', '', ''],
        ['3', '', '', '', ''],
        ['4', '', '', '', ''],
        ['5', '', '', '', ''],
    ];

    const [sheetData, setSheetData] = useState(initialRows);

    useEffect(() => {
        if (showSheet && demoMode) {
            // STEP 1: INITIAL HEADERS FOR AI BENCHMARK DEMO
            setSheetData(prev => {
                const next = [...prev];
                next[0] = ['RANK', 'MODEL_ID', 'PROVIDER', 'LATENCY', 'SPECIALIZATION'];
                return next;
            });
        }
    }, [showSheet, demoMode]);

    useEffect(() => {
        if (namesPopulated && demoMode) {
            // STEP 2: POPULATE MODELS (Triggered after 3s search)
            setSheetData(prev => {
                const next = [...prev];
                next[1] = ['1', 'GPT-4o', 'OpenAI', '310ms', next[1][4]];
                next[2] = ['2', 'Gemini 3 Pro', 'Google', '240ms', next[2][4]];
                next[3] = ['3', 'Claude 3.5 Sonnet', 'Anthropic', '450ms', next[3][4]];
                next[4] = ['4', 'Llama 3.1 405B', 'Meta', '600ms', next[4][4]];
                next[5] = ['5', 'DeepSeek-V3', 'DeepSeek', '180ms', next[5][4]];
                return next;
            });
        }
    }, [namesPopulated, demoMode]);

    useEffect(() => {
        if (enriched && demoMode) {
            // STEP 3: POPULATE SPECIALIZATIONS
            setSheetData(prev => {
                const next = [...prev];
                next[1][4] = 'Multi-modal & Vision';
                next[2][4] = 'Reasoning & Native-Voice';
                next[3][4] = 'Nuance & Creative Flow';
                next[4][4] = 'Large-Context Coding';
                next[5][4] = 'Mathematical Logic';
                return next;
            });
        }
    }, [enriched, demoMode]);

    const updateCell = (row: number, col: number, val: string) => {
        const newData = [...sheetData];
        newData[row][col] = val;
        setSheetData(newData);
    };

    if (!showSheet && !showDoc) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-indigo-500/10 flex items-center justify-center text-5xl opacity-20 animate-pulse">🗂️</div>
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Awaiting Asset Initialization</p>
                    <p className="text-[8px] font-mono text-indigo-500/40 mt-2 uppercase tracking-widest">Target: Direct_Cloud_Link_0</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 animate-in zoom-in-95">
            {/* Asset Tabs */}
            <div className="flex bg-black/40 border-b border-white/5 backdrop-blur-md">
                {showSheet && (
                    <button 
                        onClick={() => setView('sheet')}
                        className={`flex items-center gap-2 px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'sheet' ? 'text-indigo-400 bg-white/[0.02] border-b-2 border-indigo-500' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                        AI_Model_Benchmarks_2025.gsheet
                    </button>
                )}
                {showDoc && (
                    <button 
                        onClick={() => setView('doc')}
                        className={`flex items-center gap-2 px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'doc' ? 'text-indigo-400 bg-white/[0.02] border-b-2 border-indigo-500' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                        Mission_Protocol_v3.doc
                    </button>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#020202]">
                {view === 'sheet' ? (
                    <div className="p-8 animate-in fade-in duration-500">
                        <table className="w-full border-collapse text-[12px] font-mono">
                            <thead>
                                <tr>
                                    <th className="w-12 border border-white/10 bg-white/5"></th>
                                    {['A', 'B', 'C', 'D', 'E'].map(l => (
                                        <th key={l} className="border border-white/10 bg-black/60 text-slate-500 p-2.5 uppercase font-black tracking-tighter text-[10px]">{l}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sheetData.map((row, rIdx) => (
                                    <tr key={rIdx} className="group/row">
                                        <td className="border border-white/10 bg-black/40 text-slate-600 text-center font-bold text-[10px]">{rIdx + 1}</td>
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className={`border border-white/10 p-3 min-w-[160px] transition-all ${rIdx === 0 ? 'bg-indigo-900/10 text-indigo-400 font-black' : 'hover:bg-indigo-500/[0.02]'}`}>
                                                <input 
                                                    value={cell} 
                                                    onChange={e => updateCell(rIdx, cIdx, e.target.value)}
                                                    className={`w-full bg-transparent outline-none transition-colors ${rIdx === 0 ? 'pointer-events-none' : 'text-slate-300 focus:text-white focus:font-bold'}`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-12 flex flex-wrap gap-4">
                             <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Monitoring:</span>
                                <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-indigo-900/20 transition-all">Enable ELO Tracking</button>
                             </div>
                             <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/10 transition-all">Export Matrix</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-16 max-w-3xl mx-auto space-y-12 animate-in fade-in duration-1000 slide-in-from-bottom-4">
                        <div className="border-b border-white/10 pb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Internal Strategy Log</h1>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-mono font-bold uppercase">Restricted</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.4em]">Operations • Scatter Division • Year 2025</p>
                        </div>
                        
                        <div className="space-y-6 text-slate-400 font-sans leading-relaxed text-xl">
                            <p className="italic font-serif">Mission Directives for Q1 Deployment:</p>
                            <ul className="space-y-6 not-italic font-sans text-lg">
                                <li className="flex items-center gap-4 group">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-bold text-white uppercase tracking-tight">Phase 1: Spectrum Recruitment</span>
                                    <span className="text-sm font-mono text-slate-600 uppercase tracking-widest ml-auto">[ACTIVE]</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-bold text-white uppercase tracking-tight">Phase 2: Matrix Synchronization</span>
                                    <span className="text-sm font-mono text-slate-600 uppercase tracking-widest ml-auto">[PENDING]</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-bold text-white uppercase tracking-tight">Phase 3: Global Intelligence Exit</span>
                                    <span className="text-sm font-mono text-slate-600 uppercase tracking-widest ml-auto">[LOCKED]</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="pt-24 opacity-10 border-t border-white/5 flex flex-col items-center gap-4">
                            <div className="w-12 h-1 border-t border-white" />
                            <p className="text-[9px] text-center uppercase tracking-[0.8em] font-black">Secure Data Feed Termination</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Matrix Status Bar */}
            <div className="h-12 bg-black border-t border-white/5 px-8 flex items-center justify-between text-[10px] font-mono text-slate-600">
                <div className="flex gap-8 items-center">
                    <span className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                        WORKSPACE_HEALTH: NOMINAL
                    </span>
                    <span className="hidden sm:inline border-l border-white/5 pl-8 uppercase tracking-widest">Active_Node: {view === 'sheet' ? 'GSHEET_SYNC_01' : 'DOC_SYNC_01'}</span>
                </div>
                <div className="flex gap-10 items-center">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.2em] animate-pulse">Node_Link: Verified</span>
                    <span className="bg-white/5 px-3 py-1 rounded-md text-[9px] font-bold border border-white/5 uppercase tracking-widest">USER: architect_alpha</span>
                </div>
            </div>
        </div>
    );
};