import { useState, useEffect } from 'react';
import { adminAllOrders, adminUpdateStatus, adminStats } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, RefreshCw,
  ChevronDown, CheckCircle, Clock, Package, Star, XCircle,
  Phone, MapPin, IndianRupee, User, Calendar, FileText
} from 'lucide-react';

const STATUSES = [
  { val: 'confirmed',   label: 'Confirmed',        color: 'var(--blue)' },
  { val: 'picked_up',  label: 'Picked Up',          color: 'var(--violet)' },
  { val: 'in_progress',label: 'In Progress',        color: '#854d0e' },
  { val: 'ready',      label: 'Ready',             color: '#166534' },
  { val: 'delivered',  label: 'Delivered',          color: 'var(--green)' },
  { val: 'cancelled',  label: 'Cancelled',          color: 'var(--red)' },
];

const BADGE = {
  payment_pending: 'badge-pending',
  confirmed:       'badge-confirmed',
  picked_up:       'badge-picked',
  in_progress:     'badge-progress',
  ready:           'badge-ready',
  delivered:       'badge-delivered',
  cancelled:       'badge-cancelled',
};

const STATUS_LABEL = {
  payment_pending: 'Payment Pending',
  confirmed:       'Confirmed',
  picked_up:       'Picked Up',
  in_progress:     'In Progress',
  ready:           'Ready',
  delivered:       'Delivered',
  cancelled:       'Cancelled',
};

/* ── Stats row ───────────────────────────── */
function StatsRow({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total Orders',  val: stats.total,     icon: <ShoppingBag size={18} />, color: 'var(--ink)' },
    { label: 'Active',        val: stats.active,    icon: <RefreshCw size={18} />,   color: 'var(--blue)' },
    { label: 'Delivered',     val: stats.delivered, icon: <CheckCircle size={18} />, color: 'var(--green)' },
    { label: 'Pending Pay',   val: stats.pending,   icon: <Clock size={18} />,       color: 'var(--amber)' },
    { label: 'Revenue',       val: `Rs ${stats.revenue}`, icon: <IndianRupee size={18} />, color: 'var(--green)' },
  ];
  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(5,1fr)' }}>
      {cards.map(c => (
        <div key={c.label} className="card stat-card fade-up">
          <div style={{ color: c.color, marginBottom: 8, opacity: 0.8 }}>{c.icon}</div>
          <div className="stat-value" style={{ color: c.color, fontSize: '1.6rem' }}>{c.val}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Order row in table ──────────────────── */
function OrderRow({ order, onStatusChange }) {
  const [open,   setOpen]   = useState(false);
  const [status, setStatus] = useState(order.status);
  const [note,   setNote]   = useState('');
  const [saving, setSaving] = useState(false);
  const [success,setSuccess]= useState('');

  const handleUpdate = async () => {
    setSaving(true); setSuccess('');
    try {
      await adminUpdateStatus({ order_id: order.id, status, note });
      setSuccess('Updated!');
      onStatusChange();
      setTimeout(() => setSuccess(''), 2000);
    } catch(e) { alert(e.response?.data?.detail || 'Update failed'); }
    finally { setSaving(false); }
  };

  const fmt = iso => new Date(iso).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <td>
          <span className="mono" style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '0.85rem' }}>{order.order_number}</span>
        </td>
        <td>
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{order.customer_name || '—'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <Phone size={11} /> {order.customer_phone || '—'}
          </div>
        </td>
        <td>
          <td>
            <div style={{ fontSize: '0.85rem' }}>
              {(order.service_items || order.services?.map(s => ({ service: s, count: '?' })) || []).map((item, i) => (
                <div key={i} style={{ color: 'var(--ink-2)' }}>
                  {(item.service || item).replace('_', ' ')} {item.count ? `× ${item.count}` : ''}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginTop: 2 }}>
              {order.clothes_count} total items
            </div>
          </td>
        </td>
        <td>
          <span className="mono" style={{ fontWeight: 700 }}>Rs {order.amount}</span>
          <div>
            <span className={`badge ${order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}`} style={{ marginTop: 3 }}>
              {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </td>
        <td><span className={`badge ${BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span></td>
        <td style={{ fontSize: '0.78rem', color: 'var(--ink-4)' }}>{fmt(order.created_at)}</td>
        <td><ChevronDown size={16} style={{ color: 'var(--ink-4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} style={{ background: 'var(--bg)', padding: 0 }}>
            <div style={{ padding: '1rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Left: order info */}
              <div>
                <h4 style={{ marginBottom: 10, fontSize: '0.85rem' }}>Order Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem' }}>
                  {order.pickup_address && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', color: 'var(--ink-2)' }}>
                      <MapPin size={13} style={{ marginTop: 2, flexShrink: 0, color: 'var(--ink-4)' }} />
                      {order.pickup_address}{order.pincode ? ` — ${order.pincode}` : ''}
                    </div>
                  )}
                  {order.upi_ref && (
                    <div style={{ color: 'var(--green)', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <CheckCircle size={13} />
                      UPI Ref: <span className="mono" style={{ fontWeight: 600 }}>{order.upi_ref}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div style={{ display: 'flex', gap: 6, color: 'var(--ink-3)' }}>
                      <FileText size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Status history */}
                {order.status_history?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[...order.status_history].reverse().slice(0, 4).map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: 'var(--ink-3)' }}>
                          <span className="mono" style={{ color: 'var(--ink-4)', fontSize: '0.72rem', flexShrink: 0 }}>
                            {new Date(h.time).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                          </span>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{STATUS_LABEL[h.status] || h.status}</span>
                          {h.note && <span style={{ color: 'var(--ink-4)' }}>· {h.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: status update */}
              <div>
                <h4 style={{ marginBottom: 10, fontSize: '0.85rem' }}>Update Status</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: '0.88rem' }}>
                    {STATUSES.map(s => (
                      <option key={s.val} value={s.val}>{s.label}</option>
                    ))}
                  </select>
                  <input className="form-control" placeholder="Optional note (e.g. picked up at 3pm)"
                    value={note} onChange={e => setNote(e.target.value)} style={{ fontSize: '0.85rem' }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={saving}>
                      {saving ? 'Saving...' : 'Update Status'}
                    </button>
                    {success && <span style={{ color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600 }}>
                      <CheckCircle size={14} style={{ verticalAlign: 'middle' }} /> {success}
                    </span>}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Admin Page ──────────────────────────── */
export default function AdminPage() {
  const [orders,  setOrders]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([adminAllOrders(), adminStats()]);
      setOrders(o.data);
      setStats(s.data);
    } catch(e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Auto-poll every 20s
  useEffect(() => {
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const filtered = orders.filter(o => {
    const mf = filter === 'all' || o.status === filter;
    const ms = !search || o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone || '').includes(search);
    return mf && ms;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--line)', marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>Admin Panel</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginTop: 2 }}>WashWave</div>
          </div>
          {[
            { icon: <LayoutDashboard size={16} />, label: 'Orders', active: true },
          ].map((l, i) => (
            <button key={i} className={`sidebar-link ${l.active ? 'active' : ''}`}>
              {l.icon} {l.label}
            </button>
          ))}
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, padding: '0 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginBottom: 8 }}>Signed in as Admin</div>
            <button className="btn btn-outline btn-sm btn-full" onClick={() => { logout(); navigate('/login'); }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>All Orders</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>Auto-refreshes every 20 seconds</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <StatsRow stats={stats} />

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="form-control" placeholder="Search by order no, name, phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, height: 38, fontSize: '0.85rem' }} />
            <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}
              style={{ width: 'auto', height: 38, fontSize: '0.85rem' }}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
              <option value="payment_pending">Payment Pending</option>
            </select>
          </div>

          {loading && <div className="spinner" />}

          {!loading && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Services</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Placed At</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--ink-4)' }}>No orders found</td></tr>
                  )}
                  {filtered.map(o => (
                    <OrderRow key={o.id} order={o} onStatusChange={load} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
