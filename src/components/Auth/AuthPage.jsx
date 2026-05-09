import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

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
    // Auto-confirmed (common in dev) → go to setup; otherwise ask to check email
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
    padding: '11px 14px',
    borderRadius: 8,
    border: '1.5px solid var(--border)',
    background: 'var(--white)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--slate-900)',
    outline: 'none',
    transition: 'border-color 150ms',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--slate-700)',
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--slate-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Background accent */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(232,168,56,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--slate-900)',
            marginBottom: 16, boxShadow: '0 4px 16px rgba(28,30,36,0.18)',
          }}>
            <Zap size={26} fill="var(--amber)" stroke="var(--amber)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
            Flint
          </div>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4 }}>
            {mode === 'login' && 'Welcome back. Sign in to your workspace.'}
            {mode === 'signup' && 'Create your Flint account — free to start.'}
            {mode === 'forgot' && 'Reset your password.'}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)',
          borderRadius: 16,
          padding: '32px 32px 28px',
          boxShadow: '0 4px 24px rgba(28,30,36,0.10), 0 1px 2px rgba(28,30,36,0.06)',
          border: '1px solid var(--border)',
        }}>

          {/* Error / Success banners */}
          {error && (
            <div style={{
              background: 'var(--danger-bg)', color: 'var(--danger-text)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(220,38,38,0.15)',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: 'var(--success-bg)', color: 'var(--success-text)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(45,155,111,0.15)',
            }}>
              {success}
            </div>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--slate-400)', padding: 0, lineHeight: 0,
                    }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <button type="button" onClick={() => { setMode('forgot'); reset(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--amber)', fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 15 }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* SIGNUP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text" required autoFocus
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--slate-400)', padding: 0, lineHeight: 0,
                    }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength hint */}
                {password.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 2,
                        background: password.length >= i * 3
                          ? (password.length >= 10 ? 'var(--success)' : password.length >= 6 ? 'var(--amber)' : 'var(--danger)')
                          : 'var(--slate-200)',
                        transition: 'background 200ms',
                      }} />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 15 }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}
              </button>
              <p style={{ fontSize: 11, color: 'var(--slate-400)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot}>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Your email address</label>
                <input
                  type="email" required autoFocus
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 15 }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : <>Send reset link <ArrowRight size={16} /></>}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={() => { setMode('login'); reset(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--slate-500)' }}>
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Toggle login ↔ signup */}
        {mode !== 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--slate-500)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); reset(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); reset(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--slate-400)' }}>
          Built for independent professionals © {new Date().getFullYear()} Flint
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
