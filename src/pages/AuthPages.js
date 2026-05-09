import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, loginApi } from '../utils/api';
import {
  Eye, EyeOff, Phone, Lock, User, MapPin, Hash,
  ArrowRight, CheckCircle, Home, Shield
} from 'lucide-react';

/* ── Password input with toggle ─────────────────────────────────── */
function PasswordInput({ value, onChange, placeholder = 'Password' }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-control"
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-4)', display: 'flex', padding: 4,
        }}
      >
        {show ? <EyeOff size={17}/> : <Eye size={17}/>}
      </button>
    </div>
  );
}

/* ── Password strength ──────────────────────────────────────────── */
function StrengthBar({ password }) {
  const s = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (!password) return null;
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < s ? colors[s - 1] : 'var(--line)',
            transition: 'background 0.3s',
          }}/>
        ))}
      </div>
      <span style={{ fontSize: '0.7rem', color: colors[s - 1], fontWeight: 700 }}>
        {labels[s - 1]}
      </span>
    </div>
  );
}

/* ── Back to home ───────────────────────────────────────────────── */
function HomeButton() {
  return (
    <Link to="/" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      color: 'var(--ink-4)', fontSize: '0.82rem', textDecoration: 'none',
      marginBottom: '1.5rem', fontWeight: 500, transition: 'color 0.18s',
    }}>
      <Home size={14}/> Back to Home
    </Link>
  );
}

/* ── Register ───────────────────────────────────────────────────── */
function RegisterForm() {
  const [f, setF]       = useState({ name: '', phone: '', password: '', confirm: '', address: '', pincode: '' });
  const [err, setErr]   = useState('');
  const [loading, setL] = useState(false);
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const set             = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    if (f.password.length < 6)    return setErr('Password must be at least 6 characters');
    setL(true); setErr('');
    try {
      const res = await register({ name: f.name, phone: f.phone, password: f.password, address: f.address, pincode: f.pincode });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Registration failed');
    } finally { setL(false); }
  };

  return (
    <form onSubmit={submit}>
      {err && <div className="alert alert-error">{err}</div>}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="Your full name" value={f.name}
            onChange={set('name')} required style={{ paddingLeft: 40 }}/>
          <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            padding: '11px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)',
            background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--ink-3)',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Phone size={13}/> +91
          </div>
          <input className="form-control" placeholder="9876543210" maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} required/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <PasswordInput value={f.password} onChange={set('password')} placeholder="Min. 6 characters"/>
        <StrengthBar password={f.password}/>
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <PasswordInput value={f.confirm} onChange={set('confirm')} placeholder="Repeat password"/>
        {f.confirm && f.password !== f.confirm && (
          <p className="form-error">Passwords don't match</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          Address <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-4)' }}>(optional)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="Your home address"
            value={f.address} onChange={set('address')} style={{ paddingLeft: 40 }}/>
          <MapPin size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Pincode <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-4)' }}>(optional)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="575001" maxLength={6}
            value={f.pincode} onChange={e => setF(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
            style={{ paddingLeft: 40 }}/>
          <Hash size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}/>
        </div>
      </div>

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight size={17}/></>}
      </button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.86rem', color: 'var(--ink-3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </form>
  );
}

/* ── Login ──────────────────────────────────────────────────────── */
function LoginForm({ isAdmin }) {
  const [f, setF]       = useState({ phone: '', password: '' });
  const [err, setErr]   = useState('');
  const [loading, setL] = useState(false);
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const set             = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setL(true); setErr('');
    try {
      const res = await loginApi({ phone: f.phone, password: f.password, role: isAdmin ? 'admin' : 'customer' });
      login(res.data.token, res.data.user);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed');
    } finally { setL(false); }
  };

  return (
    <form onSubmit={submit}>
      {isAdmin && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={14}/> Admin credentials required
        </div>
      )}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            padding: '11px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)',
            background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--ink-3)',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Phone size={13}/> +91
          </div>
          <input className="form-control" placeholder={isAdmin ? 'Admin phone' : '9876543210'} maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} required/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <PasswordInput value={f.password} onChange={set('password')}/>
      </div>

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={17}/></>}
      </button>

      {!isAdmin && (
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.86rem', color: 'var(--ink-3)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      )}
    </form>
  );
}

/* ── Left panel ─────────────────────────────────────────────────── */
function AuthLeft({ title, subtitle }) {
  const features = [
    'Book in under 60 seconds',
    'Professional eco-friendly cleaning',
    'Real-time order tracking',
    'Doorstep pickup & delivery',
  ];
  return (
    <div className="auth-left">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
          <img
            src="https://washwavebackendv2.onrender.com/images/ww_logo.jpeg"
            alt="WashWave"
            onError={e => e.target.style.display = 'none'}
            style={{ width: 38, height: 38, borderRadius: 11, objectFit: 'cover' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.03em' }}>
            WashWave
          </span>
        </div>

        <h1 style={{ color: 'white', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: 12, lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <CheckCircle size={16} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0 }}/>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 10, marginTop: '2.5rem', flexWrap: 'wrap' }}>
          {['10,000+ Orders','4.8★ Rated','Mangalore'].map(b => (
            <span key={b} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)', padding: '5px 12px', borderRadius: '999px',
              fontSize: '0.76rem', fontWeight: 600, backdropFilter: 'blur(10px)',
            }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Page exports ───────────────────────────────────────────────── */
export function LoginPage({ isAdmin }) {
  return (
    <div className="auth-wrap">
      <AuthLeft
        title={isAdmin ? 'Admin Dashboard' : 'Welcome back!'}
        subtitle={isAdmin ? 'Manage all customer orders from one place.' : 'Sign in to track and manage your laundry orders.'}
      />
      <div className="auth-right">
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <HomeButton/>
          <h2 style={{ marginBottom: 6 }}>{isAdmin ? 'Admin Sign In' : 'Sign in'}</h2>
          <p style={{ color: 'var(--ink-3)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>
            {isAdmin ? 'Enter your admin credentials below' : 'Enter your phone number and password'}
          </p>
          <LoginForm isAdmin={isAdmin}/>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="auth-wrap">
      <AuthLeft
        title="Fresh clothes, delivered."
        subtitle="Create your account and book your first laundry pickup today."
      />
      <div className="auth-right">
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1rem 0' }}>
          <HomeButton/>
          <h2 style={{ marginBottom: 6 }}>Create account</h2>
          <p style={{ color: 'var(--ink-3)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>
            Fill in your details to get started — it's free
          </p>
          <RegisterForm/>
        </div>
      </div>
    </div>
  );
}