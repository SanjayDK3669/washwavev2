import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = p => pathname.startsWith(p) ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-dot" />
        WashWave
      </Link>

      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login"    className="nav-link">Sign In</Link>
            <Link to="/register" className="nav-btn">Get Started</Link>
          </>
        )}
        {user?.role === 'customer' && (
          <>
            <Link to="/dashboard"  className={active('/dashboard')}  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link to="/new-order"  className={active('/new-order')}  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={15} /> New Order
            </Link>
            <button onClick={handleLogout} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className={active('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayoutDashboard size={15} /> Admin Panel
            </Link>
            <button onClick={handleLogout} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
