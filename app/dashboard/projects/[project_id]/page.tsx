'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { apiFetch, getJWT, ApiError } from '@/lib/supabase';
import { API_BASE } from '@/lib/constants';

import ReactMarkdown from 'react-markdown';


// ───────────────────────────────── Types ─────────────────────────────────

interface Attachment {
    id: string;
    s3_url: string;
    file_type: string;
    file_name: string;
}

interface Capture {
    id: string;
    capture_type: string;
    source_url: string | null;
    page_title: string | null;
    text_content?: string | null;
    ide_code_diff: string | null;
    ide_error_log: string | null;
    ide_file_path: string | null;
    ai_markdown_summary: string | null;
    created_at: string;
    capture_attachments: Attachment[];
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    loading?: boolean;
}

// ───────────────────────────── Capture Card ──────────────────────────────

function CaptureCard({ capture, onDelete }: { capture: Capture; onDelete: (id: string) => void }) {
    const [deleting, setDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (deleting) return;
        setDeleting(true);
        onDelete(capture.id); // optimistic
        try {
            await apiFetch(`${API_BASE}/api/captures/${capture.id}`, { method: 'DELETE' });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) router.replace('/login');
            // Silently fail — already removed optimistically
        }
    }

    const typeColors: Record<string, string> = {
        WEB_TEXT: '#38BDF8',
        USER_NOTE: '#A78BFA',
        IDE_BUG_FIX: '#F43F5E',
        IDE_PROGRESS_SNAPSHOT: '#F59E0B',
        VIDEO_SEGMENT: '#10B981',
        RESOURCE_UPLOAD: '#6366F1',
    };

    const typeIcons: Record<string, string> = {
        WEB_TEXT: '🌐',
        USER_NOTE: '📝',
        IDE_BUG_FIX: '🐛',
        IDE_PROGRESS_SNAPSHOT: '📸',
        VIDEO_SEGMENT: '🎬',
        RESOURCE_UPLOAD: '📎',
    };

    const typeLabels: Record<string, string> = {
        WEB_TEXT: 'Web Page',
        USER_NOTE: 'Note',
        IDE_BUG_FIX: 'Bug Fix',
        IDE_PROGRESS_SNAPSHOT: 'Code Snapshot',
        VIDEO_SEGMENT: 'Video',
        RESOURCE_UPLOAD: 'File Upload',
    };

    const color = typeColors[capture.capture_type] ?? '#64748B';
    const icon = typeIcons[capture.capture_type] ?? '📌';
    const isCode = capture.capture_type === 'IDE_BUG_FIX' || capture.capture_type === 'IDE_PROGRESS_SNAPSHOT';
    const imageAttachments = capture.capture_attachments?.filter(
        (a) => a.file_type === 'IMAGE' || a.file_type === 'VIDEO_KEYFRAME'
    );

    return (
        <div
            style={{
                position: 'relative',
                paddingLeft: '2.5rem',
                paddingBottom: '1.5rem',
            }}
        >
            {/* Timeline dot */}
            <div
                style={{
                    position: 'absolute',
                    left: '0',
                    top: '0.9rem',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `${color}20`,
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.55rem',
                    zIndex: 1,
                }}
            >
                {icon}
            </div>

            {/* Card */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    background: '#1C2A3D',
                    border: `1px solid ${deleting ? '#334155' : '#243044'}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: '8px',
                    padding: '0.875rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    opacity: deleting ? 0.4 : 1,
                }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.borderColor = color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#243044'; e.currentTarget.style.borderLeftColor = color; }}
            >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                            style={{
                                display: 'inline-block',
                                fontSize: '0.65rem',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 600,
                                color: color,
                                background: `${color}15`,
                                border: `1px solid ${color}30`,
                                borderRadius: '4px',
                                padding: '0.1rem 0.5rem',
                                marginBottom: '0.4rem',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {typeLabels[capture.capture_type] ?? capture.capture_type}
                        </span>

                        {/* Title / snippet */}
                        {(capture.page_title || capture.source_url) && (
                            <p
                                style={{
                                    fontSize: '0.8rem',
                                    color: '#CBD5E1',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {capture.page_title ?? capture.source_url}
                            </p>
                        )}

                        {isCode && capture.ide_file_path && (
                            <p style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
                                📄 {capture.ide_file_path}
                            </p>
                        )}

                        {/* Text preview — shown collapsed so user can see what was saved */}
                        {capture.text_content && (
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#94A3B8',
                                marginTop: '0.3rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.5,
                            }}>
                                {capture.text_content.slice(0, 180)}{capture.text_content.length > 180 ? '…' : ''}
                            </p>
                        )}
                    </div>

                    {/* Delete btn */}
                    <button
                        id={`delete-capture-${capture.id}`}
                        onClick={handleDelete}
                        aria-label="Delete item"
                        style={{
                            background: 'transparent',
                            border: '1px solid transparent',
                            borderRadius: '6px',
                            color: '#475569',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            fontSize: '0.9rem',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#F43F5E';
                            e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)';
                            e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#475569';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        🗑️
                    </button>
                </div>

                {/* Image attachments */}
                {imageAttachments && imageAttachments.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                        {imageAttachments.map((att) => (
                            <a
                                key={att.id}
                                href={att.s3_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title={att.file_name}
                                style={{
                                    display: 'inline-block',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: '1px solid #334155',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src={att.s3_url}
                                    alt={att.file_name}
                                    style={{
                                        width: '80px',
                                        height: '50px',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.style.background = '#1E293B';
                                        img.style.display = 'flex';
                                        img.alt = '⚠ Unavailable';
                                    }}
                                />
                            </a>
                        ))}
                    </div>
                )}

                {/* Expanded content */}
                {expanded && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #243044', paddingTop: '0.75rem' }}>
                        {/* Code diff — rendered with syntax highlighting */}
                        {isCode && capture.ide_code_diff && (
                            <div style={{ overflowX: 'auto', borderRadius: '6px', fontSize: '0.75rem' }}>
                                <SyntaxHighlighter
                                    language="diff"
                                    style={vscDarkPlus as Record<string, React.CSSProperties>}
                                    customStyle={{
                                        overflowX: 'auto',
                                        maxWidth: '100%',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        margin: 0,
                                        background: '#0A0F1E',
                                    }}
                                    showLineNumbers
                                    wrapLongLines={false}
                                >
                                    {capture.ide_code_diff}
                                </SyntaxHighlighter>
                            </div>
                        )}

                        {/* Text content — note body / web chunk / video transcript */}
                        {capture.text_content && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <p style={{
                                    fontSize: '0.65rem',
                                    color: '#64748B',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.3rem',
                                }}>
                                    Content
                                </p>
                                <pre style={{
                                    fontSize: '0.78rem',
                                    color: '#CBD5E1',
                                    background: '#0A0F1E',
                                    border: '1px solid #243044',
                                    borderRadius: '6px',
                                    padding: '0.6rem 0.75rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    margin: 0,
                                    fontFamily: 'inherit',
                                    lineHeight: 1.6,
                                }}>
                                    {capture.text_content}
                                </pre>
                            </div>
                        )}

                        {/* AI summary */}
                        {capture.ai_markdown_summary && (
                            <div className="markdown-body" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                <ReactMarkdown>{capture.ai_markdown_summary}</ReactMarkdown>
                            </div>
                        )}

                        {/* Source URL */}
                        {capture.source_url && (
                            <a
                                href={capture.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'block',
                                    marginTop: '0.5rem',
                                    fontSize: '0.72rem',
                                    color: '#38BDF8',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                🔗 {capture.source_url}
                            </a>
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <div
                    style={{
                        marginTop: '0.4rem',
                        fontSize: '0.68rem',
                        color: '#475569',
                        fontFamily: 'JetBrains Mono, monospace',
                    }}
                >
                    {new Date(capture.created_at).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────── Chat Message ────────────────────────────────

function ChatMessage({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';

    if (msg.loading) {
        return (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div
                    style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #38BDF8, #6366F1)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                    }}
                >
                    🧠
                </div>
                <div
                    style={{
                        background: '#1C2A3D',
                        border: '1px solid #243044',
                        borderRadius: '0 12px 12px 12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#38BDF8',
                                animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (isUser) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '1.25rem',
                }}
            >
                <div
                    style={{
                        maxWidth: '75%',
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                        border: '1px solid rgba(56,189,248,0.25)',
                        borderRadius: '12px 0 12px 12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        color: '#E2E8F0',
                        lineHeight: 1.6,
                    }}
                >
                    {msg.content}
                </div>
            </div>
        );
    }

    // Assistant
    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
                style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38BDF8, #6366F1)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                }}
            >
                🧠
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Sources carousel */}
                {msg.sources && msg.sources.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            overflowX: 'auto',
                            paddingBottom: '0.5rem',
                            marginBottom: '0.75rem',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.7rem',
                                color: '#64748B',
                                fontFamily: 'JetBrains Mono, monospace',
                                flexShrink: 0,
                                alignSelf: 'center',
                            }}
                        >
                            Sources:
                        </span>
                        {msg.sources.map((src, i) => {
                            const isImage = /\.(png|jpg|jpeg|gif|webp)(\?|$)/i.test(src);
                            return isImage ? (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`source ${i + 1}`}
                                    style={{
                                        height: '60px',
                                        width: '90px',
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                        border: '1px solid #334155',
                                        flexShrink: 0,
                                    }}
                                />
                            ) : (
                                <a
                                    key={i}
                                    href={src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '0.7rem',
                                        color: '#38BDF8',
                                        border: '1px solid rgba(56,189,248,0.25)',
                                        borderRadius: '4px',
                                        padding: '0.2rem 0.5rem',
                                        whiteSpace: 'nowrap',
                                        textDecoration: 'none',
                                        flexShrink: 0,
                                    }}
                                >
                                    📎 {new URL(src).hostname}
                                </a>
                            );
                        })}
                    </div>
                )}

                {/* Markdown content */}
                <div
                    className="markdown-body"
                    style={{
                        background: '#1C2A3D',
                        border: '1px solid #243044',
                        borderRadius: '0 12px 12px 12px',
                        padding: '1rem 1.25rem',
                        overflowX: 'auto',
                        fontSize: '0.875rem',
                    }}
                >
                    <ReactMarkdown
                        components={{
                            code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !className;
                                return !isInline && match ? (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus as Record<string, React.CSSProperties>}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                            overflowX: 'auto',
                                            maxWidth: '100%',
                                            borderRadius: '6px',
                                            margin: '0.5rem 0',
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code
                                        className={className}
                                        style={{
                                            background: 'rgba(56,189,248,0.08)',
                                            border: '1px solid rgba(56,189,248,0.15)',
                                            borderRadius: '4px',
                                            padding: '0.1em 0.4em',
                                            fontSize: '0.85em',
                                            fontFamily: 'JetBrains Mono, monospace',
                                        }}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            pre({ children }) {
                                return (
                                    <pre style={{ overflowX: 'auto', maxWidth: '100%', margin: 0 }}>
                                        {children}
                                    </pre>
                                );
                            },
                        }}
                    >
                        {msg.content || ''}
                    </ReactMarkdown>
                    {!msg.content && <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.85rem' }}>Thinking…</span>}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────── Main Page ──────────────────────────────────

export default function ProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params?.project_id as string;

    // Archive state
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [capturesLoading, setCapturesLoading] = useState(true);

    // Chat state (strictly client-side)
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Fetch captures ──
    const fetchCaptures = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/api/projects/${projectId}/captures`);
            if (!res.ok) throw new ApiError(res.status, 'Failed');
            const data = await res.json();
            setCaptures(data.captures ?? []);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) router.replace('/login');
        } finally {
            setCapturesLoading(false);
        }
    }, [projectId, router]);

    useEffect(() => {
        if (projectId) fetchCaptures();
    }, [fetchCaptures, projectId]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Optimistic delete ──
    function handleDelete(id: string) {
        setCaptures((prev) => prev.filter((c) => c.id !== id));
    }

    // ── Send message + SSE stream ──
    async function sendMessage() {
        if (!input.trim() || streaming) return;

        const userText = input.trim();
        setInput('');

        const userMsg: Message = { role: 'user', content: userText };
        const loaderMsg: Message = { role: 'assistant', content: '', loading: true };

        setMessages((prev) => [...prev, userMsg, loaderMsg]);
        setStreaming(true);

        try {
            const jwt = await getJWT();
            if (!jwt) { router.replace('/login'); return; }

            const payload = {
                project_id: projectId,
                current_query: userText,
                messages: messages.map(({ role, content }) => ({ role, content })).concat({ role: 'user', content: userText }),
            };

            const response = await fetch(`/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                await import('@/lib/supabase').then((m) => m.supabase.auth.signOut());
                router.replace('/login');
                return;
            }

            if (!response.body) throw new Error('No response body');

            // Replace loader with real assistant message
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: '', sources: [] };
                return next;
            });

            // ── Robust SSE buffer parsing ──
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Split on double newlines (SSE event boundaries)
                const events = buffer.split('\n\n');
                buffer = events.pop() ?? ''; // last item may be incomplete

                for (const eventBlock of events) {
                    // Parse the event block
                    let eventName = 'message';
                    let dataLine = '';

                    for (const line of eventBlock.split('\n')) {
                        if (line.startsWith('event:')) {
                            eventName = line.slice('event:'.length).trim();
                        } else if (line.startsWith('data:')) {
                            dataLine = line.slice('data:'.length).trim();
                        }
                    }

                    if (!dataLine) continue;

                    try {
                        const parsed = JSON.parse(dataLine);

                        if (parsed.type === 'sources' || eventName === 'sources') {
                            const urls: string[] = parsed.data ?? [];
                            setMessages((prev) => {
                                const next = [...prev];
                                next[next.length - 1] = { ...next[next.length - 1], sources: urls };
                                return next;
                            });
                        } else if (parsed.type === 'delta' || eventName === 'delta') {
                            const chunk: string = parsed.data ?? '';
                            setMessages((prev) => {
                                const next = [...prev];
                                const last = next[next.length - 1];
                                next[next.length - 1] = { ...last, content: (last.content ?? '') + chunk };
                                return next;
                            });
                        } else if (parsed.type === 'done' || eventName === 'done') {
                            break;
                        } else if (parsed.type === 'error' || eventName === 'error') {
                            setMessages((prev) => {
                                const next = [...prev];
                                next[next.length - 1] = {
                                    ...next[next.length - 1],
                                    content: `⚠️ Error: ${parsed.data ?? 'Unknown error'}`,
                                    loading: false,
                                };
                                return next;
                            });
                            break;
                        }
                    } catch {
                        // Malformed JSON chunk — skip
                    }
                }
            }
        } catch (err) {
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                    role: 'assistant',
                    content: `⚠️ Failed to connect: ${(err as Error).message}`,
                    loading: false,
                };
                return next;
            });
        } finally {
            setStreaming(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // ─────────────────────────── Render ───────────────────────────────────

    return (
        <div
            style={{
                height: 'calc(100vh - 100px)',
                display: 'grid',
                gridTemplateColumns: '360px 1fr',
                overflow: 'hidden',
                borderTop: '1px solid #1E293B',
            }}
        >
            {/* ═══════ LEFT PANE: ARCHIVE ═══════ */}
            <div
                style={{
                    borderRight: '1px solid #1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: '#0D1526',
                }}
            >
                {/* Archive header */}
                <div
                    style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid #1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#F1F5F9',
                                fontFamily: 'JetBrains Mono, monospace',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            📚 Saved Items
                        </h2>
                        <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.1rem' }}>
                            {captures.length} item{captures.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        onClick={fetchCaptures}
                        title="Refresh"
                        style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#64748B',
                            padding: '0.3rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget).style.color = '#38BDF8'; (e.currentTarget).style.borderColor = '#38BDF8'; }}
                        onMouseLeave={(e) => { (e.currentTarget).style.color = '#64748B'; (e.currentTarget).style.borderColor = '#334155'; }}
                    >
                        ↺
                    </button>
                </div>

                {/* Timeline scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1rem 1rem 1.25rem' }}>
                    {/* Loading */}
                    {capturesLoading && (
                        <div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ paddingLeft: '2.5rem', paddingBottom: '1rem' }}>
                                    <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!capturesLoading && captures.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '2.5rem 1rem',
                                color: '#475569',
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📥</div>
                            <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#4A5568' }}>
                                Nothing here yet. Use the Browser or Editor Assistant to save your first item.
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    {!capturesLoading && captures.length > 0 && (
                        <div style={{ position: 'relative' }}>
                            {/* Vertical line */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '9px',
                                    top: '1.8rem',
                                    bottom: 0,
                                    width: '2px',
                                    background: 'linear-gradient(to bottom, rgba(56,189,248,0.3), transparent)',
                                }}
                            />
                            {captures.map((c) => (
                                <CaptureCard key={c.id} capture={c} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════ RIGHT PANE: CHAT ═══════ */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: '#0F172A',
                }}
            >
                {/* Chat header */}
                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#F1F5F9',
                                fontFamily: 'JetBrains Mono, monospace',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            🤖 MindStack Assistant
                        </h2>
                        <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.1rem' }}>
                            Powered by Claude 3.7 · Conversation resets on refresh
                        </p>
                    </div>

                    {messages.length > 0 && (
                        <button
                            onClick={() => setMessages([])}
                            style={{
                                background: 'transparent',
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                color: '#64748B',
                                padding: '0.3rem 0.7rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget).style.color = '#F43F5E'; (e.currentTarget).style.borderColor = '#F43F5E'; }}
                            onMouseLeave={(e) => { (e.currentTarget).style.color = '#64748B'; (e.currentTarget).style.borderColor = '#334155'; }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div
                    id="chat-messages"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#334155',
                                textAlign: 'center',
                                padding: '2rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'rgba(56,189,248,0.05)',
                                    border: '1px solid rgba(56,189,248,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                🧠
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#4A5568', marginBottom: '0.5rem' }}>
                                Ask MindStack anything
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '350px', lineHeight: 1.6 }}>
                                Ask questions about everything you&apos;ve saved. MindStack finds the most relevant information and answers for you.
                            </p>
                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    justifyContent: 'center',
                                }}
                            >
                                {[
                                    "Summarize what I've saved recently",
                                    'What bugs did I fix this week?',
                                    'What did I work on yesterday?',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                                        style={{
                                            background: 'rgba(56,189,248,0.05)',
                                            border: '1px solid rgba(56,189,248,0.15)',
                                            borderRadius: '20px',
                                            color: '#64748B',
                                            padding: '0.4rem 0.875rem',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(56,189,248,0.4)'; (e.currentTarget).style.color = '#94A3B8'; }}
                                        onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'rgba(56,189,248,0.15)'; (e.currentTarget).style.color = '#64748B'; }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} msg={msg} />
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #1E293B',
                        flexShrink: 0,
                        background: 'rgba(13,21,38,0.8)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-end',
                            background: '#1C2A3D',
                            border: `1px solid ${streaming ? 'rgba(56,189,248,0.4)' : '#334155'}`,
                            borderRadius: '12px',
                            padding: '0.75rem',
                            transition: 'border-color 0.2s',
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            id="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={streaming}
                            placeholder="Ask a question about your saved items… (Enter to send)"
                            rows={1}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#E2E8F0',
                                fontSize: '0.9rem',
                                resize: 'none',
                                lineHeight: 1.5,
                                fontFamily: 'inherit',
                                maxHeight: '120px',
                                overflowY: 'auto',
                            }}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = 'auto';
                                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                            }}
                        />
                        <button
                            id="chat-send-btn"
                            onClick={sendMessage}
                            disabled={streaming || !input.trim()}
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                border: 'none',
                                background:
                                    streaming || !input.trim()
                                        ? '#1E293B'
                                        : 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                                color: streaming || !input.trim() ? '#475569' : '#fff',
                                cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                boxShadow:
                                    streaming || !input.trim()
                                        ? 'none'
                                        : '0 2px 8px rgba(14,165,233,0.35)',
                            }}
                        >
                            {streaming ? (
                                <span
                                    style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid #334155',
                                        borderTopColor: '#38BDF8',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'spin 0.8s linear infinite',
                                    }}
                                />
                            ) : (
                                '↑'
                            )}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: '#334155', marginTop: '0.4rem', textAlign: 'center' }}>
                        Shift+Enter for new line · Enter to send · Conversation resets on refresh
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}
