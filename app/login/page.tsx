'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // If already logged in, redirect
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) router.replace('/dashboard');
        });
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'signin') {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.replace('/dashboard');
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                setSuccess('Account created! Check your email to verify, then sign in.');
                setMode('signin');
            }
        } catch (err: unknown) {
            setError((err as Error).message ?? 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0F172A',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background grid */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                }}
            />

            {/* Glow orbs */}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '20%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                    }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.15rem',
                        }}
                    >
                        🧠
                    </div>
                    <span
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        MindStack
                    </span>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    your personal knowledge AI
                </p>
            </div>

            {/* Card */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #1E293B',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05)',
                    position: 'relative',
                }}
            >
                {/* Top accent line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
                        borderRadius: '1px',
                    }}
                />

                <h1
                    style={{
                        fontSize: '1.35rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        color: '#F1F5F9',
                    }}
                >
                    {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                    {mode === 'signin'
                        ? 'Sign in to your MindStack account'
                        : 'Start building your knowledge base today'}
                </p>

                {error && (
                    <div
                        style={{
                            background: 'rgba(244,63,94,0.1)',
                            border: '1px solid rgba(244,63,94,0.3)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            color: '#FB7185',
                            fontSize: '0.875rem',
                            marginBottom: '1.25rem',
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            color: '#34D399',
                            fontSize: '0.875rem',
                            marginBottom: '1.25rem',
                        }}
                    >
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            htmlFor="email"
                            style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem', fontWeight: 500 }}
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                background: '#0D1526',
                                border: '1px solid #1E293B',
                                borderRadius: '8px',
                                color: '#E2E8F0',
                                padding: '0.75rem 1rem',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#38BDF8')}
                            onBlur={(e) => (e.target.style.borderColor = '#1E293B')}
                        />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label
                            htmlFor="password"
                            style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem', fontWeight: 500 }}
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                background: '#0D1526',
                                border: '1px solid #1E293B',
                                borderRadius: '8px',
                                color: '#E2E8F0',
                                padding: '0.75rem 1rem',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#38BDF8')}
                            onBlur={(e) => (e.target.style.borderColor = '#1E293B')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        id="auth-submit-btn"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: loading
                                ? '#1E293B'
                                : 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                            color: loading ? '#64748B' : '#fff',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s, transform 0.1s',
                            letterSpacing: '0.01em',
                        }}
                        onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ width: 16, height: 16, border: '2px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                Processing...
                            </span>
                        ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#38BDF8',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>

            <p style={{ marginTop: '2rem', color: '#334155', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                v1.0.0 · MindStack Inc.
            </p>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
