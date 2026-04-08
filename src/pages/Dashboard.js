import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Clock, CheckCircle, Truck, Package,
  Star, XCircle, ArrowRight, RefreshCw, Search, Calendar,
  Smartphone, QrCode, Wallet, Banknote, AlertCircle
} from 'lucide-react';

const STATUS_META = {
  payment_pending:  { label:'Payment Pending',   badge:'badge-pending',   icon:<Clock size={11}/>,        step:0 },
  payment_review:   { label:'Under Review',      badge:'badge-review',    icon:<AlertCircle size={11}/>,  step:0 },
  confirmed:        { label:'Confirmed',          badge:'badge-confirmed', icon:<CheckCircle size={11}/>,  step:1 },
  picked_up:        { label:'Picked Up',          badge:'badge-picked',    icon:<Package size={11}/>,      step:2 },
  in_progress:      { label:'In Progress',        badge:'badge-progress',  icon:<RefreshCw size={11}/>,    step:3 },
  ready:            { label:'Ready',              badge:'badge-ready',     icon:<Star size={11}/>,         step:4 },
  out_for_delivery: { label:'Out for Delivery',   badge:'badge-picked',    icon:<Truck size={11}/>,        step:4 },
  delivered:        { label:'Delivered',          badge:'badge-delivered', icon:<CheckCircle size={11}/>,  step:5 },
  cancelled:        { label:'Cancelled',          badge:'badge-cancelled', icon:<XCircle size={11}/>,      step:-1 },
};

const PAY_ICON = {
  phone_pay: <Smartphone size={12}/>,
  qr_code:   <QrCode size={12}/>,
  upi:       <Wallet size={12}/>,
  cash:      <Banknote size={12}/>,
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = iso => { if(!iso)return''; const [y,m,d]=iso.split('-'); return `${d} ${MONTHS[+m-1]}`; };

function OrderCard({ order }) {
  const meta        = STATUS_META[order.status] || STATUS_META.confirmed;
  const stepIdx     = meta.step;
  const isPending   = order.status === 'payment_pending';
  const isReview    = order.status === 'payment_review';
  const isCancelled = order.status === 'cancelled';
  const isSub       = order.order_type === 'subscription';

  return (
    <div className="card fade-up" style={{ overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'0.9rem 1.1rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid var(--line)', flexWrap:'wrap', gap:6 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span className="mono" style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--blue)' }}>
              {order.order_number}
            </span>
            <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
            {isSub && (
              <span style={{ background:'var(--violet-light)', color:'var(--violet)', fontSize:'0.65rem', fontWeight:700, padding:'2px 7px', borderRadius:'var(--radius)', textTransform:'uppercase' }}>
                Plan
              </span>
            )}
          </div>
          <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', marginTop:3 }}>
            {new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="mono" style={{ fontWeight:800, fontSize:'1rem' }}>Rs {order.amount}</div>
          <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', marginTop:3 }}>
            {PAY_ICON[order.payment_method]}
            <span className={`badge ${order.payment_status==='paid' ? 'badge-paid' : order.payment_status==='cash_on_pickup' ? 'badge-cash' : 'badge-unpaid'}`}>
              {order.payment_status==='paid' ? 'Paid' : order.payment_status==='cash_on_pickup' ? 'Cash' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'0.9rem 1.1rem' }}>
        {/* Services */}
        <div style={{ display:'flex', gap:12, marginBottom:9, flexWrap:'wrap' }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'0.68rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>
              {isSub ? 'Plan' : 'Services'}
            </div>
            {isSub ? (
              <span style={{ fontSize:'0.84rem', fontWeight:600 }}>
                {order.subscription_plan==='basic' ? 'Basic (10 clothes)' : 'Standard (20 clothes)'}
              </span>
            ) : (
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {order.services?.map(s => (
                  <span key={s} style={{ fontSize:'0.74rem', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:5, padding:'2px 7px', color:'var(--ink-2)', textTransform:'capitalize' }}>
                    {s.replace('_',' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize:'0.68rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Clothes</div>
            <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{order.clothes_count} items</div>
          </div>
        </div>

        {/* Pickup date */}
        {(order.pickup_date || order.pickup_time) && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px', background:'var(--blue-light)', borderRadius:'var(--radius)', fontSize:'0.78rem', marginBottom:9 }}>
            <Calendar size={12} color="var(--blue)"/>
            <span style={{ color:'var(--blue)', fontWeight:600 }}>Pickup:</span>
            <span style={{ color:'var(--ink-2)' }}>{fmtDate(order.pickup_date)} {order.pickup_time && `· ${order.pickup_time}`}</span>
          </div>
        )}

        {/* Status alerts */}
        {isPending && (
          <div className="alert alert-warning" style={{ fontSize:'0.8rem', marginBottom:0, padding:'8px 10px' }}>
            <Clock size={13}/> <span>Complete payment to confirm order</span>
          </div>
        )}
        {isReview && (
          <div className="alert alert-warning" style={{ fontSize:'0.8rem', marginBottom:0, padding:'8px 10px' }}>
            <AlertCircle size={13}/> <span>Payment under review · Admin will verify shortly</span>
          </div>
        )}

        {/* Progress bar */}
        {!isPending && !isReview && !isCancelled && (
          <div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width:`${Math.max(4,(stepIdx/5)*100)}%` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:'0.65rem', color:'var(--ink-4)' }}>Confirmed</span>
              <span style={{ fontSize:'0.68rem', color:'var(--blue)', fontWeight:700 }}>{meta.label}</span>
              <span style={{ fontSize:'0.65rem', color:'var(--ink-4)' }}>Delivered</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end' }}>
        <Link to={`/track?order=${order.order_number}`} className="btn btn-outline btn-sm">
          Track Order <ArrowRight size={13}/>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
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
    const mf = filter==='all' || o.status===filter;
    const ms = !search || o.order_number.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const counts = {
    active:   orders.filter(o=>['confirmed','picked_up','in_progress','ready','out_for_delivery'].includes(o.status)).length,
    review:   orders.filter(o=>o.status==='payment_review').length,
    delivered:orders.filter(o=>o.status==='delivered').length,
    pending:  orders.filter(o=>['payment_pending','payment_review'].includes(o.status)).length,
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.3rem', flexWrap:'wrap', gap:10 }}>
        <div className="fade-up">
          <h1>My Orders</h1>
          <p style={{ color:'var(--ink-3)', marginTop:3, fontSize:'0.88rem' }}>
            Hello, {user?.name || 'Customer'}
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={load}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button className="btn btn-primary" onClick={()=>navigate('/new-order')}>
            <ShoppingBag size={14}/> New Order
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.2rem', flexWrap:'wrap' }} className="fade-up fade-up-1">
        {[
          {label:'Total',    val:orders.length,  color:'var(--ink)',   bg:'var(--bg)'},
          {label:'Active',   val:counts.active,  color:'var(--blue)',  bg:'var(--blue-light)'},
          {label:'Delivered',val:counts.delivered,color:'var(--green)',bg:'var(--green-light)'},
          {label:'Pending',  val:counts.pending, color:'var(--amber)', bg:'var(--amber-light)'},
        ].map(s => (
          <div key={s.label} style={{ padding:'8px 14px', background:s.bg, borderRadius:50, display:'flex', alignItems:'center', gap:7, border:'1px solid rgba(0,0,0,0.05)' }}>
            <span className="mono" style={{ fontWeight:800, fontSize:'0.95rem', color:s.color }}>{s.val}</span>
            <span style={{ fontSize:'0.76rem', color:s.color, opacity:0.75 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.1rem', flexWrap:'wrap', alignItems:'center' }} className="fade-up fade-up-2">
        <div style={{ position:'relative', flex:1, minWidth:160 }}>
          <input className="form-control" placeholder="Search by order number..."
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ paddingLeft:36, height:38, fontSize:'0.84rem' }}/>
          <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
        </div>
        <div style={{ display:'flex', gap:4, background:'var(--bg)', padding:3, borderRadius:'var(--radius)', border:'1px solid var(--line)', flexWrap:'wrap' }}>
          {[['all','All'],['confirmed','Active'],['payment_review','Review'],['delivered','Done'],['payment_pending','Pending']].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)}
              style={{ padding:'5px 12px', borderRadius:8, border:'none', fontFamily:'inherit',
                fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                background: filter===v ? 'white' : 'transparent',
                color: filter===v ? 'var(--blue)' : 'var(--ink-4)',
                boxShadow: filter===v ? 'var(--shadow-sm)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="spinner"/>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'3.5rem 1.5rem', color:'var(--ink-4)' }} className="fade-up">
          <ShoppingBag size={36} style={{ margin:'0 auto 14px', opacity:0.25 }}/>
          <p style={{ fontWeight:600, marginBottom:7, color:'var(--ink-3)' }}>No orders found</p>
          <p style={{ fontSize:'0.86rem', marginBottom:18 }}>
            {filter !== 'all' ? 'No orders match this filter' : 'Place your first laundry order to get started'}
          </p>
          {filter === 'all' && (
            <button className="btn btn-primary" onClick={()=>navigate('/new-order')}>
              Place Your First Order
            </button>
          )}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
        {filtered.map(o => <OrderCard key={o.id} order={o}/>)}
      </div>
    </div>
  );
}