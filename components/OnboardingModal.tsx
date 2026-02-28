import React, { useState, useEffect } from 'react';
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
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
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
                        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '90%',
                        color: '#fff', position: 'relative'
                    }}
                >
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', color: '#666', cursor: 'pointer'
                    }}>
                        <X size={18} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            style={{ fontSize: '48px', marginBottom: '16px' }}
                        >
                            <Sparkles size={48} strokeWidth={1.5} />
                        </motion.div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
                            Welcome to RamN AI
                        </h2>
                        <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
                            Your AI workspace for agents, teams, and automation.
                            <br />Get started in 30 seconds.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                        padding: '20px', marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Key size={16} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>Add Your API Key</div>
                                <div style={{ color: '#888', fontSize: '12px' }}>Google Gemini, OpenAI, or Anthropic</div>
                            </div>
                        </div>
                        <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                            RamN AI connects directly to AI providers using your API key.
                            Your key stays in your browser — we never store it on our servers.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                        padding: '20px', marginBottom: '32px'
                    }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                            Quick Start
                        </div>
                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#bbb', fontSize: '13px', lineHeight: 2 }}>
                            <li>Open <b>User Profile</b> and add at least one API key</li>
                            <li>Chat with <b>Prism</b> — describe your workflow</li>
                            <li>Prism creates <b>specialized agents</b> for you</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => { onClose(); onOpenProfile(); }}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontSize: '15px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e: React.MouseEvent) => { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(102,126,234,0.4)'; }}
                        onMouseLeave={(e: React.MouseEvent) => { (e.target as HTMLElement).style.transform = 'none'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
                    >
                        Set Up API Key <ArrowRight size={16} />
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#666' }}>
                        Need a free key? Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: '#667eea' }}>Google AI Studio</a>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
