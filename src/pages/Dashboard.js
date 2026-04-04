import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Clock, CheckCircle, Truck, Package,
  Star, XCircle, ArrowRight, RefreshCw, Search
} from 'lucide-react';

const STATUS_META = {
  payment_pending: { label: 'Payment Pending', badge: 'badge-pending',   icon: <Clock size={12} />,       step: 0 },
  confirmed:       { label: 'Confirmed',        badge: 'badge-confirmed', icon: <CheckCircle size={12} />, step: 1 },
  picked_up:       { label: 'Picked Up',        badge: 'badge-picked',    icon: <Package size={12} />,     step: 2 },
  in_progress:     { label: 'In Progress',      badge: 'badge-progress',  icon: <RefreshCw size={12} />,   step: 3 },
  ready:           { label: 'Ready',            badge: 'badge-ready',     icon: <Star size={12} />,        step: 4 },
  delivered:       { label: 'Delivered',        badge: 'badge-delivered', icon: <CheckCircle size={12} />, step: 5 },
  cancelled:       { label: 'Cancelled',        badge: 'badge-cancelled', icon: <XCircle size={12} />,     step: -1 },
};

const STEPS = ['Confirmed', 'Picked Up', 'Cleaning', 'Ready', 'Delivered'];

function OrderCard({ order }) {
  const meta  = STATUS_META[order.status] || STATUS_META.confirmed;
  const stepIdx = meta.step;
  const isPending   = order.status === 'payment_pending';
  const isCancelled = order.status === 'cancelled';

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card fade-up" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--blue)' }}>{order.order_number}</span>
            <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginTop: 3 }}>{formatDate(order.created_at)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '1.1rem' }}>Rs {order.amount}</div>
          <div className={`badge ${order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}`} style={{ marginTop: 2 }}>
            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.2rem' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Services</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {order.services.map(s => (
                <span key={s} style={{ fontSize: '0.78rem', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 8px', color: 'var(--ink-2)', textTransform: 'capitalize' }}>
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Clothes</div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.clothes_count} items</div>
          </div>
        </div>

        {/* Progress bar (skip if payment_pending or cancelled) */}
        {!isPending && !isCancelled && (
          <div style={{ marginBottom: 12 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.max(5, (stepIdx / 5) * 100)}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--ink-4)' }}>Confirmed</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 600 }}>{meta.label}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--ink-4)' }}>Delivered</span>
            </div>
          </div>
        )}

        {isPending && (
          <div className="alert alert-warning" style={{ marginBottom: 0, fontSize: '0.82rem' }}>
            <Clock size={14} />
            <span>Payment pending. Complete payment to confirm your order.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Link to={`/track?order=${order.order_number}`} className="btn btn-outline btn-sm">
          Track Order <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try { const r = await getMyOrders(); setOrders(r.data); }
    catch(e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.order_number.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    active:    orders.filter(o => ['confirmed','picked_up','in_progress','ready'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending:   orders.filter(o => o.status === 'payment_pending').length,
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div className="fade-up">
          <h1>My Orders</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 4, fontSize: '0.9rem' }}>
            Hello, {user?.name || 'Customer'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/new-order')}>
            <ShoppingBag size={15} /> New Order
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }} className="fade-up fade-up-1">
        {[
          { label: 'Total Orders', val: orders.length, color: 'var(--ink)', bg: 'var(--bg)' },
          { label: 'Active',       val: counts.active,    color: 'var(--blue)',  bg: 'var(--blue-light)' },
          { label: 'Delivered',    val: counts.delivered, color: 'var(--green)', bg: 'var(--green-light)' },
          { label: 'Pending Pay',  val: counts.pending,   color: 'var(--amber)', bg: 'var(--amber-light)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 18px', background: s.bg, borderRadius: 50, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '1rem', color: s.color }}>{s.val}</span>
            <span style={{ fontSize: '0.8rem', color: s.color, opacity: 0.75 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }} className="fade-up fade-up-2">
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <input className="form-control" placeholder="Search by order number..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38, height: 38 }} />
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 3, borderRadius: 10, border: '1px solid var(--line)' }}>
          {[['all','All'], ['confirmed','Active'], ['delivered','Delivered'], ['payment_pending','Pending']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', fontFamily: 'inherit',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: filter === v ? 'white' : 'transparent',
                color: filter === v ? 'var(--blue)' : 'var(--ink-4)',
                boxShadow: filter === v ? 'var(--shadow-sm)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading && <div className="spinner" />}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--ink-4)' }} className="fade-up">
          <ShoppingBag size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--ink-3)' }}>No orders yet</p>
          <p style={{ fontSize: '0.88rem', marginBottom: 20 }}>Place your first laundry order to get started</p>
          <button className="btn btn-primary" onClick={() => navigate('/new-order')}>
            Place Your First Order
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(o => <OrderCard key={o.id} order={o} />)}
      </div>
    </div>
  );
}
