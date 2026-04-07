import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, loginApi } from '../utils/api';
import { Eye, EyeOff, Phone, Lock, User, MapPin, Hash, ArrowRight, CheckCircle, Home } from 'lucide-react';

function PasswordInput({ value, onChange, placeholder = 'Password' }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="form-control" type={show ? 'text' : 'password'}
        placeholder={placeholder} value={value} onChange={onChange}
        style={{ paddingRight: 44 }} />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--ink-4)', display:'flex' }}>
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function StrengthBar({ password }) {
  const s = [password.length>=8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (!password) return null;
  const colors = ['#ef4444','#f97316','#f59e0b','#22c55e'];
  const labels = ['Weak','Fair','Good','Strong'];
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:3 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<s ? colors[s-1] : 'var(--line)', transition:'background 0.3s' }}/>)}
      </div>
      <span style={{ fontSize:'0.7rem', color:colors[s-1], fontWeight:600 }}>{labels[s-1]}</span>
    </div>
  );
}

function HomeButton() {
  return (
    <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--ink-4)', fontSize:'0.82rem', textDecoration:'none', marginBottom:'1.2rem', fontWeight:500 }}>
      <Home size={14} /> Back to Home
    </Link>
  );
}

/* ── Register ── */
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
    if (f.password.length < 6)    return setErr('Password must be at least 6 characters');
    setLoading(true); setErr('');
    try {
      const res = await register({ name:f.name, phone:f.phone, password:f.password, address:f.address, pincode:f.pincode });
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
        <div style={{ position:'relative' }}>
          <input className="form-control" placeholder="Your full name" value={f.name} onChange={set('name')} required style={{ paddingLeft:40 }}/>
          <User size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ padding:'11px 10px', border:'1.5px solid var(--line)', borderRadius:'var(--radius)', background:'var(--bg)', fontSize:'0.85rem', color:'var(--ink-3)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
            <Phone size={13}/> +91
          </div>
          <input className="form-control" placeholder="9876543210" maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))} required/>
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
        {f.confirm && f.password !== f.confirm && <p className="form-error">Passwords don't match</p>}
      </div>
      <div className="form-group">
        <label className="form-label">Address <span style={{ fontWeight:400, textTransform:'none', color:'var(--ink-4)' }}>(optional)</span></label>
        <div style={{ position:'relative' }}>
          <input className="form-control" placeholder="Your home address" value={f.address} onChange={set('address')} style={{ paddingLeft:40 }}/>
          <MapPin size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Pincode <span style={{ fontWeight:400, textTransform:'none', color:'var(--ink-4)' }}>(optional)</span></label>
        <div style={{ position:'relative' }}>
          <input className="form-control" placeholder="560001" maxLength={6} value={f.pincode}
            onChange={e => setF(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'') }))} style={{ paddingLeft:40 }}/>
          <Hash size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
        </div>
      </div>
      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
        {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={17}/></>}
      </button>
      <p style={{ textAlign:'center', marginTop:14, fontSize:'0.86rem', color:'var(--ink-3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
      </p>
    </form>
  );
}

/* ── Login ── */
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
      const res = await loginApi({ phone:f.phone, password:f.password, role: isAdmin ? 'admin' : 'customer' });
      login(res.data.token, res.data.user);
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch(e) { setErr(e.response?.data?.detail || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      {isAdmin && <div className="alert alert-warning"><Lock size={14}/> Admin login</div>}
      {err && <div className="alert alert-error"><span>{err}</span></div>}
      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ padding:'11px 10px', border:'1.5px solid var(--line)', borderRadius:'var(--radius)', background:'var(--bg)', fontSize:'0.85rem', color:'var(--ink-3)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 }}>
            <Phone size={13}/> +91
          </div>
          <input className="form-control" placeholder={isAdmin ? 'Admin phone' : '9876543210'} maxLength={10}
            value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))} required/>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <PasswordInput value={f.password} onChange={set('password')}/>
      </div>
      <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
        {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={17}/></>}
      </button>
      {!isAdmin && (
        <p style={{ textAlign:'center', marginTop:14, fontSize:'0.86rem', color:'var(--ink-3)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--blue)', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
        </p>
      )}
    </form>
  );
}

/* ── Left panel ── */
function AuthLeft({ title, subtitle }) {
  return (
    <div className="auth-left">
      <div style={{ marginBottom:'3rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'2.5rem' }}>
          <img src="https://washwavebackendv2.onrender.com/images/ww_logo.jpeg" alt="WashWave"
            onError={e => e.target.style.display='none'}
            style={{ width:36, height:36, borderRadius:10, objectFit:'cover' }}/>
          <span style={{ fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>WashWave</span>
        </div>
        <h1 style={{ color:'white', fontSize:clamp('1.5rem','4vw','2rem'), marginBottom:14, lineHeight:1.1 }}>{title}</h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.95rem', lineHeight:1.6 }}>{subtitle}</p>
      </div>
    </div>
  );
}

function clamp(min, val, max) { return `clamp(${min}, ${val}, ${max})`; }

export function LoginPage({ isAdmin }) {
  return (
    <div className="auth-wrap">
      <AuthLeft
        title={isAdmin ? 'Admin Dashboard' : 'Welcome back'}
        subtitle={isAdmin ? 'Manage all customer orders from one place.' : 'Sign in to track your laundry orders.'}
      />
      <div className="auth-right">
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto' }}>
          <HomeButton/>
          <h2 style={{ marginBottom:6 }}>{isAdmin ? 'Admin Sign In' : 'Sign in'}</h2>
          <p style={{ color:'var(--ink-3)', marginBottom:'1.6rem', fontSize:'0.88rem' }}>
            {isAdmin ? 'Enter admin credentials' : 'Enter your phone number and password'}
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
        subtitle="Create your account to book laundry pickups at your door."
      />
      <div className="auth-right">
        <div style={{ maxWidth:400, width:'100%', margin:'0 auto', padding:'1rem 0' }}>
          <HomeButton/>
          <h2 style={{ marginBottom:6 }}>Create account</h2>
          <p style={{ color:'var(--ink-3)', marginBottom:'1.6rem', fontSize:'0.88rem' }}>Fill in your details to get started</p>
          <RegisterForm/>
        </div>
      </div>
    </div>
  );
}