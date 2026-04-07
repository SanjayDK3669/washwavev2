import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, LogOut, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = p => pathname.startsWith(p) ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={close}>
        {/* Try logo image, fallback to dot */}
        <img src="/images/ww_logo.jpeg" alt="WashWave"
          onError={e => { e.target.style.display='none'; }}
          style={{ width:30, height:30, borderRadius:8, objectFit:'cover' }}
        />
        WashWave
      </Link>

      {/* Hamburger (mobile) */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {/* Home link always visible */}
        <Link to="/" className="nav-link" onClick={close}>
          <Home size={14} /> Home
        </Link>

        {!user && (
          <>
            <Link to="/login"    className="nav-link" onClick={close}>Sign In</Link>
            <Link to="/register" className="nav-btn"  onClick={close}>Get Started</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <Link to="/dashboard" className={active('/dashboard')} onClick={close}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link to="/new-order" className={active('/new-order')} onClick={close}>
              <ShoppingBag size={14} /> New Order
            </Link>
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={14} /> Sign Out
            </button>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className={active('/admin')} onClick={close}>
              <LayoutDashboard size={14} /> Admin Panel
            </Link>
            <button onClick={handleLogout} className="nav-link">
              <LogOut size={14} /> Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}