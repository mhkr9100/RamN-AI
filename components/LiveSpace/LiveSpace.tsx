import React, { useState, useEffect, useRef } from 'react';
import { Agent, GlobalTask } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { XMarkIcon } from '../icons/XMarkIcon';
import { LiveSpaceCanvas } from './LiveSpaceCanvas';

interface LiveSpaceProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToTasks?: (task: { label: string; agentId: string; status: GlobalTask['status']; output: string }) => void;
    agents: Agent[];
    isGroup?: boolean;
}

export const LiveSpace: React.FC<LiveSpaceProps> = ({ isOpen, onClose, onSaveToTasks, agents, isGroup }) => {
    const [status, setStatus] = useState<'setting-up' | 'active'>('setting-up');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [actionHistory, setActionHistory] = useState<string[]>([]);
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    
    // Virtual State for simulation
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDocOpen, setIsDocOpen] = useState(false);
    const [namesPopulated, setNamesPopulated] = useState(false);
    const [attributesPopulated, setAttributesPopulated] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const instructionInputRef = useRef<HTMLInputElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setStatus('active');
                addAction("Kernel: LiveSpace environment synchronized.");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [actionHistory]);

    const addAction = (msg: string) => {
        setActionHistory(prev => [msg, ...prev.slice(0, 99)]);
    };

    const handleInstructionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = currentInstruction.trim();
        if (!text || isAgentThinking) return;

        addAction(`USER: ${text}`);
        setCurrentInstruction('');
        setIsAgentThinking(true);

        const gridAgent = agents.find(a => a.id.includes('grid')) || agents.find(a => a.name.toLowerCase().includes('grid')) || agents[0];
        const scoutAgent = agents.find(a => a.id.includes('scout')) || agents.find(a => a.name.toLowerCase().includes('scout')) || agents[1] || agents[0];
        
        const lowText = text.toLowerCase();

        // INVESTOR DEMO LOGIC
        setTimeout(async () => {
            // FLOW 1: Open a sheet
            if (lowText.includes('open') && (lowText.includes('sheet') || lowText.includes('spreadsheet'))) {
                setIsAgentThinking(false);
                setIsSheetOpen(true);
                setIsDemoMode(true);
                addAction(`${gridAgent.name}: Virtualizing Spreadsheet [AI_Model_Benchmark_2025].`);
                addAction("SYSTEM: Workspace synchronized to SPREADSHEET_KERNEL.");
            } 
            // FLOW 2: Find top 5 AI models
            else if ((lowText.includes('find') || lowText.includes('search')) && lowText.includes('top 5') && (lowText.includes('model') || lowText.includes('ai'))) {
                if (!isSheetOpen) {
                    setIsAgentThinking(false);
                    addAction(`SYSTEM: Error - No active spreadsheet detected.`);
                    return;
                }

                addAction(`${scoutAgent.name}: Initializing deep-web sweep for latest model benchmarks...`);
                addAction("SYSTEM: Polling global ELO data centers...");
                
                // 3 Second Simulated "Deep Search" as requested
                await new Promise(r => setTimeout(r, 3000));

                addAction(`${scoutAgent.name}: Search complete. Found GPT-4o, Gemini 3 Pro, Claude 3.5, Llama 3.1, DeepSeek-V3.`);
                addAction(`${gridAgent.name}: Mapping results to target cells [B2:D6]...`);
                
                await new Promise(r => setTimeout(r, 800));
                
                setNamesPopulated(true);
                setIsAgentThinking(false);
                addAction(`SYSTEM: Spreadsheet synchronized successfully.`);
            }
            // FLOW 3: Add specializations / Best for
            else if (lowText.includes('best for') || (lowText.includes('next column') && lowText.includes('add')) || lowText.includes('attribute')) {
                if (!namesPopulated) {
                    setIsAgentThinking(false);
                    addAction("SYSTEM: Dependency missing. Please populate model list first.");
                    return;
                }

                addAction(`${scoutAgent.name}: Analyzing architectural specializations for identified nodes...`);
                addAction("SYSTEM: Crossing reasoning metrics with coding benchmarks...");
                
                await new Promise(r => setTimeout(r, 2000));

                addAction(`${scoutAgent.name}: Attributes verified. Handing specialized map to ${gridAgent.name}.`);
                addAction(`${gridAgent.name}: Appending Attribute Column [E2:E6]...`);
                
                await new Promise(r => setTimeout(r, 1000));
                
                setAttributesPopulated(true);
                setIsAgentThinking(false);
                addAction("SYSTEM: Spreadsheet enrichment complete. Matrix finalized.");
            }
            // Standard fallback
            else {
                setIsAgentThinking(false);
                addAction(`${gridAgent.name}: Instruction acknowledged. Standing by.`);
            }
        }, 800);
    };

    const handleCloseRequest = () => {
        if (actionHistory.length > 1) setIsSavePromptOpen(true);
        else onClose();
    };

    const handleConfirmSave = () => {
        if (onSaveToTasks) {
            const logSummary = actionHistory.filter(h => !h.startsWith('USER:')).reverse().join('\n');
            onSaveToTasks({
                agentId: agents[0].id,
                label: `LiveSpace Session [${new Date().toLocaleTimeString()}]`,
                status: 'done',
                output: `Operational Logs:\n${logSummary}`
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col bg-[#050505] transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 ${isFullScreen ? '' : 'm-2 md:m-4 lg:m-6 rounded-3xl border border-indigo-500/20 shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden'}`}>
            
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {agents.map(a => (
                            <div key={a.id} className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-sm shadow-xl transition-transform hover:scale-110" title={a.name}>
                                {a.icon}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">LiveSpace: Active_Deployment</h2>
                        <span className="text-[8px] text-indigo-400/60 font-mono uppercase font-black">Refraction_Node: Online</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${isSidebarOpen ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-indigo-600 border-indigo-500 text-white shadow-lg'}`}
                    >
                        {isSidebarOpen ? 'Maximize Canvas' : 'View Logs'}
                    </button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-all" onClick={handleCloseRequest}>
                        <XMarkIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Layout Body */}
            <div className="flex-1 flex overflow-hidden relative">
                {status === 'setting-up' ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <LoadingSpinner width={80} height={40} className="text-indigo-500" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse">Syncing Workspace Layers...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* Interactive Canvas Area */}
                        <div className="flex-1 overflow-hidden p-3 md:p-6 bg-[#080808] relative">
                             <LiveSpaceCanvas 
                                showSheet={isSheetOpen} 
                                showDoc={isDocOpen} 
                                namesPopulated={namesPopulated}
                                enriched={attributesPopulated}
                                demoMode={isDemoMode}
                             />
                        </div>

                        {/* Exclusive Right Logs Sidebar */}
                        <div className={`border-l border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-full lg:w-[380px]' : 'w-0 border-l-0'}`}>
                            <div className="h-14 flex items-center px-6 border-b border-white/5 bg-black/20 flex-shrink-0 min-w-[380px]">
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Kernel_Execution_Logs</h3>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar font-mono bg-[#0a0a0a]/30 min-w-[380px]">
                                <div className="space-y-3">
                                    {actionHistory.slice().reverse().map((log, i) => (
                                        <div key={i} className={`text-[11px] leading-relaxed break-all p-2 rounded-lg ${log.startsWith('USER:') ? 'bg-indigo-500/10 text-indigo-200 border-l-2 border-indigo-400 pl-3' : 'text-slate-500 border border-white/5'}`}>
                                            <span className="text-white/10 mr-2 text-[9px]">[{new Date().toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                                            {log.replace('USER: ', '').replace('SYSTEM: ', '')}
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>

                            {isAgentThinking && (
                                <div className="h-10 border-t border-white/5 bg-black/40 px-6 flex items-center gap-3 animate-pulse min-w-[380px]">
                                    <LoadingSpinner width={20} height={10} className="text-indigo-400" />
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Processing Node Command...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Bar Area */}
            {status === 'active' && (
                <div 
                    className="h-24 bg-black border-t border-white/5 px-6 flex items-center justify-center relative pointer-events-auto z-[150]"
                    onClick={() => instructionInputRef.current?.focus()}
                >
                    <form onSubmit={handleInstructionSubmit} className="w-full max-w-2xl relative group">
                        <div className="absolute inset-0 -m-0.5 rounded-2xl bg-indigo-500/10 blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <input 
                            id="live-instruction-input"
                            ref={instructionInputRef}
                            type="text" 
                            autoFocus
                            value={currentInstruction}
                            onChange={(e) => setCurrentInstruction(e.target.value)}
                            disabled={isAgentThinking}
                            placeholder={isAgentThinking ? "Kernel processing directive..." : "Assign mission directive..."}
                            autoComplete="off"
                            className={`w-full bg-[#0d0d0d] border rounded-2xl py-4.5 px-6 pr-14 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-white/10 shadow-2xl ${isAgentThinking ? 'border-white/5 opacity-50 cursor-not-allowed' : 'border-white/10 group-hover:border-white/20'}`}
                        />
                        <button 
                            type="submit" 
                            disabled={!currentInstruction.trim() || isAgentThinking} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90 shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Archive Prompt */}
            {isSavePromptOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-[0_0_100px_rgba(0,0,0,1)]">
                        <div className="text-4xl mb-6">💾</div>
                        <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">Archive Session?</h3>
                        <p className="text-[11px] text-slate-500 mb-10 leading-relaxed uppercase tracking-widest">Commit operational logs and mission history to persistent memory?</p>
                        <div className="space-y-4">
                            <button onClick={handleConfirmSave} className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-2xl active:scale-[0.98] transition-all">Sync to Vault</button>
                            <button onClick={onClose} className="w-full py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition hover:bg-white/10">Discard Session</button>
                            <button onClick={() => setIsSavePromptOpen(false)} className="w-full py-2 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:text-slate-400 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};