'use client';

export const dynamic = 'force-dynamic';


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

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
                        onClick={signOut}
                        id="signout-btn"
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
                    👻 Install your tracking ghosts:
                </span>
                <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '0.8rem',
                        color: '#38BDF8',
                        textDecoration: 'none',
                        border: '1px solid rgba(56,189,248,0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.7rem',
                        transition: 'all 0.2s',
                        fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                        (e.target as HTMLAnchorElement).style.background = 'rgba(56,189,248,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLAnchorElement).style.background = 'transparent';
                    }}
                >
                    🌐 Chrome Extension
                </a>
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
                    onMouseEnter={(e) => {
                        (e.target as HTMLAnchorElement).style.background = 'rgba(129,140,248,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLAnchorElement).style.background = 'transparent';
                    }}
                >
                    ⬡ VS Code Extension
                </a>
            </div>

            <main style={{ flex: 1 }}>{children}</main>
        </div>
    );
}
