import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-white text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] mx-auto">
                            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">⚠️</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent mb-4">
                        System Anomaly Detected
                    </h1>
                    <p className="text-white/60 mb-8 max-w-md break-words text-sm">
                        {this.state.error?.message || "An unexpected error occurred in the workspace. Our architects have been notified."}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-[0.98]"
                    >
                        Restart Workspace
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
