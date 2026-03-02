'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/supabase';
import { API_BASE } from '@/lib/constants';

interface Project {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [modalError, setModalError] = useState('');

    const fetchProjects = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/api/projects`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setProjects(data.projects ?? []);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    async function createProject(e: React.FormEvent) {
        e.preventDefault();
        setModalError('');
        setCreating(true);
        try {
            const res = await apiFetch(`${API_BASE}/api/projects`, {
                method: 'POST',
                body: JSON.stringify({ name: newName, description: newDesc }),
            });
            if (res.status === 201) {
                setShowModal(false);
                setNewName('');
                setNewDesc('');
                await fetchProjects();
            } else {
                throw new Error(`Failed: ${res.status}`);
            }
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace('/login');
                return;
            }
            setModalError((err as Error).message);
        } finally {
            setCreating(false);
        }
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: '#F1F5F9',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        My Projects
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Select a project to open it and start asking questions
                    </p>
                </div>

                <button
                    id="create-project-btn"
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'opacity 0.2s, transform 0.15s',
                        boxShadow: '0 4px 16px rgba(14,165,233,0.25)',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.transform = 'translateY(0)'; }}
                >
                    <span style={{ fontSize: '1.1rem' }}>+</span> New Project
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && projects.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        border: '1px dashed #1E293B',
                        borderRadius: '16px',
                        animation: 'fadeIn 0.5s ease',
                    }}
                    className="fade-in"
                >
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧠</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '0.5rem' }}>
                        Welcome to MindStack.
                    </h2>
                    <p style={{ color: '#475569', maxWidth: '400px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                        Create your first project to start saving things and asking questions about them.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '0.875rem 2rem',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(14,165,233,0.25)',
                        }}
                    >
                        Create your first project →
                    </button>
                </div>
            )}

            {/* Projects Grid */}
            {!loading && projects.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {projects.map((project) => (
                        <button
                            key={project.id}
                            id={`project-card-${project.id}`}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                            style={{
                                background: '#1E293B',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#38BDF8';
                                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(56,189,248,0.1), 0 8px 32px rgba(0,0,0,0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Accent dot */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#10B981',
                                    boxShadow: '0 0 6px rgba(16,185,129,0.6)',
                                }}
                            />

                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.15) 100%)',
                                    border: '1px solid rgba(56,189,248,0.2)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                📁
                            </div>

                            <h3
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#F1F5F9',
                                    marginBottom: '0.35rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {project.name}
                            </h3>

                            {project.description && (
                                <p
                                    style={{
                                        fontSize: '0.82rem',
                                        color: '#64748B',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    {project.description}
                                </p>
                            )}

                            <div
                                style={{
                                    marginTop: '0.75rem',
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                }}
                            >
                                <span>📅</span> {formatDate(project.created_at)}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '1rem',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div
                        style={{
                            background: '#1E293B',
                            border: '1px solid #334155',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '480px',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                            animation: 'fadeIn 0.2s ease',
                        }}
                    >
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.25rem' }}>
                            New Project
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Everything you save will be organized inside this project.
                        </p>

                        {modalError && (
                            <div
                                style={{
                                    background: 'rgba(244,63,94,0.1)',
                                    border: '1px solid rgba(244,63,94,0.3)',
                                    borderRadius: '8px',
                                    padding: '0.6rem 0.9rem',
                                    color: '#FB7185',
                                    fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={createProject}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label
                                    htmlFor="proj-name"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Project Name *
                                </label>
                                <input
                                    id="proj-name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    placeholder="e.g. React Migration"
                                    style={{
                                        width: '100%',
                                        background: '#0D1526',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#E2E8F0',
                                        padding: '0.7rem 0.9rem',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#38BDF8')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label
                                    htmlFor="proj-desc"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Description
                                </label>
                                <textarea
                                    id="proj-desc"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="What are you working on?"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        background: '#0D1526',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#E2E8F0',
                                        padding: '0.7rem 0.9rem',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#38BDF8')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setNewName(''); setNewDesc(''); setModalError(''); }}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#94A3B8',
                                        padding: '0.65rem 1.2rem',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    id="modal-create-btn"
                                    disabled={creating}
                                    style={{
                                        background: creating ? '#1E293B' : 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: creating ? '#64748B' : '#fff',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: creating ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {creating ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
