import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap, Eye, EyeOff, ArrowRight, Loader, FolderKanban, DollarSign, Calendar } from 'lucide-react';

const FEATURES = [
  { icon: FolderKanban, title: 'Projects & Clients', desc: 'Track every project, contact, and opportunity in one clean workspace.' },
  { icon: DollarSign, title: 'Invoices & Finance', desc: 'Send invoices, chase payments automatically, and watch your P&L in real time.' },
  { icon: Calendar, title: 'Autopilot', desc: 'Automate onboarding, follow-ups, and reminders — so you can focus on the work.' },
];

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  async function handleLogin(e) {
    e.preventDefault();
    reset();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    onAuth('dashboard');
  }

  async function handleSignup(e) {
    e.preventDefault();
    reset();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Account created! Check your email to confirm, then log in.');
    setMode('login');
  }

  async function handleForgot(e) {
    e.preventDefault();
    reset();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Password reset link sent — check your inbox.');
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    background: '#fff',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const formTitle = {
    login: 'Welcome back',
    signup: 'Start for free',
    forgot: 'Reset your password',
  }[mode];

  const formSubtitle = {
    login: 'Sign in to your Flint workspace.',
    signup: 'Create your account — no credit card required.',
    forgot: 'We\'ll send a reset link to your inbox.',
  }[mode];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-body)',
    }}>
      {/* ── Left panel — brand ── */}
      <div style={{
        flex: '0 0 42%',
        background: 'var(--slate-900)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left-panel">
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,168,56,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'rgba(232,168,56,0.15)',
            border: '1.5px solid rgba(232,168,56,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={22} fill="var(--amber)" stroke="var(--amber)" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Flint</span>
        </div>

        {/* Headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
          <div style={{
            fontSize: 32, fontWeight: 800, color: '#fff',
            lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.5px',
          }}>
            Your business,<br />
            <span style={{ color: 'var(--amber)' }}>on autopilot.</span>
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 40, maxWidth: 300 }}>
            The workspace built for independent professionals — freelancers, consultants, and creative studios.
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 44 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(232,168,56,0.12)',
                  border: '1px solid rgba(232,168,56,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color="var(--amber)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            borderLeft: '3px solid rgba(232,168,56,0.4)',
            paddingLeft: 16,
            marginTop: 4,
          }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10 }}>
              "Flint replaced three tools I was paying for. It's the first platform that actually thinks like a freelancer."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>S</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.80)' }}>Sarah K.</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>Brand Designer, Singapore</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} Flint · Built for independent professionals
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1,
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo (hidden on desktop via media query) */}
          <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--slate-900)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={20} fill="var(--amber)" stroke="var(--amber)" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--slate-900)' }}>Flint</span>
          </div>

          {/* Form heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.5px' }}>
              {formTitle}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>{formSubtitle}</p>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, fontWeight: 500, border: '1px solid #fecaca',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#f0fdf4', color: '#16a34a',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, fontWeight: 500, border: '1px solid #bbf7d0',
            }}>
              {success}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 0,
                  }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <button type="button" onClick={() => { setMode('forgot'); reset(); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#f59e0b', fontWeight: 600,
                }}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
                background: '#111827', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                fontFamily: 'var(--font-body)',
              }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text" required autoFocus
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 0,
                  }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 2,
                        background: password.length >= i * 3
                          ? (password.length >= 10 ? '#10b981' : password.length >= 6 ? '#f59e0b' : '#ef4444')
                          : '#e5e7eb',
                        transition: 'background 200ms',
                      }} />
                    ))}
                  </div>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24, lineHeight: 1.5 }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
                background: '#111827', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-body)',
              }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Your email address</label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
                background: '#111827', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-body)',
              }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : <>Send reset link <ArrowRight size={16} /></>}
              </button>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button type="button" onClick={() => { setMode('login'); reset(); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280',
                }}>
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Toggle login ↔ signup */}
          {mode !== 'forgot' && (
            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#6b7280' }}>
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); reset(); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#f59e0b', fontWeight: 700, fontSize: 14,
                    fontFamily: 'var(--font-body)',
                  }}>
                    Sign up free
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); reset(); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#f59e0b', fontWeight: 700, fontSize: 14,
                    fontFamily: 'var(--font-body)',
                  }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
