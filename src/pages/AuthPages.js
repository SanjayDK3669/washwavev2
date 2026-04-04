import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, loginApi } from '../utils/api';
import {
  Eye, EyeOff, Phone, Lock, User, MapPin, Hash,
  ArrowRight, CheckCircle, Shirt, Wind, Flame, Package
} from 'lucide-react';

function PasswordInput({ value, onChange, placeholder = 'Password' }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="form-control" type={show ? 'text' : 'password'}
        placeholder={placeholder} value={value} onChange={onChange}
        style={{ paddingRight: 44 }} />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', display: 'flex' }}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function StrengthBar({ password }) {
  const s = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (!password) return null;
  const colors = ['#ef4444','#f97316','#f59e0b','#22c55e'];
  const labels = ['Weak','Fair','Good','Strong'];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < s ? colors[s-1] : 'var(--line)', transition: 'background 0.3s' }} />)}
      </div>
      <span style={{ fontSize: '0.72rem', color: colors[s-1], fontWeight: 600 }}>{labels[s-1]}</span>
    </div>
  );
}

/* ── Register ─────────────────────────────── */
function RegisterForm() {
  const [f, setF] = useState({ name:'', phone:'', password:'', confirm:'', address:'', pincode:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters');
    setLoading(true); setErr('');
    try {
      const res = await register({ name: f.name, phone: f.phone, password: f.password, address: f.address, pincode: f.pincode });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch(e) { setErr(e.response?.data?.detail || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      {err && <div className="alert alert-error"><span>{err}</span></div>}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="Your full name" value={f.name} onChange={set('name')} required style={{ paddingLeft: 40 }} />
          <User size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ padding:'11px 12px', border:'1.5px solid var(--line)', borderRadius:'var(--radius-sm)', background:'var(--bg)', fontSize:'0.88rem', color:'var(--ink-3)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
            <Phone size={14} /> +91
          </div>
          <input className="form-control" placeholder="9876543210" maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <PasswordInput value={f.password} onChange={set('password')} placeholder="Min. 6 characters" />
        <StrengthBar password={f.password} />
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <PasswordInput value={f.confirm} onChange={set('confirm')} placeholder="Repeat password" />
        {f.confirm && f.password !== f.confirm && <p className="form-error">Passwords don't match</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Address <span style={{ color:'var(--ink-4)', fontWeight:400, textTransform:'none' }}>(optional)</span></label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="Your home address" value={f.address} onChange={set('address')} style={{ paddingLeft: 40 }} />
          <MapPin size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Pincode <span style={{ color:'var(--ink-4)', fontWeight:400, textTransform:'none' }}>(optional)</span></label>
        <div style={{ position: 'relative' }}>
          <input className="form-control" placeholder="560001" maxLength={6} value={f.pincode}
            onChange={e => setF(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'') }))} style={{ paddingLeft: 40 }} />
          <Hash size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }} />
        </div>
      </div>

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
        {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
      </button>

      <p style={{ textAlign:'center', marginTop:16, fontSize:'0.88rem', color:'var(--ink-3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
      </p>
    </form>
  );
}

/* ── Login ────────────────────────────────── */
function LoginForm({ isAdmin }) {
  const [f, setF] = useState({ phone:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await loginApi({ phone: f.phone, password: f.password, role: isAdmin ? 'admin' : 'customer' });
      login(res.data.token, res.data.user);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch(e) { setErr(e.response?.data?.detail || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      {isAdmin && (
        <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
          <Lock size={15} /> Admin login
        </div>
      )}
      {err && <div className="alert alert-error"><span>{err}</span></div>}

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ padding:'11px 12px', border:'1.5px solid var(--line)', borderRadius:'var(--radius-sm)', background:'var(--bg)', fontSize:'0.88rem', color:'var(--ink-3)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
            <Phone size={14} /> +91
          </div>
          <input className="form-control" placeholder={isAdmin ? 'Admin phone' : '9876543210'} maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <PasswordInput value={f.password} onChange={set('password')} />
      </div>

      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
        {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={18} /></>}
      </button>

      {!isAdmin && (
        <p style={{ textAlign:'center', marginTop:16, fontSize:'0.88rem', color:'var(--ink-3)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
        </p>
      )}
    </form>
  );
}

/* ── Left panel ───────────────────────────── */
function AuthLeft({ title, subtitle }) {
  return (
    <div className="auth-left">
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'3rem' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--blue)' }} />
          <span style={{ fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>WashWave</span>
        </div>
        <h1 style={{ color:'white', fontSize:'2.2rem', marginBottom:16, lineHeight:1.1 }}>{title}</h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', lineHeight:1.6 }}>{subtitle}</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { icon: <Shirt size={18} />, text: 'Washing — Rs 10/cloth' },
          { icon: <Wind size={18} />, text: 'Dry Cleaning — Rs 30/cloth' },
          { icon: <Flame size={18} />, text: 'Ironing — Rs 8/cloth' },
          { icon: <Package size={18} />, text: 'Full Laundry — Rs 25/cloth' },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,0.75)', fontSize:'0.9rem' }}>
            <div style={{ color:'rgba(255,255,255,0.4)' }}>{item.icon}</div>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pages ────────────────────────────────── */
export function LoginPage({ isAdmin }) {
  return (
    <div className="auth-wrap">
      <AuthLeft
        title={isAdmin ? 'Admin Dashboard' : 'Welcome back'}
        subtitle={isAdmin ? 'Manage all customer orders from one place.' : 'Sign in to track your laundry orders and manage your account.'}
      />
      <div className="auth-right">
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <h2 style={{ marginBottom: 6 }}>{isAdmin ? 'Admin Sign In' : 'Sign in'}</h2>
          <p style={{ color:'var(--ink-3)', marginBottom:'1.8rem', fontSize:'0.9rem' }}>
            {isAdmin ? 'Enter admin credentials' : 'Enter your phone number and password'}
          </p>
          <LoginForm isAdmin={isAdmin} />
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
        subtitle="Create your account to book laundry pickups and get your clothes cleaned and returned to your door."
      />
      <div className="auth-right" style={{ overflowY:'auto' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '1rem 0' }}>
          <h2 style={{ marginBottom: 6 }}>Create account</h2>
          <p style={{ color:'var(--ink-3)', marginBottom:'1.8rem', fontSize:'0.9rem' }}>Fill in your details to get started</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
