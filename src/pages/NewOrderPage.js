import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, createPaymentOrder, verifyAndSaveOrder, getMe } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, MapPin, Calendar, Clock, ChevronRight,
  CheckCircle, Plus, Minus, Hash, Smartphone, Banknote,
  Wallet, Star, Package, CreditCard, ArrowRight, AlertCircle
} from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const SERVICES = [
  { key: 'washing',      label: 'Washing',      price: 10, icon: '🧺', desc: 'Per clothing item' },
  { key: 'dry_cleaning', label: 'Dry Cleaning',  price: 30, icon: '✨', desc: 'Per clothing item' },
  { key: 'ironing',      label: 'Ironing',       price: 8,  icon: '👔', desc: 'Per clothing item' },
  { key: 'full_laundry', label: 'Full Laundry',  price: 25, icon: '🔄', desc: 'Wash + iron per item' },
];

const SUBSCRIPTION_PLANS = [
  { key: 'basic',    label: 'Basic',    price: 349, clothes: 10, popular: false },
  { key: 'standard', label: 'Standard', price: 649, clothes: 20, popular: true  },
];

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

const PAYMENT_METHODS = [
  { key: 'gpay',     label: 'Google Pay',  icon: '🟢', sub: 'Opens GPay app' },
  { key: 'phone_pay',label: 'PhonePe',     icon: '🟣', sub: 'Opens PhonePe app' },
  { key: 'upi',      label: 'Other UPI',   icon: '💳', sub: 'Any UPI app' },
  { key: 'cash',     label: 'Cash',        icon: '💵', sub: 'Pay on pickup' },
];

/* ─── Load Razorpay script ────────────────────────────────────────────────── */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ─── Step indicator ─────────────────────────────────────────────────────── */
function Steps({ current }) {
  const steps = ['Service', 'Schedule', 'Payment'];
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:'1.8rem' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{
              width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.72rem', fontWeight:800, transition:'all 0.2s',
              background: i < current ? 'var(--green)' : i === current ? 'var(--blue)' : 'var(--bg)',
              color:       i <= current ? 'white' : 'var(--ink-4)',
              border:      i > current ? '1.5px solid var(--line)' : 'none',
            }}>
              {i < current ? <CheckCircle size={13}/> : i + 1}
            </div>
            <span style={{ fontSize:'0.64rem', marginTop:3, color: i === current ? 'var(--blue)' : 'var(--ink-4)', fontWeight: i === current ? 700 : 400 }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex:1, height:1.5, background: i < current ? 'var(--green)' : 'var(--line)', margin:'0 4px', marginBottom:16 }}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Counter ─────────────────────────────────────────────────────────────── */
function Counter({ value, onChange, min = 0 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width:28, height:28, border:'1.5px solid var(--line)', borderRadius:7, background:'var(--bg)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-3)' }}>
        <Minus size={12}/>
      </button>
      <span className="mono" style={{ fontWeight:700, fontSize:'0.95rem', minWidth:20, textAlign:'center' }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        style={{ width:28, height:28, border:'1.5px solid var(--blue)', borderRadius:7, background:'var(--blue-light)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)' }}>
        <Plus size={12}/>
      </button>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function NewOrderPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  /* Step state */
  const [step, setStep]             = useState(0);

  /* Service selection */
  const [orderType, setOrderType]   = useState('ondemand'); // 'ondemand' | 'subscription'
  const [counts, setCounts]         = useState({});         // { washing: 2, ironing: 1, ... }
  const [subPlan, setSubPlan]       = useState('standard');

  /* Schedule */
  const [address, setAddress]       = useState('');
  const [pincode, setPincode]       = useState('');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [notes, setNotes]           = useState('');
  const [savedAddrs, setSavedAddrs] = useState([]);

  /* Payment */
  const [payMethod, setPayMethod]   = useState('gpay');

  /* UI */
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  /* ── Load saved addresses ── */
  useEffect(() => {
    getMe().then(r => setSavedAddrs(r.data.saved_addresses || [])).catch(() => {});
  }, []);

  /* ── Amount calc ── */
  const amount = orderType === 'subscription'
    ? (SUBSCRIPTION_PLANS.find(p => p.key === subPlan)?.price || 0)
    : SERVICES.reduce((s, sv) => s + sv.price * (counts[sv.key] || 0), 0);

  const serviceItems = SERVICES
    .filter(s => (counts[s.key] || 0) > 0)
    .map(s => ({ service: s.key, count: counts[s.key] }));

  const hasServices = orderType === 'subscription' || serviceItems.length > 0;

  /* ── Min date = today ── */
  const minDate = new Date().toISOString().split('T')[0];

  /* ── Build order payload ── */
  const orderPayload = useCallback(() => ({
    order_type:        orderType,
    subscription_plan: orderType === 'subscription' ? subPlan : undefined,
    service_items:     orderType === 'ondemand' ? serviceItems : undefined,
    notes,
    pickup_address:    address,
    pincode,
    pickup_date:       date,
    pickup_time:       time,
    payment_method:    payMethod,
  }), [orderType, subPlan, serviceItems, notes, address, pincode, date, time, payMethod]);

  /* ── RAZORPAY CHECKOUT ── */
  const openRazorpay = async () => {
    setLoading(true); setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load. Check your connection.');

      // Step 1: Get Razorpay order ID from backend
      const payload = orderPayload();
      const { data: rzpData } = await createPaymentOrder(payload);

      // Step 2: Configure & open checkout
      const options = {
        key:         rzpData.key_id,
        amount:      rzpData.amount * 100,
        currency:    'INR',
        name:        'WashWave',
        description: orderType === 'subscription'
          ? `${SUBSCRIPTION_PLANS.find(p=>p.key===subPlan)?.label} Plan`
          : `Laundry Order — ${serviceItems.length} service(s)`,
        image:       'https://washwavebackendv2.onrender.com/images/ww_logo.jpeg',
        order_id:    rzpData.razorpay_order_id,

        // Pre-fill customer details
        prefill: {
          name:    user?.name  || '',
          contact: user?.phone ? `+91${user.phone}` : '',
        },

        // Force UPI app intent based on chosen method
        method: payMethod === 'gpay'      ? { upi: { flow: 'intent', apps: ['google_pay'] } }
               : payMethod === 'phone_pay' ? { upi: { flow: 'intent', apps: ['phonepe'] } }
               : payMethod === 'upi'       ? { upi: true }
               : undefined,

        config: {
          display: {
            // Show only the relevant payment block
            blocks: {
              utib: {
                name: 'Pay via UPI',
                instruments: payMethod === 'gpay'
                  ? [{ method: 'upi', apps: ['google_pay'] }]
                  : payMethod === 'phone_pay'
                  ? [{ method: 'upi', apps: ['phonepe'] }]
                  : [{ method: 'upi' }],
              },
            },
            sequence: ['block.utib'],
            preferences: { show_default_blocks: payMethod === 'upi' },
          },
        },

        theme: { color: '#2563eb' },

        handler: async (response) => {
          // Step 3: Verify on backend and persist order
          try {
            const { data: order } = await verifyAndSaveOrder({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              order_data:          payload,
            });
            navigate('/dashboard', { state: { newOrder: order } });
          } catch (err) {
            setError('Payment received but order save failed. Contact support with payment ID: ' + response.razorpay_payment_id);
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment was cancelled. Please try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  /* ── Cash order (direct) ── */
  const placeCashOrder = async () => {
    setLoading(true); setError('');
    try {
      await createOrder({ ...orderPayload(), payment_method: 'cash' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Order failed');
      setLoading(false);
    }
  };

  /* ── Handle final submit ── */
  const handlePay = () => {
    if (payMethod === 'cash') placeCashOrder();
    else openRazorpay();
  };

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 0 — Choose Services
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep0 = () => (
    <div className="fade-up">
      {/* Order type toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.4rem', background:'var(--bg)', padding:4, borderRadius:'var(--radius)', border:'1px solid var(--line)' }}>
        {[['ondemand','On-Demand'],['subscription','Subscription']].map(([v,l]) => (
          <button key={v} type="button" onClick={() => setOrderType(v)}
            style={{ flex:1, padding:'9px 0', borderRadius:8, border:'none', fontFamily:'inherit', fontWeight:700, fontSize:'0.83rem', cursor:'pointer', transition:'all 0.18s',
              background: orderType===v ? 'white' : 'transparent',
              color: orderType===v ? 'var(--blue)' : 'var(--ink-4)',
              boxShadow: orderType===v ? 'var(--shadow-sm)' : 'none' }}>
            {l}
          </button>
        ))}
      </div>

      {orderType === 'ondemand' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
          {SERVICES.map(svc => (
            <div key={svc.key} className="card" style={{ padding:'0.85rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                <span style={{ fontSize:'1.3rem' }}>{svc.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{svc.label}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--ink-4)' }}>Rs {svc.price} · {svc.desc}</div>
                </div>
              </div>
              <Counter value={counts[svc.key] || 0} onChange={v => setCounts(p => ({ ...p, [svc.key]: v }))}/>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
          {SUBSCRIPTION_PLANS.map(plan => (
            <div key={plan.key} onClick={() => setSubPlan(plan.key)}
              className="card" style={{ padding:'1rem', cursor:'pointer', border: subPlan===plan.key ? '2px solid var(--blue)' : '1.5px solid var(--line)', position:'relative', transition:'all 0.15s' }}>
              {plan.popular && (
                <span style={{ position:'absolute', top:10, right:10, background:'var(--blue)', color:'white', fontSize:'0.62rem', fontWeight:700, padding:'2px 8px', borderRadius:20, textTransform:'uppercase' }}>
                  Popular
                </span>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                {subPlan===plan.key && <CheckCircle size={15} color="var(--blue)"/>}
                <span style={{ fontWeight:800, fontSize:'0.95rem' }}>{plan.label}</span>
              </div>
              <div style={{ color:'var(--ink-3)', fontSize:'0.82rem', marginBottom:6 }}>
                Up to <strong>{plan.clothes} clothes</strong> per pickup
              </div>
              <div className="mono" style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--blue)' }}>
                Rs {plan.price}
                <span style={{ fontSize:'0.72rem', fontWeight:400, color:'var(--ink-4)' }}> / pickup</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Amount summary */}
      {amount > 0 && (
        <div style={{ marginTop:'1.2rem', padding:'0.85rem 1rem', background:'var(--blue-light)', borderRadius:'var(--radius)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'var(--blue)', fontWeight:600, fontSize:'0.88rem' }}>Estimated Total</span>
          <span className="mono" style={{ fontWeight:800, fontSize:'1.05rem', color:'var(--blue)' }}>Rs {amount}</span>
        </div>
      )}

      <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:'1.2rem' }}
        disabled={!hasServices} onClick={() => setStep(1)}>
        Continue <ChevronRight size={16}/>
      </button>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 1 — Schedule & Address
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="fade-up">
      {/* Saved addresses */}
      {savedAddrs.length > 0 && (
        <div style={{ marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:7, fontWeight:700 }}>
            Saved Addresses
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {savedAddrs.map((sa, i) => (
              <button key={i} type="button"
                onClick={() => { setAddress(sa.address); setPincode(sa.pincode); }}
                style={{ padding:'8px 12px', borderRadius:'var(--radius)', border: address===sa.address && pincode===sa.pincode ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                  background: address===sa.address && pincode===sa.pincode ? 'var(--blue-light)' : 'var(--bg)',
                  cursor:'pointer', textAlign:'left', fontSize:'0.82rem', color:'var(--ink-2)', transition:'all 0.15s', display:'flex', alignItems:'center', gap:7 }}>
                <MapPin size={13} color={address===sa.address && pincode===sa.pincode ? 'var(--blue)' : 'var(--ink-4)'}/>
                <span>{sa.address}</span>
                <span style={{ color:'var(--ink-4)' }}>· {sa.pincode}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label"><MapPin size={12}/> Pickup Address</label>
        <input className="form-control" placeholder="Full address" value={address} onChange={e=>setAddress(e.target.value)} required/>
      </div>

      <div className="form-group">
        <label className="form-label"><Hash size={12}/> Pincode</label>
        <input className="form-control" placeholder="560001" maxLength={6} value={pincode}
          onChange={e=>setPincode(e.target.value.replace(/\D/g,''))} required/>
      </div>

      <div className="form-group">
        <label className="form-label"><Calendar size={12}/> Pickup Date</label>
        <input className="form-control" type="date" min={minDate} value={date} onChange={e=>setDate(e.target.value)} required/>
      </div>

      <div className="form-group">
        <label className="form-label"><Clock size={12}/> Pickup Time</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {TIME_SLOTS.map(t => (
            <button key={t} type="button" onClick={() => setTime(t)}
              style={{ padding:'6px 12px', borderRadius:8, border: time===t ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                background: time===t ? 'var(--blue-light)' : 'var(--bg)',
                color: time===t ? 'var(--blue)' : 'var(--ink-3)',
                fontSize:'0.78rem', fontWeight: time===t ? 700 : 400, cursor:'pointer', transition:'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes <span style={{ fontWeight:400, color:'var(--ink-4)' }}>(optional)</span></label>
        <textarea className="form-control" rows={2} placeholder="Any special instructions..." value={notes} onChange={e=>setNotes(e.target.value)} style={{ resize:'none' }}/>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setStep(0)}>Back</button>
        <button className="btn btn-primary" style={{ flex:2 }}
          disabled={!address || !pincode || !date || !time} onClick={() => setStep(2)}>
          Continue <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 2 — Payment
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep2 = () => (
    <div className="fade-up">
      {/* Order summary */}
      <div className="card" style={{ padding:'0.9rem 1rem', marginBottom:'1.2rem', background:'var(--blue-light)', border:'1.5px solid var(--blue)' }}>
        <div style={{ fontSize:'0.68rem', color:'var(--blue)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700, marginBottom:8 }}>
          Order Summary
        </div>
        {orderType === 'subscription' ? (
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:'0.84rem', color:'var(--ink-2)' }}>
              {SUBSCRIPTION_PLANS.find(p=>p.key===subPlan)?.label} Plan
            </span>
            <span className="mono" style={{ fontWeight:700 }}>Rs {amount}</span>
          </div>
        ) : (
          serviceItems.map(si => {
            const svc = SERVICES.find(s=>s.key===si.service);
            return (
              <div key={si.service} style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:'0.82rem', color:'var(--ink-2)' }}>{svc?.label} × {si.count}</span>
                <span className="mono" style={{ fontSize:'0.82rem' }}>Rs {svc.price * si.count}</span>
              </div>
            );
          })
        )}
        <div style={{ borderTop:'1px solid var(--blue)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontWeight:700, color:'var(--blue)' }}>Total</span>
          <span className="mono" style={{ fontWeight:800, fontSize:'1.05rem', color:'var(--blue)' }}>Rs {amount}</span>
        </div>
        <div style={{ marginTop:8, fontSize:'0.75rem', color:'var(--ink-3)', display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <MapPin size={11}/> {address}, {pincode}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Calendar size={11}/> {date} · {time}
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      <div style={{ marginBottom:'1.2rem' }}>
        <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700, marginBottom:10 }}>
          Choose Payment Method
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {PAYMENT_METHODS.map(pm => (
            <button key={pm.key} type="button" onClick={() => setPayMethod(pm.key)}
              style={{ padding:'0.85rem 1rem', borderRadius:'var(--radius)', border: payMethod===pm.key ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                background: payMethod===pm.key ? 'var(--blue-light)' : 'white',
                cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all 0.15s' }}>
              <span style={{ fontSize:'1.4rem' }}>{pm.icon}</span>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:'0.88rem', color: payMethod===pm.key ? 'var(--blue)' : 'var(--ink)' }}>{pm.label}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--ink-4)' }}>{pm.sub}</div>
              </div>
              {payMethod===pm.key && <CheckCircle size={16} color="var(--blue)"/>}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner for UPI methods */}
      {payMethod !== 'cash' && (
        <div style={{ padding:'10px 12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'var(--radius)', marginBottom:'1rem', display:'flex', gap:8, alignItems:'flex-start' }}>
          <CheckCircle size={14} color="#16a34a" style={{ flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:'0.78rem', color:'#15803d', margin:0, lineHeight:1.5 }}>
            After clicking <strong>Pay Now</strong>, the{' '}
            <strong>{PAYMENT_METHODS.find(p=>p.key===payMethod)?.label}</strong> app will open automatically with the amount pre-filled. Complete the payment there — your order will be confirmed instantly.
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom:'0.9rem', display:'flex', gap:8, alignItems:'flex-start' }}>
          <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }}/>
          <span style={{ fontSize:'0.82rem' }}>{error}</span>
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-outline" style={{ flex:1 }} onClick={() => { setError(''); setStep(1); }}>
          Back
        </button>
        <button className="btn btn-primary" style={{ flex:2 }} disabled={loading} onClick={handlePay}>
          {loading ? (
            <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Processing…</>
          ) : payMethod === 'cash' ? (
            <><Banknote size={16}/> Place Order</>
          ) : (
            <><span style={{ fontSize:'1rem' }}>{PAYMENT_METHODS.find(p=>p.key===payMethod)?.icon}</span>
              Pay Rs {amount} <ArrowRight size={15}/></>
          )}
        </button>
      </div>

      <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--ink-4)', marginTop:12 }}>
        🔒 Payments are secured by Razorpay
      </p>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="page">
      <div style={{ maxWidth:520, margin:'0 auto' }}>
        <div className="fade-up" style={{ marginBottom:'1.4rem' }}>
          <h1 style={{ marginBottom:4 }}>New Order</h1>
          <p style={{ color:'var(--ink-3)', fontSize:'0.86rem' }}>Schedule a laundry pickup</p>
        </div>

        <Steps current={step}/>

        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
}