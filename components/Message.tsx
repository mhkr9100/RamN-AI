
import React, { useState } from 'react';
import { Message as MessageType, ToolCall, CustomGroupSuggestion } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { AI_RESUMES } from '../constants';

interface MessageProps {
    message: MessageType;
    onAddEmployee?: (employeeData: any) => void;
    onCreateGroup?: (groupData: { name: string, agentIds: string[] }) => void;
    onConfigureNewAgent?: (profileId?: string, role?: string, jd?: string) => void;
    onDeployCustomGroup?: (suggestion: CustomGroupSuggestion) => void;
    onExecuteCommand?: (messageId: string, toolCall: ToolCall) => void;
    onExpandMessage?: (messageId: string) => void;
}

const CommandProposal: React.FC<{
    toolCall: ToolCall,
    isExecuting?: boolean,
    onProceed: (modifiedArgs?: any) => void
}> = ({ toolCall, isExecuting, onProceed }) => {
    const [selectedModels, setSelectedModels] = useState<Record<number, string>>({});

    const toolNameMap: Record<string, string> = {
        executeSearch: 'Global Intelligence Probe',
        executeMapsLookup: 'Geospatial Resolution',
        generateVisualAsset: 'Latent Space Synthesis',
        generateMotionClip: 'Temporal Motion Engine',
        fabricateAgent: 'Agent Fabrication',
        fabricateTeam: 'Squad Orchestration'
    };

    const isSquad = toolCall.name === 'fabricateTeam';
    const isSingleAgent = toolCall.name === 'fabricateAgent';
    const specialists = isSquad ? (toolCall.args.specialists || []) : (isSingleAgent ? [toolCall.args] : []);

    const handleDeploy = () => {
        const modifiedArgs = { ...toolCall.args };
        if (isSquad) {
            modifiedArgs.specialists = modifiedArgs.specialists.map((s: any, i: number) => ({
                ...s,
                modelId: selectedModels[i] || s.modelId || AI_RESUMES[0].modelId
            }));
        } else if (isSingleAgent) {
            modifiedArgs.modelId = selectedModels[0] || modifiedArgs.modelId || AI_RESUMES[0].modelId;
        }
        onProceed(modifiedArgs);
    };

    return (
        <div className="mt-4 bg-[#0a0a0a] border border-indigo-500/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="bg-indigo-500/5 border-b border-white/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em]">
                        PROPOSAL: {toolNameMap[toolCall.name] || toolCall.name}
                    </span>
                </div>
                <span className="text-[8px] font-mono text-white/20 tracking-[0.1em] uppercase font-bold">READY</span>
            </div>

            <div className="p-4 space-y-4">
                {isSquad || isSingleAgent ? (
                    <div className="space-y-4">
                        {isSquad && (
                            <>
                                <div className="space-y-0.5">
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Strategic Identifier</span>
                                    <h4 className="text-base font-bold text-white leading-tight">{toolCall.args.teamName}</h4>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Core Mission</span>
                                    <p className="text-xs text-slate-400 leading-relaxed italic border-l border-indigo-500/20 pl-3">"{toolCall.args.objective}"</p>
                                </div>
                            </>
                        )}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{isSquad ? 'Squad Composition' : 'Agent Protocol'}</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className={`grid gap-3 ${isSquad ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {specialists.map((spec: any, idx: number) => (
                                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3 hover:border-indigo-500/20 transition-all group/spec">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl bg-black p-2 rounded-lg border border-white/10">{spec.icon}</div>
                                            <div className="min-w-0">
                                                <div className="text-[12px] font-bold text-white truncate leading-tight uppercase">{spec.name}</div>
                                                <div className="text-[9px] text-indigo-400/50 uppercase tracking-tighter truncate font-mono">{spec.role}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Select Brain Layer</label>
                                            <select
                                                value={selectedModels[idx] || spec.modelId || ''}
                                                onChange={e => setSelectedModels(prev => ({ ...prev, [idx]: e.target.value }))}
                                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-indigo-300 font-bold outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="" disabled>Choose Model...</option>
                                                {AI_RESUMES.map(m => (
                                                    <option key={m.id} value={m.modelId}>{m.name} ({m.tagline})</option>
                                                ))}
                                            </select>
                                            {spec.suggestedModel && (
                                                <p className="text-[7px] text-indigo-500/60 font-mono uppercase tracking-tighter mt-1 italic">
                                                    Prism Suggests: {spec.suggestedModel}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="text-xl">{toolCall.args.icon}</div>
                            <h4 className="text-base font-bold text-white leading-tight">{toolCall.args.name}</h4>
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-lg p-3 font-mono text-[11px] leading-relaxed shadow-inner overflow-x-auto custom-scrollbar">
                            {Object.entries(toolCall.args).map(([key, val]) => (
                                <div key={key} className="flex gap-3 mb-1 last:mb-0">
                                    <span className="text-slate-600 uppercase tracking-tighter w-20 flex-shrink-0 font-bold">{key}:</span>
                                    <span className="text-indigo-300 italic whitespace-pre-wrap">
                                        {typeof val === 'object' ? JSON.stringify(val) : `"${String(val)}"`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isExecuting ? (
                    <div className="py-2 space-y-2 text-center">
                        <LoadingSpinner width={20} height={10} className="text-indigo-400" />
                        <p className="text-[8px] text-indigo-400/40 font-mono tracking-[0.4em] uppercase font-black">Committing...</p>
                    </div>
                ) : (
                    <button
                        onClick={handleDeploy}
                        className="w-full py-2.5 bg-white hover:bg-slate-100 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <span>Initiate Execution</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const ThinkingBlock: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="my-3 border border-white/5 rounded-xl overflow-hidden bg-white/[0.01] transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isExpanded ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400">
                        Thinking Process
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{isExpanded ? 'Hide' : 'Show'}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <pre className="font-mono text-[11px] text-indigo-300/40 whitespace-pre-wrap leading-relaxed italic">
                        {content.trim()}
                    </pre>
                </div>
            )}
        </div>
    );
};

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        parts.push({ type: 'code', language: match[1], content: match[2] });
        lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return (
        <div className="space-y-3">
            {parts.map((part, idx) => {
                if (part.type === 'code') {
                    const isThinking = part.language === 'thinking' || part.content.toLowerCase().includes('reasoning:');

                    if (isThinking) {
                        return <ThinkingBlock key={idx} content={part.content} />;
                    }

                    return (
                        <div key={idx} className="border rounded-xl my-4 overflow-hidden bg-slate-950 border-white/5">
                            <div className="flex items-center justify-between px-4 py-2 border-b bg-white/[0.01] border-white/5">
                                <span className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-600">{part.language || 'Protocol'}</span>
                                <button className="text-[8px] text-slate-600 hover:text-white transition uppercase font-black tracking-[0.1em]" onClick={() => navigator.clipboard.writeText(part.content)}>Copy</button>
                            </div>
                            <div className="p-4 overflow-x-auto custom-scrollbar">
                                <pre className="font-mono text-[12px] whitespace-pre leading-relaxed text-slate-400">{part.content?.trim()}</pre>
                            </div>
                        </div>
                    );
                } else {
                    if (!part.content?.trim()) return null;
                    return part.content?.split('\n').map((line, lineIdx) => {
                        if (!line.trim()) return <div key={lineIdx} className="h-2" />;

                        const isBullet = line.trim().match(/^[-*]\s/);
                        const isNumber = line.trim().match(/^\d+\.\s/);

                        let content = line.trim();
                        if (isBullet) content = content.substring(2);
                        else if (isNumber) content = content.substring(line.indexOf(' ') + 1);

                        const inlineParts = content.split(/(\*\*.*?\*\*|`.*?`)/g).map((subPart, subIdx) => {
                            if (subPart.startsWith('**') && subPart.endsWith('**')) {
                                return <strong key={subIdx} className="text-white font-bold">{subPart.slice(2, -2)}</strong>;
                            }
                            if (subPart.startsWith('`') && subPart.endsWith('`')) {
                                return <span key={subIdx} className="bg-white/5 text-indigo-300 font-mono text-[11px] px-1 py-0.5 rounded border border-white/5 font-semibold">{subPart.slice(1, -1)}</span>;
                            }
                            return subPart;
                        });

                        return (
                            <div key={lineIdx} className={`min-h-[1.4em] ${isBullet || isNumber ? 'pl-6 relative mb-2' : 'mb-2'}`}>
                                {isBullet && <span className="absolute left-1.5 top-2 w-1 h-1 rounded-full bg-indigo-500/30" />}
                                {isNumber && <span className="absolute left-0 text-indigo-500/20 text-[10px] font-mono top-0.5 font-bold">{line.match(/^\d+\./)?.[0]}</span>}
                                <span className="text-slate-300 leading-relaxed font-normal text-[14px]">{inlineParts}</span>
                            </div>
                        );
                    });
                }
            })}
        </div>
    )
}

export const Message: React.FC<MessageProps> = ({ message, onExecuteCommand, onExpandMessage }) => {
    const isUser = message.type === 'user';
    const mode = (message.content as any).mode || 'CHAT';
    const isExpanding = (message.content as any).isExpanding;
    const solution = (message.content as any).solution;

    const renderContent = () => {
        switch (message.content.type) {
            case 'text':
                return (
                    <div className="space-y-3">
                        {mode === 'SOLUTION' && (
                            <div className="flex items-center gap-2 mb-4 bg-indigo-500/5 p-2 px-3 rounded-lg border border-indigo-500/10">
                                <span className="w-1 h-4 bg-indigo-500/60 rounded-full" />
                                <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-[0.2em]">Intelligence Resolution</span>
                            </div>
                        )}

                        <SimpleMarkdown text={message.content.text} />

                        {!isUser && message.agent.id !== 'prism-core' && !solution && !isExpanding && (
                            <div className="mt-3">
                                <button
                                    onClick={() => onExpandMessage?.(message.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-white/10 text-[9px] text-indigo-400 font-black uppercase tracking-[0.1em] rounded-md border border-white/5 transition-all active:scale-95 group"
                                >
                                    <span>Expand</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 group-hover:translate-y-0.5 transition-transform">
                                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {isExpanding && (
                            <div className="mt-3 flex items-center gap-2 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10 animate-pulse">
                                <LoadingSpinner width={20} height={10} />
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Synthesizing...</span>
                            </div>
                        )}

                        {solution && (
                            <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-400">
                                <div className="flex items-center gap-2 mb-4 opacity-30">
                                    <div className="h-px flex-1 bg-white/20" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Solution_Matrix</span>
                                    <div className="h-px flex-1 bg-white/20" />
                                </div>
                                <SimpleMarkdown text={solution} />
                            </div>
                        )}

                        {message.content.groundingChunks && (
                            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                {message.content.groundingChunks.map((c, i) => {
                                    const s = c.web || c.maps;
                                    return s?.uri ? <a key={i} href={s.uri} target="_blank" className="text-[8px] bg-white/[0.03] text-slate-500 px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/10 hover:text-white transition-all uppercase tracking-[0.1em] font-bold">{s.title || 'Citation'}</a> : null;
                                })}
                            </div>
                        )}

                        {message.content.toolCall && (
                            <CommandProposal
                                toolCall={message.content.toolCall}
                                isExecuting={message.content.isExecuting}
                                onProceed={(args) => onExecuteCommand?.(message.id, args ? { ...message.content.toolCall!, args } : message.content.toolCall!)}
                            />
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-4">
                        {message.content.text && <SimpleMarkdown text={message.content.text} />}
                        <div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-lg transition-all duration-500 hover:border-white/20">
                            <img src={message.content.imageUrl} alt="Synthesis" className="w-full h-auto" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end">
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Synthesis Resolved</span>
                            </div>
                        </div>
                    </div>
                );
            case 'video':
                return (
                    <div className="space-y-4">
                        {message.content.text && <SimpleMarkdown text={message.content.text} />}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg bg-black">
                            <video src={message.content.videoUrl} controls autoPlay loop className="w-full h-auto" />
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className={`flex items-start gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] lg:max-w-2xl xl:max-w-3xl`}>
                {!isUser && (
                    <div className="flex items-center gap-2.5 mb-2 ml-1">
                        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-white/[0.04] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all duration-300">
                            {message.agent.profileImage ? (
                                <img src={message.agent.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-xs">{message.agent.icon}</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-300 transition-colors leading-none">{message.agent.name}</span>
                            <span className="text-[8px] text-indigo-400/40 font-black uppercase tracking-[0.05em]">{message.agent.role}</span>
                        </div>
                    </div>
                )}
                <div className={`p-2 md:p-3 rounded-2xl text-[14px] leading-relaxed transition-all duration-300 ${isUser ? 'bg-transparent text-white border border-white/10 shadow-none' : 'bg-transparent text-slate-300 border border-white/5'} ${mode === 'SOLUTION' ? 'border-indigo-500/20' : ''}`}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
