
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { LoadingSpinner } from './LoadingSpinner';
import { Agent } from '../types';
import { BetaLockedWrapper } from './BetaLockedWrapper';

interface InputBarProps {
  onSubmit: (prompt: string, steps: number, file?: { data: string, mimeType: string }, searchEnabled?: boolean, routeEnabled?: boolean) => void;
  onOpenTaskModal?: () => void;
  onSaveInterval?: () => void;
  onOpenLiveSpace?: () => void;
  canOpenLiveSpace?: boolean;
  isLoading: boolean;
  mentionCandidates?: Agent[];
  isGroup?: boolean;
  isPrism?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSubmit,
  onOpenTaskModal,
  onSaveInterval,
  onOpenLiveSpace,
  canOpenLiveSpace,
  isLoading,
  mentionCandidates = [],
  isGroup = false,
  isPrism = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ data: string; mimeType: string } | null>(null);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [isRouteMode, setIsRouteMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCandidates = (mentionCandidates || []).filter(c =>
    c && c.name && typeof c.name === 'string' &&
    c.name.toLowerCase().includes((mentionFilter || '').toLowerCase()) &&
    c.id !== 'prism-core' && c.id !== 'prism-core-member'
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (prompt.trim() || fileData) {
      onSubmit(prompt, 1, fileData, false, isRouteMode);
      setPrompt('');
      setFileData(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({ data: reader.result as string, mimeType: file.type });
        if (file.type.startsWith('image/')) {
          setFilePreview(reader.result as string);
        } else {
          setFilePreview(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full pb-6 pt-4 px-4 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/95 to-transparent relative z-20">
      <div className="mx-auto max-w-3xl relative">

        <div className="absolute -top-12 left-0 flex items-center gap-2 z-30">
          {!isPrism && (
            <BetaLockedWrapper>
              <button
                className="px-4 py-1.5 bg-[#0a0a0a] border border-white/10 text-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg cursor-not-allowed"
              >
                Task
              </button>
            </BetaLockedWrapper>
          )}

          {isPrism && (
            <button
              onClick={() => setIsRouteMode(!isRouteMode)}
              className={`px-4 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isRouteMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-[#0a0a0a] text-white/40 border-white/10 hover:border-indigo-500/30 hover:text-white'
                }`}
            >
              {isRouteMode ? '🟢 Route Mode: ON' : '⚫ Route Mode: OFF'}
            </button>
          )}

          {!isPrism && (
            <>
              <BetaLockedWrapper>
                <button
                  className="px-4 py-1.5 bg-indigo-900/40 border border-indigo-500/20 text-indigo-400/40 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-not-allowed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
                  LiveTask
                </button>
              </BetaLockedWrapper>

              <button
                onClick={onSaveInterval}
                className="px-4 py-1.5 bg-[#0a0a0a] border border-white/10 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:border-indigo-500/30"
              >
                Save Interval
              </button>
            </>
          )}
        </div>

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

        {filePreview && (
          <div className='relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 mb-4 shadow-xl animate-in zoom-in duration-200'>
            <img src={filePreview} alt="preview" className='w-full h-full object-cover' />
            <button onClick={() => { setFilePreview(null); setFileData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className='absolute top-1 right-1 bg-black/80 rounded-full p-1 text-white hover:bg-white hover:text-black transition-all border border-white/5'><XMarkIcon size={12} /></button>
          </div>
        )}

        {fileData && !filePreview && (
          <div className='bg-[#0a0a0a] border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between text-[10px] text-white/60 animate-in slide-in-from-bottom-2'>
            <div className="flex items-center gap-2 uppercase tracking-widest font-bold">
              <span>📎</span> {fileData.mimeType} Data Loaded
            </div>
            <button onClick={() => { setFileData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className='text-white/20 hover:text-white'><XMarkIcon size={12} /></button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full transition-all duration-200 text-white/40 hover:bg-white/10 hover:text-white"
            title="Upload"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-white/[0.04] p-2 rounded-2xl shadow-lg border border-white/5 focus-within:border-white/20 transition-all duration-300 backdrop-blur-xl">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
              placeholder="Refract intelligence..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none max-h-[100px] overflow-y-auto py-2.5 px-3 custom-scrollbar leading-relaxed"
              rows={1}
            />

            <button type="submit" disabled={(!prompt.trim() && !fileData)} className={`p-2.5 rounded-xl transition-all duration-300 self-end ${(prompt.trim() || fileData) ? 'bg-white text-black shadow-md hover:bg-white/90' : 'bg-transparent text-white/5 cursor-not-allowed'}`}>
              {isLoading ? <LoadingSpinner width={20} height={10} /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
