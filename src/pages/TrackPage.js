import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trackOrder } from '../utils/api';
import {
  CheckCircle, Clock, Package, RefreshCw, Truck,
  XCircle, Search, ArrowRight, MapPin, Hash,
  Calendar, AlertCircle, Banknote, Smartphone, QrCode, Wallet
} from 'lucide-react';

const ALL_STEPS = [
  { key: 'confirmed',        label: 'Order Confirmed',    desc: 'Payment verified, order accepted' },
  { key: 'picked_up',        label: 'Clothes Picked Up',  desc: 'Our team collected your clothes' },
  { key: 'in_progress',      label: 'Being Cleaned',      desc: 'Your clothes are being processed' },
  { key: 'ready',            label: 'Ready for Delivery', desc: 'Cleaning done, ready to dispatch' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   desc: 'On the way to your address' },
  { key: 'delivered',        label: 'Delivered',          desc: 'Clothes returned to your door' },
];

const STATUS_META = {
  payment_pending:  { label: 'Payment Pending',  color: 'var(--amber)', bg: 'var(--amber-light)' },
  payment_review:   { label: 'Payment Under Review', color: '#854d0e', bg: '#fef9c3' },
  confirmed:        { label: 'Confirmed',        color: 'var(--blue)',   bg: 'var(--blue-light)' },
  picked_up:        { label: 'Picked Up',        color: 'var(--violet)', bg: 'var(--violet-light)' },
  in_progress:      { label: 'In Progress',      color: '#854d0e',      bg: '#fef9c3' },
  ready:            { label: 'Ready',            color: '#166534',      bg: '#dcfce7' },
  out_for_delivery: { label: 'Out for Delivery', color: 'var(--violet)', bg: 'var(--violet-light)' },
  delivered:        { label: 'Delivered',        color: 'var(--green)', bg: 'var(--green-light)' },
  cancelled:        { label: 'Cancelled',        color: 'var(--red)',   bg: 'var(--red-light)' },
};

const PAY_METHOD_LABEL = {
  phone_pay: 'PhonePe',
  qr_code:   'QR Code',
  upi:       'UPI Transfer',
  cash:      'Cash on Pickup',
};

const PAY_METHOD_ICON = {
  phone_pay: <Smartphone size={13}/>,
  qr_code:   <QrCode size={13}/>,
  upi:       <Wallet size={13}/>,
  cash:      <Banknote size={13}/>,
};

const stepIndex = s => ALL_STEPS.findIndex(st => st.key === s);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = iso => {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d} ${MONTHS[+m-1]} ${y}`;
};

function Timeline({ order }) {
  const current = stepIndex(order.status);

  if (order.status === 'cancelled') {
    return (
      <div className="alert alert-error">
        <XCircle size={15}/> This order was cancelled.
        {order.status_history?.slice(-1)[0]?.note && (
          <span style={{ marginLeft: 6 }}>Reason: {order.status_history.slice(-1)[0].note}</span>
        )}
      </div>
    );
  }

  if (order.status === 'payment_pending') {
    return (
      <div className="alert alert-warning">
        <Clock size={15}/> Awaiting payment. Complete payment to confirm your order.
      </div>
    );
  }

  if (order.status === 'payment_review') {
    return (
      <div>
        <div className="alert alert-warning">
          <AlertCircle size={15}/>
          <span>
            Your payment is being reviewed by our team. This usually takes 1–4 hours.
            {order.upi_ref && <> Transaction ref: <strong className="mono">{order.upi_ref}</strong></>}
          </span>
        </div>
        <div className="alert alert-info" style={{ marginTop: 0 }}>
          <CheckCircle size={15}/> We'll notify you once payment is verified and your order is confirmed.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {ALL_STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        const future = i > current;
        const hist   = order.status_history?.find(h => h.status === step.key);
        return (
          <div key={step.key} className="tl-item">
            <div className="tl-left">
              <div className={`tl-dot ${done ? 'tl-dot-done' : active ? 'tl-dot-active' : 'tl-dot-future'}`}>
                {done   && <CheckCircle size={11} color="white"/>}
                {active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }}/>}
              </div>
              {i < ALL_STEPS.length - 1 && <div className="tl-line"/>}
            </div>
            <div className="tl-content">
              <div className="tl-status" style={{ color: future ? 'var(--ink-4)' : 'var(--ink)', opacity: future ? 0.5 : 1 }}>
                {step.label}
              </div>
              <div className="tl-note" style={{ opacity: future ? 0.4 : 1 }}>{step.desc}</div>
              {hist && (done || active) && (
                <div className="tl-time">
                  {new Date(hist.time).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  {hist.note && <span style={{ marginLeft: 5, opacity: 0.7 }}>· {hist.note}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [params]    = useSearchParams();
  const [orderNum, setOrderNum] = useState(params.get('order') || '');
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');

  const meta = order ? (STATUS_META[order.status] || STATUS_META.confirmed) : null;

  const load = async (num = orderNum) => {
    const n = (num || '').trim().toUpperCase();
    if (!n) return;
    setLoading(true); setErr('');
    try {
      const r = await trackOrder(n);
      setOrder(r.data);
    } catch(e) {
      setErr(e.response?.data?.detail || 'Order not found. Check your order number.');
      setOrder(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const n = params.get('order');
    if (n) { setOrderNum(n); load(n); }
  }, []);

  // Poll every 30s for active orders
  useEffect(() => {
    if (!order) return;
    const terminal = ['delivered','cancelled'].includes(order.status);
    if (terminal) return;
    const t = setInterval(() => load(order.order_number), 30000);
    return () => clearInterval(t);
  }, [order?.status]);

  const isSubscription = order?.order_type === 'subscription';

  return (
    <div className="page page-sm" style={{ paddingTop: '1.5rem' }}>
      <h1 style={{ marginBottom: 5 }} className="fade-up">Track Order</h1>
      <p style={{ color:'var(--ink-3)', marginBottom:'1.4rem', fontSize:'0.88rem' }} className="fade-up fade-up-1">
        Enter your order number to see live status
      </p>

      {/* Search */}
      <div className="card fade-up fade-up-2" style={{ marginBottom: '1.2rem' }}>
        <div className="card-body">
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ position:'relative', flex:1 }}>
              <input className="form-control mono"
                placeholder="e.g. WW123456"
                value={orderNum}
                onChange={e => setOrderNum(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && load()}
                style={{ paddingLeft:40, textTransform:'uppercase', fontWeight:600, letterSpacing:'0.04em' }}/>
              <Hash size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
            </div>
            <button className="btn btn-primary" onClick={() => load()} disabled={loading}>
              {loading
                ? <RefreshCw size={15} style={{ animation:'spin 0.65s linear infinite' }}/>
                : <><Search size={15}/> Track</>}
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="alert alert-error fade-up">
          <XCircle size={14}/><span>{err}</span>
        </div>
      )}

      {order && (
        <div className="fade-up">
          {/* Status banner */}
          <div style={{ background:meta?.bg, borderRadius:'var(--radius)', padding:'1.1rem 1.3rem', marginBottom:'1rem', border:`1px solid ${meta?.color}33` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
              <div>
                <div style={{ fontSize:'0.7rem', color:meta?.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>
                  Current Status
                </div>
                <div style={{ fontSize:'1.25rem', fontWeight:800, color:meta?.color, letterSpacing:'-0.02em' }}>
                  {meta?.label}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div className="mono" style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--ink)' }}>
                  {order.order_number}
                </div>
                <div style={{ fontSize:'0.7rem', color:'var(--ink-4)', marginTop:2 }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                </div>
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header"><h4>Order Details</h4></div>
            <div className="card-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginBottom:'0.9rem' }}>

                {/* Services / Plan */}
                <div>
                  <div style={{ fontSize:'0.7rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>
                    {isSubscription ? 'Plan' : 'Services'}
                  </div>
                  {isSubscription ? (
                    <div style={{ fontWeight:700, fontSize:'0.88rem' }}>
                      {order.subscription_plan === 'basic' ? 'Basic (10 clothes)' : 'Standard (20 clothes)'}
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {(order.service_items?.length > 0 ? order.service_items : []).map((item, i) => (
                        <span key={i} style={{ fontSize:'0.76rem', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:6, padding:'2px 8px', textTransform:'capitalize' }}>
                          {item.service?.replace('_',' ')} ×{item.count}
                        </span>
                      ))}
                      {(!order.service_items?.length) && order.services?.map(s => (
                        <span key={s} style={{ fontSize:'0.76rem', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:6, padding:'2px 8px', textTransform:'capitalize' }}>
                          {s.replace('_',' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clothes count */}
                <div>
                  <div style={{ fontSize:'0.7rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Clothes</div>
                  <div style={{ fontWeight:700 }}>{order.clothes_count} items</div>
                </div>

                {/* Amount */}
                <div>
                  <div style={{ fontSize:'0.7rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Amount</div>
                  <div className="mono" style={{ fontWeight:800, fontSize:'1.05rem' }}>Rs {order.amount}</div>
                </div>

                {/* Payment */}
                <div>
                  <div style={{ fontSize:'0.7rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Payment</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    {PAY_METHOD_ICON[order.payment_method]}
                    <span style={{ fontSize:'0.82rem', fontWeight:600 }}>
                      {PAY_METHOD_LABEL[order.payment_method] || order.payment_method}
                    </span>
                  </div>
                  <div className={`badge ${order.payment_status==='paid' ? 'badge-paid' : order.payment_status==='cash_on_pickup' ? 'badge-cash' : 'badge-unpaid'}`} style={{ marginTop:4 }}>
                    {order.payment_status === 'paid' ? 'Paid'
                      : order.payment_status === 'cash_on_pickup' ? 'Cash on Pickup'
                      : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Pickup schedule */}
              {(order.pickup_date || order.pickup_time) && (
                <div style={{ padding:'9px 12px', background:'var(--blue-light)', borderRadius:'var(--radius)', display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:'0.84rem' }}>
                  <Calendar size={14} color="var(--blue)"/>
                  <div>
                    <span style={{ fontWeight:700, color:'var(--blue)' }}>Pickup: </span>
                    <span style={{ color:'var(--ink-2)' }}>
                      {fmtDate(order.pickup_date)} {order.pickup_time && `at ${order.pickup_time}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Address */}
              {order.pickup_address && (
                <div style={{ padding:'9px 12px', background:'var(--bg)', borderRadius:'var(--radius)', display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                  <MapPin size={14} style={{ color:'var(--ink-4)', marginTop:2, flexShrink:0 }}/>
                  <span style={{ fontSize:'0.84rem', color:'var(--ink-2)' }}>
                    {order.pickup_address}{order.pincode ? ` — ${order.pincode}` : ''}
                  </span>
                </div>
              )}

              {/* UPI ref */}
              {order.upi_ref && (
                <div style={{ padding:'7px 12px', background:'var(--green-light)', borderRadius:'var(--radius)', fontSize:'0.78rem', color:'var(--green)' }}>
                  UPI Ref: <span className="mono" style={{ fontWeight:700 }}>{order.upi_ref}</span>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div style={{ padding:'7px 12px', background:'var(--bg)', borderRadius:'var(--radius)', fontSize:'0.8rem', color:'var(--ink-3)', marginTop:8 }}>
                  Note: {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Progress timeline */}
          <div className="card" style={{ marginBottom:'1.2rem' }}>
            <div className="card-header">
              <h4>Order Progress</h4>
              {!['delivered','cancelled','payment_pending'].includes(order.status) && (
                <span style={{ fontSize:'0.7rem', color:'var(--ink-4)' }}>Auto-updates every 30s</span>
              )}
            </div>
            <div className="card-body">
              <Timeline order={order}/>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
            <Link to="/dashboard" className="btn btn-outline btn-sm">All Orders</Link>
            <button className="btn btn-ghost btn-sm" onClick={() => load(order.order_number)}>
              <RefreshCw size={13}/> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}