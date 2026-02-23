
import React, { useState } from 'react';
import { PrismIcon } from './icons/PrismIcon';
import { authService } from '../services/auth';

interface LoginScreenProps {
    onLogin: (email: string, name: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!isSupabaseConfigured) {
            // Using AWS Cognito Mock
            try {
                if (isSignUp) {
                    await authService.signUp(name, password, email);
                    onLogin(email, name);
                } else {
                    await authService.login(email, password);
                    onLogin(email, 'Architect');
                }
            } catch (err: any) {
                setError(err.message || 'Authentication failed');
            } finally {
                setIsLoading(false);
            }
            return;
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
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Authenticate to access the orchestrator</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {!isSupabaseConfigured && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-xl text-center uppercase tracking-widest">
                            Supabase Configuration Missing. Real-time features disabled.
                        </div>
                    )}

                    <div className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Display Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required={isSignUp}
                                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white outline-none transition-colors"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Email Address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white outline-none transition-colors"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white outline-none transition-colors"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl active:scale-[0.98] hover:bg-slate-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Initialize Session')}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="w-full text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-[9px] font-mono uppercase tracking-widest text-white/20 pt-8 border-t border-white/5">
                    Production Environment • Secure Cloud Authentication
                </p>
            </div>
        </div>
    );
};
