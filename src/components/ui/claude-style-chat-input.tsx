"use client"

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown, ArrowUp, X, FileText, Loader2, Check, Archive, Sparkles, Zap } from "lucide-react";

/* --- UTILS --- */
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* --- TYPES --- */
interface AttachedFile {
    id: string;
    file: File;
    type: string;
    preview: string | null;
    uploadStatus: string;
    content?: string;
}

interface PastedContentItem {
    id: string;
    content: string;
    timestamp: Date;
}

interface Model {
    id: string;
    name: string;
    description: string;
    tier: 'fast' | 'standard' | 'premium';
    badge?: string;
}

/* --- FILE PREVIEW CARD --- */
interface FilePreviewCardProps {
    file: AttachedFile;
    onRemove: (id: string) => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/") && file.preview;

    return (
        <div className="relative group flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border bg-card animate-fade-in transition-all hover:border-green-500/50">
            {isImage ? (
                <div className="w-full h-full relative">
                    <img src={file.preview!} alt={file.file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
            ) : (
                <div className="w-full h-full p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary rounded">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                            {file.file.name.split('.').pop()}
                        </span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground truncate" title={file.file.name}>
                            {file.file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {formatFileSize(file.file.size)}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={() => onRemove(file.id)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>

            {file.uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
            )}
        </div>
    );
};

/* --- PASTED CONTENT CARD --- */
interface PastedContentCardProps {
    content: PastedContentItem;
    onRemove: (id: string) => void;
}

const PastedContentCard: React.FC<PastedContentCardProps> = ({ content, onRemove }) => {
    return (
        <div className="relative group flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-border bg-card animate-fade-in p-3 flex flex-col justify-between">
            <div className="overflow-hidden w-full">
                <p className="text-[10px] text-muted-foreground leading-[1.4] font-mono break-words whitespace-pre-wrap line-clamp-4 select-none">
                    {content.content}
                </p>
            </div>

            <div className="flex items-center justify-between w-full mt-2">
                <div className="inline-flex items-center justify-center px-1.5 py-[2px] rounded border border-border bg-card">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">PASTED</span>
                </div>
            </div>

            <button
                onClick={() => onRemove(content.id)}
                className="absolute top-2 right-2 p-[3px] bg-card border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-2 h-2" />
            </button>
        </div>
    );
};

/* --- MODEL SELECTOR --- */
interface ModelSelectorProps {
    models: Model[];
    selectedModel: string;
    onSelect: (modelId: string) => void;
    isPremium?: boolean;
    onUpgradeClick?: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelect, isPremium, onUpgradeClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentModel = models.find(m => m.id === selectedModel) || models[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTierIcon = (tier: string) => {
        if (tier === 'fast') return <Zap className="w-3.5 h-3.5 text-blue-500" />;
        if (tier === 'premium') return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
        return <Sparkles className="w-3.5 h-3.5 text-green-500" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center gap-1.5 h-8 rounded-xl px-3 text-sm font-medium transition-colors
                    ${isOpen ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
                {getTierIcon(currentModel.tier)}
                <span className="hidden sm:inline">{currentModel.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 p-1.5">
                    {/* Fast */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">Fast</div>
                    {models.filter(m => m.tier === 'fast').map(model => (
                        <button
                            key={model.id}
                            onClick={() => { onSelect(model.id); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors hover:bg-secondary
                                ${selectedModel === model.id ? 'bg-green-500/10' : ''}`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span className={`text-sm font-medium ${selectedModel === model.id ? 'text-green-500' : 'text-foreground'}`}>
                                        {model.name}
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground ml-6">{model.description}</span>
                            </div>
                            {selectedModel === model.id && <Check className="w-4 h-4 text-green-500" />}
                        </button>
                    ))}

                    {/* Standard */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase mt-2 border-t border-border pt-2">Standard</div>
                    {models.filter(m => m.tier === 'standard').map(model => (
                        <button
                            key={model.id}
                            onClick={() => { onSelect(model.id); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors hover:bg-secondary
                                ${selectedModel === model.id ? 'bg-green-500/10' : ''}`}
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-green-500" />
                                    <span className={`text-sm font-medium ${selectedModel === model.id ? 'text-green-500' : 'text-foreground'}`}>
                                        {model.name}
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground ml-6">{model.description}</span>
                            </div>
                            {selectedModel === model.id && <Check className="w-4 h-4 text-green-500" />}
                        </button>
                    ))}

                    {/* Premium */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase mt-2 border-t border-border pt-2">Premium</div>
                    {models.filter(m => m.tier === 'premium').map(model => (
                        <button
                            key={model.id}
                            onClick={() => {
                                if (isPremium) {
                                    onSelect(model.id);
                                    setIsOpen(false);
                                } else {
                                    onUpgradeClick?.();
                                    setIsOpen(false);
                                }
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors hover:bg-secondary"
                        >
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-foreground">{model.name}</span>
                                    {!isPremium && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                                            PRO
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-muted-foreground ml-6">{model.description}</span>
                            </div>
                            {selectedModel === model.id && isPremium && <Check className="w-4 h-4 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* --- MAIN CHAT INPUT --- */
interface ClaudeChatInputProps {
    onSendMessage: (data: {
        message: string;
        files: AttachedFile[];
        pastedContent: PastedContentItem[];
        model: string;
    }) => void;
    models?: Model[];
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    isPremium?: boolean;
    onUpgradeClick?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const ClaudeChatInput: React.FC<ClaudeChatInputProps> = ({
    onSendMessage,
    models = [
        { id: "gemini-flash", name: "Gemini Flash", description: "Fastest responses", tier: 'fast' },
        { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Great for everyday tasks", tier: 'standard' },
        { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", description: "Balanced performance", tier: 'standard' },
        { id: "llama-3.3-70b", name: "Llama 3.3 70B", description: "Open source power", tier: 'standard' },
        { id: "gpt-4o", name: "GPT-4o", description: "Most capable", tier: 'premium' },
        { id: "claude-sonnet-4", name: "Claude Sonnet 4", description: "Latest & greatest", tier: 'premium' },
    ],
    selectedModel: externalSelectedModel,
    onModelChange,
    isPremium = false,
    onUpgradeClick,
    placeholder = "Ask about any stock, market trends, or financial analysis...",
    disabled = false,
    className = "",
}) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [pastedContent, setPastedContent] = useState<PastedContentItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [internalSelectedModel, setInternalSelectedModel] = useState(models[0].id);

    const selectedModelValue = externalSelectedModel || internalSelectedModel;
    const setSelectedModel = onModelChange || setInternalSelectedModel;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [message]);

    // File Handling
    const handleFiles = useCallback((newFilesList: FileList | File[]) => {
        const newFiles = Array.from(newFilesList).map(file => {
            const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
            return {
                id: Math.random().toString(36).substr(2, 9),
                file,
                type: isImage ? 'image/unknown' : (file.type || 'application/octet-stream'),
                preview: isImage ? URL.createObjectURL(file) : null,
                uploadStatus: 'pending'
            };
        });

        setFiles(prev => [...prev, ...newFiles]);

        newFiles.forEach(f => {
            setTimeout(() => {
                setFiles(prev => prev.map(p => p.id === f.id ? { ...p, uploadStatus: 'complete' } : p));
            }, 800 + Math.random() * 1000);
        });
    }, []);

    // Drag & Drop
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    // Paste Handling
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            handleFiles(pastedFiles);
            return;
        }

        // Handle large text paste
        const text = e.clipboardData.getData('text');
        if (text.length > 500) {
            e.preventDefault();
            const snippet: PastedContentItem = {
                id: Math.random().toString(36).substr(2, 9),
                content: text,
                timestamp: new Date()
            };
            setPastedContent(prev => [...prev, snippet]);
        }
    };

    const handleSend = () => {
        if ((!message.trim() && files.length === 0 && pastedContent.length === 0) || disabled) return;
        onSendMessage({ message, files, pastedContent, model: selectedModelValue });
        setMessage("");
        setFiles([]);
        setPastedContent([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;

    return (
        <div
            className={`relative w-full transition-all duration-300 ${className}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className={`
                flex flex-col items-stretch transition-all duration-200 relative z-10 rounded-2xl cursor-text
                border border-border bg-card
                shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-green-500/50
            `}>

                <div className="flex flex-col px-4 pt-4 pb-3 gap-3">

                    {/* Artifacts (Files & Pastes) */}
                    {(files.length > 0 || pastedContent.length > 0) && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {pastedContent.map(content => (
                                <PastedContentCard
                                    key={content.id}
                                    content={content}
                                    onRemove={id => setPastedContent(prev => prev.filter(c => c.id !== id))}
                                />
                            ))}
                            {files.map(file => (
                                <FilePreviewCard
                                    key={file.id}
                                    file={file}
                                    onRemove={id => setFiles(prev => prev.filter(f => f.id !== id))}
                                />
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onPaste={handlePaste}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="w-full bg-transparent border-0 outline-none text-foreground text-base md:text-lg placeholder:text-muted-foreground resize-none overflow-hidden leading-relaxed min-h-[60px] md:min-h-[80px]"
                            rows={1}
                            autoFocus
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-2 w-full items-center">
                        {/* Left Tools */}
                        <div className="flex-1 flex items-center gap-1">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                type="button"
                                aria-label="Attach file"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right Tools */}
                        <div className="flex items-center gap-2">
                            <ModelSelector
                                models={models}
                                selectedModel={selectedModelValue}
                                onSelect={setSelectedModel}
                                isPremium={isPremium}
                                onUpgradeClick={onUpgradeClick}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!hasContent || disabled}
                                className={`
                                    inline-flex items-center justify-center h-9 w-9 rounded-xl transition-all
                                    ${hasContent && !disabled
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-md'
                                        : 'bg-secondary text-muted-foreground cursor-not-allowed'}
                                `}
                                type="button"
                                aria-label="Send message"
                            >
                                {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-green-500/10 border-2 border-dashed border-green-500 rounded-2xl z-50 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none">
                    <Archive className="w-10 h-10 text-green-500 mb-2 animate-bounce" />
                    <p className="text-green-500 font-medium">Drop files to upload</p>
                </div>
            )}

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.csv,.doc,.docx,image/*"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = '';
                }}
            />
        </div>
    );
};

export default ClaudeChatInput;
