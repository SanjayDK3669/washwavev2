import { useState, useEffect } from 'react';
import { adminAllOrders, adminUpdateStatus, adminVerifyPayment, adminStats } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, RefreshCw, ChevronDown,
  CheckCircle, Clock, IndianRupee, Phone, MapPin, FileText,
  ThumbsUp, ThumbsDown, Calendar
} from 'lucide-react';

const STATUSES = [
  {val:'confirmed',        label:'Confirmed'},
  {val:'picked_up',        label:'Picked Up'},
  {val:'in_progress',      label:'In Progress'},
  {val:'ready',            label:'Ready'},
  {val:'out_for_delivery', label:'Out for Delivery'},
  {val:'delivered',        label:'Delivered'},
  {val:'cancelled',        label:'Cancelled'},
];

const BADGE = {
  payment_pending:  'badge-pending',
  payment_review:   'badge-review',
  confirmed:        'badge-confirmed',
  picked_up:        'badge-picked',
  in_progress:      'badge-progress',
  ready:            'badge-ready',
  out_for_delivery: 'badge-picked',
  delivered:        'badge-delivered',
  cancelled:        'badge-cancelled',
};

const STATUS_LABEL = {
  payment_pending:  'Payment Pending',
  payment_review:   'Under Review',
  confirmed:        'Confirmed',
  picked_up:        'Picked Up',
  in_progress:      'In Progress',
  ready:            'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const PAY_METHOD_LABEL = {
  phone_pay: 'PhonePe',
  qr_code:   'QR Code',
  upi:       'UPI',
  cash:      'Cash on Pickup',
};

function StatsRow({ stats }) {
  if (!stats) return null;
  const cards = [
    {label:'Total Orders', val:stats.total,           color:'var(--ink)',   icon:<ShoppingBag size={16}/>},
    {label:'Under Review', val:stats.payment_review,  color:'#854d0e',      icon:<Clock size={16}/>},
    {label:'Active',       val:stats.active,          color:'var(--blue)',  icon:<RefreshCw size={16}/>},
    {label:'Delivered',    val:stats.delivered,       color:'var(--green)', icon:<CheckCircle size={16}/>},
    {label:'Revenue',      val:`Rs ${stats.revenue}`, color:'var(--green)', icon:<IndianRupee size={16}/>},
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:'1.4rem' }}>
      {cards.map(c => (
        <div key={c.label} className="card stat-card fade-up" style={{ padding:'0.9rem 1rem' }}>
          <div style={{ color:c.color, marginBottom:6, opacity:0.8 }}>{c.icon}</div>
          <div className="stat-value" style={{ color:c.color }}>{c.val}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function OrderRow({ order, onRefresh }) {
  const [open,    setOpen]   = useState(false);
  const [status,  setStatus] = useState(order.status);
  const [note,    setNote]   = useState('');
  const [saving,  setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState('');

  const needsVerification = order.status === 'payment_review';
  const fmt = iso => iso ? new Date(iso).toLocaleString('en-IN', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';

  const handleStatus = async () => {
    setSaving(true); setSuccess('');
    try {
      await adminUpdateStatus({order_id:order.id, status, note});
      setSuccess('Updated!'); onRefresh();
      setTimeout(()=>setSuccess(''),2000);
    } catch(e) { alert(e.response?.data?.detail||'Update failed'); }
    finally { setSaving(false); }
  };

  const handleVerify = async (approved) => {
    setVerifying(true);
    try {
      await adminVerifyPayment({order_id:order.id, approved, note: approved ? 'Payment verified' : note||'Transaction ID invalid'});
      onRefresh();
    } catch(e) { alert(e.response?.data?.detail||'Verification failed'); }
    finally { setVerifying(false); }
  };

  return (
    <>
      <tr style={{ cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
        <td><span className="mono" style={{ fontWeight:700, color:'var(--blue)', fontSize:'0.83rem' }}>{order.order_number}</span></td>
        <td>
          <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{order.customer_name||'—'}</div>
          <div style={{ fontSize:'0.74rem', color:'var(--ink-4)', display:'flex', alignItems:'center', gap:3, marginTop:1 }}>
            <Phone size={10}/> {order.customer_phone||'—'}
          </div>
        </td>
        <td>
          <div style={{ fontSize:'0.83rem' }}>
            {order.order_type==='subscription'
              ? `${order.subscription_plan==='basic'?'Basic':'Standard'} Plan`
              : (order.service_items||[]).map(i=>`${i.service.replace('_',' ')} ×${i.count}`).join(', ')
            }
          </div>
          <div style={{ fontSize:'0.73rem', color:'var(--ink-4)' }}>{order.clothes_count} items</div>
        </td>
        <td>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'0.9rem' }}>Rs {order.amount}</div>
          <div style={{ fontSize:'0.73rem', color:'var(--ink-4)', marginTop:1 }}>{PAY_METHOD_LABEL[order.payment_method]||order.payment_method}</div>
        </td>
        <td>
          <span className={`badge ${BADGE[order.status]||'badge-pending'}`}>{STATUS_LABEL[order.status]||order.status}</span>
          {needsVerification && (
            <div style={{ marginTop:4, fontSize:'0.7rem', color:'#854d0e', fontWeight:600 }}>Needs review</div>
          )}
        </td>
        <td style={{ fontSize:'0.78rem', color:'var(--ink-4)' }}>{fmt(order.created_at)}</td>
        <td><ChevronDown size={15} style={{ color:'var(--ink-4)', transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}/></td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} style={{ background:'var(--bg)', padding:0 }}>
            <div style={{ padding:'1rem 1.3rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
              {/* Left: info */}
              <div>
                <h4 style={{ marginBottom:10, fontSize:'0.83rem' }}>Order Details</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:'0.82rem' }}>
                  {order.pickup_address && (
                    <div style={{ display:'flex', gap:6, alignItems:'flex-start', color:'var(--ink-2)' }}>
                      <MapPin size={13} style={{ marginTop:2, flexShrink:0, color:'var(--ink-4)' }}/>
                      {order.pickup_address}{order.pincode?` — ${order.pincode}`:''}
                    </div>
                  )}
                  {(order.pickup_date||order.pickup_time) && (
                    <div style={{ display:'flex', gap:6, color:'var(--ink-2)', alignItems:'center' }}>
                      <Calendar size={13} color="var(--ink-4)"/>
                      Pickup: {order.pickup_date} at {order.pickup_time}
                    </div>
                  )}
                  {order.upi_ref && (
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <CheckCircle size={13} color="var(--amber)"/>
                      <span>Txn Ref: </span><span className="mono" style={{ fontWeight:700, color:'var(--amber)' }}>{order.upi_ref}</span>
                    </div>
                  )}
                  {order.payment_method==='cash' && (
                    <div style={{ padding:'6px 10px', background:'var(--amber-light)', borderRadius:'var(--radius)', fontSize:'0.78rem', color:'var(--amber)', fontWeight:600 }}>
                      Cash on Pickup — collect when picking up clothes
                    </div>
                  )}
                  {order.notes && (
                    <div style={{ display:'flex', gap:6, color:'var(--ink-3)' }}>
                      <FileText size={13} style={{ marginTop:2, flexShrink:0 }}/> {order.notes}
                    </div>
                  )}
                </div>

                {/* Payment verification */}
                {needsVerification && order.upi_ref && (
                  <div style={{ marginTop:14, padding:'12px', background:'#fef9c3', borderRadius:'var(--radius)', border:'1px solid #fcd34d' }}>
                    <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#854d0e', marginBottom:8 }}>
                      Verify UPI Payment
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'#854d0e', marginBottom:10 }}>
                      Transaction Ref: <span className="mono" style={{ fontWeight:700 }}>{order.upi_ref}</span><br/>
                      Method: {PAY_METHOD_LABEL[order.payment_method]}
                    </div>
                    <input className="form-control" placeholder="Rejection reason (if rejecting)"
                      value={note} onChange={e=>setNote(e.target.value)}
                      style={{ marginBottom:8, fontSize:'0.82rem', height:36 }}/>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-success btn-sm" onClick={()=>handleVerify(true)} disabled={verifying}
                        style={{ flex:1, gap:5 }}>
                        <ThumbsUp size={13}/> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleVerify(false)} disabled={verifying}
                        style={{ flex:1, gap:5 }}>
                        <ThumbsDown size={13}/> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Status history */}
                {order.status_history?.length > 0 && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>History</div>
                    {[...order.status_history].reverse().slice(0,5).map((h,i) => (
                      <div key={i} style={{ display:'flex', gap:8, fontSize:'0.76rem', color:'var(--ink-3)', marginBottom:3 }}>
                        <span className="mono" style={{ color:'var(--ink-4)', fontSize:'0.7rem', flexShrink:0 }}>
                          {new Date(h.time).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                        </span>
                        <span style={{ fontWeight:600, textTransform:'capitalize' }}>{STATUS_LABEL[h.status]||h.status}</span>
                        {h.note && <span style={{ color:'var(--ink-4)' }}>· {h.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: status update */}
              <div>
                <h4 style={{ marginBottom:10, fontSize:'0.83rem' }}>Update Status</h4>
                <select className="form-control" value={status} onChange={e=>setStatus(e.target.value)}
                  style={{ marginBottom:8, fontSize:'0.86rem' }}>
                  {STATUSES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                </select>
                <input className="form-control" placeholder="Optional note"
                  value={note} onChange={e=>setNote(e.target.value)}
                  style={{ marginBottom:8, fontSize:'0.84rem' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleStatus} disabled={saving}>
                    {saving ? 'Saving...' : 'Update Status'}
                  </button>
                  {success && <span style={{ color:'var(--green)', fontSize:'0.82rem', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                    <CheckCircle size={13}/> {success}
                  </span>}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPage() {
  const [orders,  setOrders]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [o,s] = await Promise.all([adminAllOrders(), adminStats()]);
      setOrders(o.data); setStats(s.data);
    } catch(e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setInterval(load, 20000); return ()=>clearInterval(t); }, []);

  const filtered = orders.filter(o => {
    const mf = filter==='all' || o.status===filter;
    const ms = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name||'').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone||'').includes(search);
    return mf && ms;
  });

  const reviewCount = orders.filter(o=>o.status==='payment_review').length;

  return (
    <div style={{ minHeight:'100vh' }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div style={{ padding:'0 16px 14px', borderBottom:'1px solid var(--line)', marginBottom:6 }}>
            <div style={{ fontWeight:800, fontSize:'0.92rem', letterSpacing:'-0.02em' }}>Admin Panel</div>
            <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', marginTop:1 }}>WashWave</div>
          </div>
          <button className="sidebar-link active">
            <LayoutDashboard size={15}/> Orders
            {reviewCount > 0 && (
              <span style={{ marginLeft:'auto', background:'var(--red)', color:'white', borderRadius:10, fontSize:'0.68rem', fontWeight:700, padding:'1px 7px' }}>
                {reviewCount}
              </span>
            )}
          </button>
          <div style={{ position:'absolute', bottom:16, left:0, right:0, padding:'0 16px' }}>
            <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', marginBottom:6 }}>Signed in as Admin</div>
            <button className="btn btn-outline btn-sm btn-full" onClick={()=>{logout();navigate('/login');}}>Sign Out</button>
          </div>
        </aside>

        <div className="admin-content">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.3rem', flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ marginBottom:3 }}>All Orders</h2>
              <p style={{ color:'var(--ink-3)', fontSize:'0.82rem' }}>Auto-refreshes every 20s · {reviewCount > 0 && <span style={{ color:'var(--red)', fontWeight:700 }}>{reviewCount} payment{reviewCount>1?'s':''} need verification</span>}</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14}/> Refresh</button>
          </div>

          <StatsRow stats={stats}/>

          <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
            <input className="form-control" placeholder="Search order, name, phone..."
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1, minWidth:180, height:38, fontSize:'0.84rem' }}/>
            <select className="form-control" value={filter} onChange={e=>setFilter(e.target.value)}
              style={{ width:'auto', height:38, fontSize:'0.84rem' }}>
              <option value="all">All Statuses</option>
              <option value="payment_review">Under Review</option>
              <option value="payment_pending">Payment Pending</option>
              {STATUSES.map(s=><option key={s.val} value={s.val}>{s.label}</option>)}
            </select>
          </div>

          {loading && <div className="spinner"/>}

          {!loading && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th><th>Customer</th><th>Services</th>
                    <th>Amount</th><th>Status</th><th>Placed At</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0 && (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'var(--ink-4)' }}>No orders found</td></tr>
                  )}
                  {filtered.map(o=><OrderRow key={o.id} order={o} onRefresh={load}/>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}