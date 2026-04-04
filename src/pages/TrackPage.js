import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackOrder, getMyOrders } from '../utils/api';
import {
  CheckCircle, Clock, Package, RefreshCw, Truck,
  Star, XCircle, Search, ArrowRight, MapPin, Hash
} from 'lucide-react';

const ALL_STEPS = [
  { key: 'confirmed',   label: 'Order Confirmed',   desc: 'Payment received, order accepted' },
  { key: 'picked_up',  label: 'Clothes Picked Up',  desc: 'Our team collected your clothes' },
  { key: 'in_progress',label: 'Being Cleaned',      desc: 'Your clothes are being processed' },
  { key: 'ready',      label: 'Ready for Delivery', desc: 'Cleaning done, out for delivery' },
  { key: 'delivered',  label: 'Delivered',          desc: 'Clothes returned to your address' },
];

const STATUS_META = {
  payment_pending: { label: 'Payment Pending', color: 'var(--amber)', bg: 'var(--amber-light)' },
  confirmed:       { label: 'Confirmed',        color: 'var(--blue)',  bg: 'var(--blue-light)' },
  picked_up:       { label: 'Picked Up',        color: 'var(--violet)',bg: 'var(--violet-light)' },
  in_progress:     { label: 'In Progress',      color: '#854d0e',     bg: '#fef9c3' },
  ready:           { label: 'Ready',            color: '#166534',     bg: '#dcfce7' },
  delivered:       { label: 'Delivered',        color: 'var(--green)', bg: 'var(--green-light)' },
  cancelled:       { label: 'Cancelled',        color: 'var(--red)',  bg: 'var(--red-light)' },
};

const stepIndex = s => ALL_STEPS.findIndex(st => st.key === s);

function Timeline({ order }) {
  const current = stepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="alert alert-error" style={{ marginTop: 8 }}>
        <XCircle size={16} /> This order was cancelled.
      </div>
    );
  }

  if (order.status === 'payment_pending') {
    return (
      <div className="alert alert-warning" style={{ marginTop: 8 }}>
        <Clock size={16} /> Payment is pending. Your order will be confirmed once payment is received.
      </div>
    );
  }

  return (
    <div className="timeline" style={{ marginTop: 8 }}>
      {ALL_STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        const future = i > current;
        return (
          <div key={step.key} className="tl-item">
            <div className="tl-left">
              <div className={`tl-dot ${done ? 'tl-dot-done' : active ? 'tl-dot-active' : 'tl-dot-future'}`}>
                {done   && <CheckCircle size={11} color="white" />}
                {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
              </div>
              {i < ALL_STEPS.length - 1 && <div className="tl-line" />}
            </div>
            <div className="tl-content">
              <div className="tl-status" style={{ color: done || active ? 'var(--ink)' : 'var(--ink-4)', opacity: future ? 0.5 : 1 }}>
                {step.label}
              </div>
              <div className="tl-note" style={{ opacity: future ? 0.4 : 1 }}>{step.desc}</div>
              {/* Match from status_history */}
              {(done || active) && order.status_history && (() => {
                const hist = order.status_history.find(h => h.status === step.key);
                if (!hist) return null;
                return (
                  <div className="tl-time">
                    {new Date(hist.time).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    {hist.note && <span style={{ marginLeft: 6, opacity: 0.7 }}>· {hist.note}</span>}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [params]            = useSearchParams();
  const [orderNum, setOrderNum] = useState(params.get('order') || '');
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');
  const [polling, setPolling] = useState(false);

  const meta = order ? STATUS_META[order.status] : null;

  const load = async (num = orderNum) => {
    if (!num.trim()) return;
    setLoading(true); setErr('');
    try {
      const r = await trackOrder(num.trim().toUpperCase());
      setOrder(r.data);
    } catch(e) {
      setErr(e.response?.data?.detail || 'Order not found');
      setOrder(null);
    } finally { setLoading(false); }
  };

  // Auto-load if order num in URL
  useEffect(() => {
    const n = params.get('order');
    if (n) { setOrderNum(n); load(n); }
  }, []);

  // Auto-poll for active orders
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;
    const t = setInterval(() => load(order.order_number), 30000);
    return () => clearInterval(t);
  }, [order]);

  return (
    <div className="page page-sm" style={{ paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: 6 }} className="fade-up">Track Order</h1>
      <p style={{ color: 'var(--ink-3)', marginBottom: '1.8rem', fontSize: '0.9rem' }} className="fade-up fade-up-1">
        Enter your order number to see real-time status
      </p>

      {/* Search box */}
      <div className="card fade-up fade-up-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input className="form-control mono" placeholder="e.g. WW123456"
                value={orderNum} onChange={e => setOrderNum(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && load()}
                style={{ paddingLeft: 40, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }} />
              <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
            </div>
            <button className="btn btn-primary" onClick={() => load()} disabled={loading}>
              {loading ? <RefreshCw size={16} style={{ animation: 'spin 0.65s linear infinite' }} /> : <><Search size={16} /> Track</>}
            </button>
          </div>
        </div>
      </div>

      {err && <div className="alert alert-error fade-up"><XCircle size={15} /><span>{err}</span></div>}

      {order && (
        <div className="fade-up">
          {/* Status banner */}
          <div style={{ background: meta?.bg, borderRadius: 'var(--radius)', padding: '1.2rem 1.4rem', marginBottom: '1rem', border: `1px solid ${meta?.color}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: meta?.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Current Status</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: meta?.color, letterSpacing: '-0.02em' }}>{meta?.label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>{order.order_number}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header"><h4>Order Details</h4></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Services</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {order.services.map(s => (
                      <span key={s} style={{ fontSize: '0.78rem', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 8px', textTransform: 'capitalize' }}>
                        {s.replace('_',' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Clothes</div>
                  <div style={{ fontWeight: 700 }}>{order.clothes_count} items</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Amount</div>
                  <div className="mono" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Rs {order.amount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Payment</div>
                  <div className={`badge ${order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </div>
                </div>
              </div>
              {order.pickup_address && (
                <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <MapPin size={14} style={{ color: 'var(--ink-4)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>{order.pickup_address}{order.pincode ? ` — ${order.pincode}` : ''}</span>
                </div>
              )}
              {order.upi_ref && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--green)' }}>
                  UPI Ref: <span className="mono" style={{ fontWeight: 600 }}>{order.upi_ref}</span>
                </div>
              )}
              {order.notes && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--ink-3)' }}>
                  Note: {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Timeline card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h4>Order Progress</h4>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-4)' }}>Auto-updates every 30s</span>
              )}
            </div>
            <div className="card-body">
              <Timeline order={order} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-outline btn-sm">
              All Orders
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => load(order.order_number)}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
