import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Key, ArrowRight, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOpenProfile: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen, onClose, onOpenProfile }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    style={{
                        background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '90%',
                        color: '#fff', position: 'relative'
                    }}
                >
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer'
                    }}>
                        <X size={18} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            style={{ marginBottom: '16px', color: 'rgba(255,255,255,0.6)' }}
                        >
                            <Sparkles size={48} strokeWidth={1.5} />
                        </motion.div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
                            Welcome to RamN AI
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: 1.6 }}>
                            Your AI workspace for agents, teams, and automation.
                            <br />Get started in 30 seconds.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                        padding: '20px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                <Key size={16} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Add Your API Key</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Google Gemini, OpenAI, or Anthropic</div>
                            </div>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                            RamN AI connects directly to AI providers using your API key.
                            Your key stays in your browser — we never store it on our servers.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                        padding: '20px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                            Quick Start
                        </div>
                        <ol style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 2 }}>
                            <li>Open <b style={{ color: 'rgba(255,255,255,0.7)' }}>User Profile</b> and add at least one API key</li>
                            <li>Chat with <b style={{ color: 'rgba(255,255,255,0.7)' }}>Prism</b> — describe your workflow</li>
                            <li>Prism creates <b style={{ color: 'rgba(255,255,255,0.7)' }}>specialized agents</b> for you</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => { onClose(); onOpenProfile(); }}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                            fontSize: '15px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e: React.MouseEvent) => { const t = e.currentTarget as HTMLElement; t.style.background = 'rgba(255,255,255,0.12)'; t.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                        onMouseLeave={(e: React.MouseEvent) => { const t = e.currentTarget as HTMLElement; t.style.background = 'rgba(255,255,255,0.08)'; t.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    >
                        Set Up API Key <ArrowRight size={16} />
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                        Need a free key? Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Google AI Studio</a>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
