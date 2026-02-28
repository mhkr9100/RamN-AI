import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToolCatalog, ToolEntry, ToolEndpoint } from '../services/toolService';

// Category icons map
const CATEGORY_ICONS: Record<string, string> = {
    'Finance': '💹',
    'Market Research': '🔍',
    'Development': '⚙️',
    'Data & Analytics': '📊',
    'Communication': '💬',
    'Productivity': '⚡',
    'Media': '🎬',
    'AI & ML': '🧠',
    'Security': '🔒',
    'Infrastructure': '🏗️',
};

// Auth badge colors
const AUTH_BADGE: Record<string, { label: string; color: string }> = {
    'none': { label: 'Free', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    'optional': { label: 'Optional Key', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    'apiKey': { label: 'API Key', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'oauth': { label: 'OAuth', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

const ToolCard: React.FC<{
    tool: ToolEntry;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ tool, isExpanded, onToggle }) => {
    const badge = AUTH_BADGE[tool.authType] || AUTH_BADGE['apiKey'];

    return (
        <motion.div
            layout
            className={`group relative bg-black/20 border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? 'ring-1 ring-white/10' : ''}`}
        >
            <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={onToggle}>
                {/* Icon */}
                <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {CATEGORY_ICONS[tool.category] || '🔧'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-black text-white text-sm uppercase tracking-tight truncate">{tool.name}</h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
                        {tool.cors && (
                            <span className="text-[7px] font-bold uppercase tracking-widest text-white/20 px-1.5 py-0.5 rounded border border-white/5">CORS</span>
                        )}
                    </div>
                    <p className="text-[11px] text-white/40 mt-1 truncate">{tool.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">{tool.provider}</span>
                        <span className="text-[9px] text-white/15">•</span>
                        <span className="text-[9px] text-white/20 font-mono">{tool.endpoints.length} endpoint{tool.endpoints.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Expand Button */}
                <button className={`p-2 rounded-xl transition-all border flex-shrink-0 ${isExpanded ? 'bg-white text-black border-white rotate-180' : 'bg-white/5 text-white/40 hover:text-white border-white/5 hover:border-white/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>

            {/* Expanded Endpoints */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1">
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-4 opacity-40">
                                    <div className="h-px flex-1 bg-white/20" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Endpoints</span>
                                    <div className="h-px flex-1 bg-white/20" />
                                </div>
                                <div className="space-y-3">
                                    {tool.endpoints.map((ep, idx) => (
                                        <EndpointRow key={idx} endpoint={ep} />
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] text-white/20 font-mono truncate max-w-[70%]">{tool.baseUrl}</span>
                                    <span className="text-[8px] text-white/15 uppercase tracking-widest font-bold">{tool.category}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const EndpointRow: React.FC<{ endpoint: ToolEndpoint }> = ({ endpoint }) => {
    const methodColors: Record<string, string> = {
        'GET': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        'POST': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        'PUT': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        'DELETE': 'text-red-400 bg-red-500/10 border-red-500/20',
    };

    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${methodColors[endpoint.method] || 'text-white/40 bg-white/5 border-white/10'}`}>
                {endpoint.method}
            </span>
            <div className="flex-1 min-w-0">
                <span className="text-[11px] text-white/70 font-mono font-bold">{endpoint.name}</span>
                <span className="text-[10px] text-white/20 font-mono ml-2 truncate">{endpoint.path}</span>
                {endpoint.params.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {endpoint.params.map((p, i) => (
                            <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${p.required ? 'bg-white/5 text-white/40 border border-white/10' : 'text-white/20'}`}>
                                {p.name}{p.required && <span className="text-red-400 ml-0.5">*</span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ToolsView: React.FC = () => {
    const [tools, setTools] = useState<ToolEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const catalog = await getToolCatalog();
                setTools(catalog);
            } catch (e) {
                console.error('[ToolsView] Failed to load catalog', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(tools.map(t => t.category))];
        return cats.sort();
    }, [tools]);

    const filteredTools = useMemo(() => {
        let result = tools;
        if (selectedCategory) {
            result = result.filter(t => t.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.provider.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q)
            );
        }
        return result;
    }, [tools, searchQuery, selectedCategory]);

    const groupedTools = useMemo(() => {
        const groups: Record<string, ToolEntry[]> = {};
        for (const tool of filteredTools) {
            if (!groups[tool.category]) groups[tool.category] = [];
            groups[tool.category].push(tool);
        }
        return groups;
    }, [filteredTools]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-white/30 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Loading Tool Catalog...</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Tool Catalog</h3>
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] text-white/20 font-mono">{tools.length} tools available</span>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search tools, APIs, providers..."
                        className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${!selectedCategory ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                            className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                        >
                            {CATEGORY_ICONS[cat] || '🔧'} {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            {Object.keys(groupedTools).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 text-2xl">🔍</div>
                    <h4 className="text-white/40 font-black uppercase tracking-widest text-xs mb-2">No Tools Found</h4>
                    <p className="text-white/20 text-[10px]">Try adjusting your search or filter.</p>
                </div>
            ) : (
                Object.entries(groupedTools).map(([category, categoryTools]) => (
                    <div key={category} className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-lg">{CATEGORY_ICONS[category] || '🔧'}</span>
                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">{category}</h4>
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[8px] text-white/15 font-mono">{categoryTools.length}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {categoryTools.map(tool => (
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    isExpanded={expandedId === tool.id}
                                    onToggle={() => setExpandedId(expandedId === tool.id ? null : tool.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Footer */}
            <div className="mt-8 mb-16 text-center">
                <p className="text-[9px] text-white/15 uppercase tracking-widest font-bold">
                    More tools coming soon • MCP Integration Planned
                </p>
            </div>
        </div>
    );
};
