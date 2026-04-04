import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import NewOrderPage from './pages/NewOrderPage';
import TrackPage from './pages/TrackPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function Guard({ children, role }) {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' }}><div className="spinner" /></div>;
  if (!user)  return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AlreadyAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="app">
      <Routes>
        {/* ── Public with Navbar ── */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />

        {/* ── Auth (no navbar, split layout) ── */}
        <Route path="/login"    element={<AlreadyAuth><LoginPage /></AlreadyAuth>} />
        <Route path="/register" element={<AlreadyAuth><RegisterPage /></AlreadyAuth>} />

        {/* ── Hidden admin login ── */}
        <Route path="/admin/login" element={<AlreadyAuth><LoginPage isAdmin /></AlreadyAuth>} />

        {/* ── Customer routes ── */}
        <Route path="/dashboard" element={<Guard role="customer"><Navbar /><Dashboard /></Guard>} />
        <Route path="/new-order" element={<Guard role="customer"><Navbar /><NewOrderPage /></Guard>} />
        <Route path="/track"     element={<Guard role="customer"><Navbar /><TrackPage /></Guard>} />

        {/* ── Admin route (hidden — only via URL) ── */}
        <Route path="/admin" element={<Guard role="admin"><AdminPage /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
