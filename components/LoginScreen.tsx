import React, { useState } from 'react';
import { PrismIcon } from './icons/PrismIcon';
import { authService } from '../services/auth';

interface LoginScreenProps {
    onLogin: (email: string, name: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !email.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }
        setIsLoading(true);

        try {
            await authService.login(email);
            const user = await authService.getCurrentUser();
            onLogin(email, user?.name || 'Architect');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] p-4 text-white font-sans selection:bg-white/10">
            <div className="max-w-md w-full space-y-10">
                <div className="flex flex-col items-center">
                    <div className="mb-8 text-white">
                        <PrismIcon size={64} />
                    </div>
                    <h1 className="text-2xl font-black tracking-[0.3em] uppercase text-white">RamN AI</h1>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Enter Email to Access the Orchestrator</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Email Address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white outline-none transition-colors"
                                placeholder="Enter your email to login"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl active:scale-[0.98] hover:bg-slate-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Initialize Session'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-[9px] font-mono uppercase tracking-widest text-white/20 pt-8 border-t border-white/5">
                    Local Environment • Email Login
                </p>
            </div>
        </div>
    );
};
