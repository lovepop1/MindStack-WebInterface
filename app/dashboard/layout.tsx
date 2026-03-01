'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [showGhostModal, setShowGhostModal] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) router.replace('/login');
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') router.replace('/login');
        });

        return () => listener.subscription.unsubscribe();
    }, [router]);

    async function signOut() {
        await supabase.auth.signOut();
        router.replace('/login');
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column' }}>
            {/* Topbar */}
            <nav
                style={{
                    height: '56px',
                    background: 'rgba(13, 21, 38, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.95rem',
                            }}
                        >
                            🧠
                        </div>
                        <span
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MindStack
                        </span>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link
                        href="/dashboard"
                        style={{
                            color: '#94A3B8',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#E2E8F0')}
                        onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#94A3B8')}
                    >
                        Projects
                    </Link>

                    <button
                        id="signout-btn"
                        onClick={signOut}
                        style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#94A3B8',
                            padding: '0.375rem 0.875rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.borderColor = '#F43F5E';
                            (e.target as HTMLButtonElement).style.color = '#F87171';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.borderColor = '#334155';
                            (e.target as HTMLButtonElement).style.color = '#94A3B8';
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Onboarding banner */}
            <div
                style={{
                    background: 'linear-gradient(90deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.08) 100%)',
                    borderBottom: '1px solid rgba(56,189,248,0.15)',
                    padding: '0.6rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                }}
            >
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>
                    ✨ Get the MindStack Assistants:
                </span>

                {/* Browser Assistant — opens install modal */}
                <button
                    id="browser-assistant-btn"
                    onClick={() => setShowGhostModal(true)}
                    style={{
                        fontSize: '0.8rem',
                        color: '#38BDF8',
                        background: 'transparent',
                        border: '1px solid rgba(56,189,248,0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.7rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(56,189,248,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
                >
                    🌐 Browser Assistant
                </button>

                <a
                    href="https://marketplace.visualstudio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '0.8rem',
                        color: '#818CF8',
                        textDecoration: 'none',
                        border: '1px solid rgba(129,140,248,0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.7rem',
                        transition: 'all 0.2s',
                        fontWeight: 500,
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.background = 'rgba(129,140,248,0.1)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                    ⬡ Editor Assistant
                </a>
            </div>

            <main style={{ flex: 1 }}>{children}</main>

            {/* Ghost Extension Install Modal */}
            {showGhostModal && (
                <div
                    onClick={() => setShowGhostModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: '1rem',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(160deg, #0D1F35 0%, #111827 100%)',
                            border: '1px solid #1E3A52',
                            borderLeft: '4px solid #10B981',
                            borderRadius: '14px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '520px',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                            position: 'relative',
                            animation: 'fadeIn 0.2s ease',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowGhostModal(false)}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: '1px solid #1E293B',
                                borderRadius: '6px',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                lineHeight: 1,
                                padding: '0.25rem 0.45rem',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.borderColor = '#334155'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1E293B'; }}
                        >
                            ✕
                        </button>

                        {/* Heading */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>👻</span>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                                Install the Browser Ghost
                            </h2>
                            <span style={{
                                fontSize: '0.6rem',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 600,
                                color: '#10B981',
                                background: 'rgba(16,185,129,0.12)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: '4px',
                                padding: '0.1rem 0.5rem',
                                letterSpacing: '0.05em',
                            }}>
                                CHROME
                            </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            Download and sideload the MindStack extension to capture webpages, videos, and notes directly into your projects.
                        </p>

                        {/* Download button */}
                        <a
                            id="modal-download-ghost"
                            href="/mindstack-ghost.zip"
                            download="mindstack-ghost.zip"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                                borderRadius: '8px',
                                color: '#fff',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                                marginBottom: '1.5rem',
                                transition: 'opacity 0.2s, transform 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            ⬇ Download mindstack-ghost.zip
                        </a>

                        {/* Install steps */}
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid #1E3A52',
                            borderRadius: '8px',
                            padding: '1rem 1.25rem',
                        }}>
                            <p style={{
                                fontSize: '0.65rem',
                                fontFamily: 'JetBrains Mono, monospace',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                marginBottom: '0.75rem',
                            }}>
                                Installation Steps
                            </p>
                            <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    <>Unzip the downloaded <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#38BDF8', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '4px', padding: '0.05em 0.4em' }}>mindstack-ghost.zip</code> folder.</>,
                                    <>Open Chrome and go to <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', padding: '0.05em 0.4em' }}>chrome://extensions</code>.</>,
                                    <>Toggle on <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>"Developer mode"</strong> in the top-right corner.</>,
                                    <>Click <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>"Load unpacked"</strong> and select the unzipped folder.</>,
                                    <>Pin the <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>MindStack</strong> icon to your toolbar and log in.</>,
                                ].map((step, i) => (
                                    <li key={i} style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
