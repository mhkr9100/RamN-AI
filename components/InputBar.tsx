
import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Agent } from '../types';

export type PrismMode = 'create' | 'route' | 'ask';

interface InputBarProps {
  onSubmit: (prompt: string, steps: number, file?: undefined, searchEnabled?: boolean, createEnabled?: boolean, prismMode?: PrismMode) => void;
  isLoading: boolean;
  mentionCandidates?: Agent[];
  isGroup?: boolean;
  isPrism?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSubmit,
  isLoading,
  mentionCandidates = [],
  isGroup = false,
  isPrism = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [prismMode, setPrismMode] = useState<PrismMode>('ask');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredCandidates = (mentionCandidates || []).filter(c =>
    c && c.name && typeof c.name === 'string' &&
    c.name.toLowerCase().includes((mentionFilter || '').toLowerCase()) &&
    c.id !== 'prism-core' && c.id !== 'prism-core-member'
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, 1, undefined, false, prismMode === 'create', isPrism ? prismMode : undefined);
      setPrompt('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      setShowMentions(false);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [prompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setPrompt(newVal);
    const cursor = e.target.selectionStart;
    const textUpToCursor = newVal.slice(0, cursor || 0);
    const lastAt = textUpToCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const query = textUpToCursor.slice(lastAt + 1);
      if (!query.includes('\n') && !query.includes(' ')) {
        setMentionFilter(query);
        setShowMentions(true);
      } else setShowMentions(false);
    } else setShowMentions(false);
  };

  const selectMention = (agent: Agent) => {
    const lastAt = prompt.lastIndexOf('@');
    const prefix = prompt.substring(0, lastAt);
    const newPrompt = `${prefix}@${agent.name} `;
    setPrompt(newPrompt);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const PRISM_MODES: { key: PrismMode; label: string; icon: string; color: string; activeColor: string }[] = [
    { key: 'ask', label: 'Ask Prism', icon: '💎', color: 'hover:border-indigo-500/30 hover:text-white', activeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' },
    { key: 'create', label: 'Create Agents', icon: '⚡', color: 'hover:border-emerald-500/30 hover:text-white', activeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
    { key: 'route', label: 'Route', icon: '🧭', color: 'hover:border-amber-500/30 hover:text-white', activeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
  ];

  return (
    <div className="w-full pb-6 pt-4 px-4 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/95 to-transparent relative z-20">
      <div className="mx-auto max-w-3xl relative">

        {/* Prism Mode Buttons */}
        {isPrism && (
          <div className="absolute -top-12 left-0 flex items-center gap-2 z-30">
            {PRISM_MODES.map(mode => (
              <button
                key={mode.key}
                onClick={() => setPrismMode(mode.key)}
                className={`px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${prismMode === mode.key ? mode.activeColor : `bg-[#0a0a0a] text-white/30 border-white/10 ${mode.color}`}`}
              >
                <span className="text-xs">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* Mention Autocomplete */}
        {showMentions && filteredCandidates.length > 0 && (
          <div className="absolute bottom-full left-0 mb-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-2 text-[8px] text-white/40 border-b border-white/5 font-black uppercase tracking-[0.3em] bg-white/[0.02]">Identify Agent</div>
            <ul className="max-h-48 overflow-y-auto custom-scrollbar">
              {filteredCandidates.map((agent) => (
                <li key={agent.id} onClick={() => selectMention(agent)} className="flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-white/10">
                  <span className="text-base">{agent.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs truncate uppercase font-bold text-white">{agent.name}</span>
                    <span className="text-[8px] uppercase font-mono truncate tracking-wider text-white/40">{agent.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-white/[0.04] p-2 rounded-2xl shadow-lg border border-white/5 focus-within:border-white/20 transition-all duration-300 backdrop-blur-xl">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSubmit(); }
              }}
              placeholder={isPrism ? (prismMode === 'create' ? 'Describe the agent you need...' : prismMode === 'route' ? 'Describe your objective...' : 'Ask anything...') : 'Refract intelligence...'}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none max-h-[100px] overflow-y-auto py-2.5 px-3 custom-scrollbar leading-relaxed"
              rows={1}
            />

            <button type="submit" disabled={!prompt.trim()} className={`p-2.5 rounded-xl transition-all duration-300 self-end ${prompt.trim() ? 'bg-white text-black shadow-md hover:bg-white/90' : 'bg-transparent text-white/5 cursor-not-allowed'}`}>
              {isLoading ? <LoadingSpinner width={20} height={10} /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>}
            </button>
          </form>
        </div>
      </div>
    </div >
  );
};
