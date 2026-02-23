
import React, { useState } from 'react';
import { UserMapNode } from '../../types';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserMapEditorProps {
    node: UserMapNode;
    onUpdate: (updatedNode: UserMapNode) => void;
    onDelete?: () => void;
    depth?: number;
}

export const UserMapEditor: React.FC<UserMapEditorProps> = ({ node, onUpdate, onDelete, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(node.label);

    const handleAddChild = () => {
        const newNode: UserMapNode = {
            id: `node-${Date.now()}`,
            label: 'New Node',
            children: [],
            isEditable: true
        };
        onUpdate({
            ...node,
            children: [...(node.children || []), newNode]
        });
        setIsExpanded(true);
    };

    const handleUpdateChild = (index: number, updatedChild: UserMapNode) => {
        const newChildren = [...(node.children || [])];
        newChildren[index] = updatedChild;
        onUpdate({ ...node, children: newChildren });
    };

    const handleDeleteChild = (index: number) => {
        const newChildren = [...(node.children || [])];
        newChildren.splice(index, 1);
        onUpdate({ ...node, children: newChildren });
    };

    const handleSaveEdit = () => {
        onUpdate({ ...node, label: editLabel });
        setIsEditing(false);
    };

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 py-2 px-3 rounded-lg group transition-all ${depth === 0 ? 'bg-white/5 border border-white/10 mb-2' : 'hover:bg-white/5'}`}
                style={{ marginLeft: depth > 0 ? `${depth * 12}px` : '0' }}
            >
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${(!node.children || node.children.length === 0) ? 'opacity-0 pointer-events-none' : 'opacity-40 hover:opacity-100'}`}
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                        <input 
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-indigo-500"
                        />
                        <button onClick={handleSaveEdit} className="text-emerald-500 hover:text-emerald-400"><Check size={14} /></button>
                        <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-400"><X size={14} /></button>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-widest ${depth === 0 ? 'text-white' : 'text-white/60'}`}>
                            {node.label}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsEditing(true)} className="p-1 text-white/20 hover:text-white transition-colors" title="Edit Label">
                                <Edit2 size={12} />
                            </button>
                            <button onClick={handleAddChild} className="p-1 text-white/20 hover:text-emerald-400 transition-colors" title="Add Child">
                                <Plus size={12} />
                            </button>
                            {onDelete && (
                                <button onClick={onDelete} className="p-1 text-white/20 hover:text-red-400 transition-colors" title="Delete Node">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && node.children && node.children.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l border-white/5 ml-4"
                    >
                        {node.children.map((child, idx) => (
                            <UserMapEditor 
                                key={child.id} 
                                node={child} 
                                depth={depth + 1}
                                onUpdate={(updated) => handleUpdateChild(idx, updated)}
                                onDelete={() => handleDeleteChild(idx)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
