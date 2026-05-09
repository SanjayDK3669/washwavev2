import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, LogOut, Home, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled,  setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const active  = p => pathname.startsWith(p) ? 'nav-link active' : 'nav-link';
  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none' }}>
      <Link to="/" className="navbar-brand" onClick={close}>
        <img
          src="https://washwavebackendv2.onrender.com/images/ww_logo.jpeg"
          alt="WashWave"
          onError={e => { e.target.style.display = 'none'; }}
          style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }}
        />
        WashWave
      </Link>

      {/* Hamburger */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'transform 0.2s' }}/>
        <span style={{ opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }}/>
        <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'transform 0.2s' }}/>
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={close}>
          <Home size={14}/> Home
        </Link>

        {!user && (
          <>
            <Link to="/login"    className="nav-link" onClick={close}>Sign In</Link>
            <Link to="/register" className="nav-btn"  onClick={close}>Get Started →</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <Link to="/dashboard" className={active('/dashboard')} onClick={close}>
              <LayoutDashboard size={14}/> Dashboard
            </Link>
            <Link to="/new-order" className={active('/new-order')} onClick={close}>
              <ShoppingBag size={14}/> New Order
            </Link>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 10px', borderRadius: 'var(--radius-pill)',
              background: 'var(--blue-light)', fontSize: '0.78rem',
              fontWeight: 700, color: 'var(--blue)'
            }}>
              {user.name?.split(' ')[0]}
            </div>
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={14}/> Sign Out
            </button>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className={active('/admin')} onClick={close}>
              <LayoutDashboard size={14}/> Admin Panel
            </Link>
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={14}/> Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}