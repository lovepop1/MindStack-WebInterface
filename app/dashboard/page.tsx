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

interface Workspace {
    id: string;
    name: string;
    join_code: string;
    role: 'Admin' | 'Member';
    display_name: string;
}

export default function DashboardPage() {
    const router = useRouter();
    
    // Tab state
    const [activeTab, setActiveTab] = useState<'projects' | 'workspaces'>('projects');
    
    // Projects state
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [modalError, setModalError] = useState('');
    
    // Workspaces state
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspacesLoading, setWorkspacesLoading] = useState(true);
    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [showJoinWorkspace, setShowJoinWorkspace] = useState(false);
    const [creatingWorkspace, setCreatingWorkspace] = useState(false);
    const [joiningWorkspace, setJoiningWorkspace] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [workspaceModalError, setWorkspaceModalError] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

    const fetchWorkspaces = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/api/workspaces`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setWorkspaces(data ?? []);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace('/login');
            }
        } finally {
            setWorkspacesLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProjects();
        fetchWorkspaces();
    }, [fetchProjects, fetchWorkspaces]);

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

    async function createWorkspace(e: React.FormEvent) {
        e.preventDefault();
        setWorkspaceModalError('');
        setCreatingWorkspace(true);
        try {
            const res = await apiFetch(`${API_BASE}/api/workspaces/create`, {
                method: 'POST',
                body: JSON.stringify({ name: workspaceName, display_name: displayName }),
            });
            if (res.ok) {
                setShowCreateWorkspace(false);
                setWorkspaceName('');
                setDisplayName('');
                await fetchWorkspaces();
            } else {
                throw new Error(`Failed: ${res.status}`);
            }
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace('/login');
                return;
            }
            setWorkspaceModalError((err as Error).message);
        } finally {
            setCreatingWorkspace(false);
        }
    }

    async function joinWorkspace(e: React.FormEvent) {
        e.preventDefault();
        setWorkspaceModalError('');
        setJoiningWorkspace(true);
        try {
            const res = await apiFetch(`${API_BASE}/api/workspaces/join`, {
                method: 'POST',
                body: JSON.stringify({ join_code: joinCode, display_name: displayName }),
            });
            if (res.ok) {
                setShowJoinWorkspace(false);
                setJoinCode('');
                setDisplayName('');
                await fetchWorkspaces();
            } else {
                throw new Error(`Failed: ${res.status}`);
            }
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.replace('/login');
                return;
            }
            setWorkspaceModalError((err as Error).message);
        } finally {
            setJoiningWorkspace(false);
        }
    }

    function copyJoinCode(code: string) {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
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

            {/* Tabs */}
            <div style={{ marginBottom: '2rem' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        background: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        padding: '0.25rem',
                        gap: '0.25rem',
                    }}
                >
                    <button
                        onClick={() => setActiveTab('projects')}
                        style={{
                            background: activeTab === 'projects' ? 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeTab === 'projects' ? '#fff' : '#94A3B8',
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'projects' ? '0 2px 8px rgba(14,165,233,0.3)' : 'none',
                        }}
                    >
                        📁 My Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('workspaces')}
                        style={{
                            background: activeTab === 'workspaces' ? 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeTab === 'workspaces' ? '#fff' : '#94A3B8',
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'workspaces' ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                        }}
                    >
                        👥 Team Workspaces
                    </button>
                </div>
            </div>

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <>
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
                </>
            )}

            {/* Workspaces Tab */}
            {activeTab === 'workspaces' && (
                <>
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
                                Team Workspaces
                            </h1>
                            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                Collaborate with your team on shared knowledge bases
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                id="join-workspace-btn"
                                onClick={() => setShowJoinWorkspace(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #10B981',
                                    borderRadius: '8px',
                                    color: '#10B981',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; 
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.background = 'transparent'; 
                                }}
                            >
                                🔗 Join Workspace
                            </button>
                            <button
                                id="create-workspace-btn"
                                onClick={() => setShowCreateWorkspace(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
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
                                    boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>+</span> Create Workspace
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {workspacesLoading && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '12px' }} />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!workspacesLoading && workspaces.length === 0 && (
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
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👥</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '0.5rem' }}>
                                No workspaces yet
                            </h2>
                            <p style={{ color: '#475569', maxWidth: '400px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                                Create a workspace to collaborate with your team, or join an existing one with a code.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setShowCreateWorkspace(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        padding: '0.875rem 2rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                                    }}
                                >
                                    Create workspace →
                                </button>
                                <button
                                    onClick={() => setShowJoinWorkspace(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #10B981',
                                        borderRadius: '8px',
                                        color: '#10B981',
                                        padding: '0.875rem 2rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Join with code
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Workspaces Grid */}
                    {!workspacesLoading && workspaces.length > 0 && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                                gap: '1.25rem',
                            }}
                        >
                            {workspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    id={`workspace-card-${workspace.id}`}
                                    onClick={() => router.push(`/dashboard/workspaces/${workspace.id}`)}
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
                                        e.currentTarget.style.borderColor = '#10B981';
                                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(16,185,129,0.1), 0 8px 32px rgba(0,0,0,0.3)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#334155';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Role badge */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: workspace.role === 'Admin' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                                            border: `1px solid ${workspace.role === 'Admin' ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                            borderRadius: '6px',
                                            padding: '0.25rem 0.6rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            color: workspace.role === 'Admin' ? '#FB7185' : '#818CF8',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {workspace.role}
                                    </div>

                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(14,165,233,0.15) 100%)',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        👥
                                    </div>

                                    <h3
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#F1F5F9',
                                            marginBottom: '0.5rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {workspace.name}
                                    </h3>

                                    <p
                                        style={{
                                            fontSize: '0.75rem',
                                            color: '#64748B',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        Joined as: {workspace.display_name}
                                    </p>

                                    {/* Join code */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyJoinCode(workspace.join_code);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'rgba(16,185,129,0.08)',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                            borderRadius: '6px',
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(16,185,129,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                                        }}
                                    >
                                        <span style={{ fontSize: '0.7rem', color: '#10B981', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                                            {copiedCode === workspace.join_code ? '✓ Copied!' : workspace.join_code}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>
                                            {copiedCode === workspace.join_code ? '✓' : '📋'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </>
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

            {/* Create Workspace Modal */}
            {showCreateWorkspace && (
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
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreateWorkspace(false); }}
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
                            Create Workspace
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Set up a shared workspace for your team to collaborate.
                        </p>

                        {workspaceModalError && (
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
                                {workspaceModalError}
                            </div>
                        )}

                        <form onSubmit={createWorkspace}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label
                                    htmlFor="workspace-name"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Workspace Name *
                                </label>
                                <input
                                    id="workspace-name"
                                    type="text"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    required
                                    placeholder="e.g. Engineering Team"
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
                                    onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label
                                    htmlFor="display-name-create"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Your Display Name *
                                </label>
                                <input
                                    id="display-name-create"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    placeholder="e.g. Adithya Nangarath"
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
                                    onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateWorkspace(false); setWorkspaceName(''); setDisplayName(''); setWorkspaceModalError(''); }}
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
                                    id="modal-create-workspace-btn"
                                    disabled={creatingWorkspace}
                                    style={{
                                        background: creatingWorkspace ? '#1E293B' : 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: creatingWorkspace ? '#64748B' : '#fff',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: creatingWorkspace ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {creatingWorkspace ? 'Creating...' : 'Create Workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Workspace Modal */}
            {showJoinWorkspace && (
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
                    onClick={(e) => { if (e.target === e.currentTarget) setShowJoinWorkspace(false); }}
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
                            Join Workspace
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Enter the join code shared by your team admin.
                        </p>

                        {workspaceModalError && (
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
                                {workspaceModalError}
                            </div>
                        )}

                        <form onSubmit={joinWorkspace}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label
                                    htmlFor="join-code"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Join Code *
                                </label>
                                <input
                                    id="join-code"
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    required
                                    placeholder="e.g. ABC123XYZ"
                                    style={{
                                        width: '100%',
                                        background: '#0D1526',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#E2E8F0',
                                        padding: '0.7rem 0.9rem',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        textTransform: 'uppercase',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label
                                    htmlFor="display-name-join"
                                    style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}
                                >
                                    Your Display Name *
                                </label>
                                <input
                                    id="display-name-join"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    placeholder="e.g. Adithya Nangarath"
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
                                    onFocus={(e) => (e.target.style.borderColor = '#10B981')}
                                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowJoinWorkspace(false); setJoinCode(''); setDisplayName(''); setWorkspaceModalError(''); }}
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
                                    id="modal-join-workspace-btn"
                                    disabled={joiningWorkspace}
                                    style={{
                                        background: joiningWorkspace ? '#1E293B' : 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: joiningWorkspace ? '#64748B' : '#fff',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: joiningWorkspace ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {joiningWorkspace ? 'Joining...' : 'Join Workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
