import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, razorpayCreate, razorpayVerify } from '../utils/api';
import {
  Shirt, Wind, Flame, Package, Plus, Minus,
  MapPin, Hash, FileText, CheckCircle, ArrowRight,
  AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight, Star
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'washing',      label: 'Washing',      rate: 10, Icon: Shirt,   desc: 'Regular wash & rinse' },
  { id: 'dry_cleaning', label: 'Dry Cleaning', rate: 30, Icon: Wind,    desc: 'Chemical dry clean' },
  { id: 'ironing',      label: 'Ironing',      rate: 8,  Icon: Flame,   desc: 'Press & fold' },
  { id: 'full_laundry', label: 'Full Laundry', rate: 25, Icon: Package, desc: 'Wash + dry + fold' },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic', label: 'Basic Plan', clothes: 10, price: 349,
    badge: null,
    features: ['10 clothes per order', 'All services included', 'Doorstep pickup & delivery'],
  },
  {
    id: 'standard', label: 'Standard Plan', clothes: 20, price: 649,
    badge: 'Best Value',
    features: ['20 clothes per order', 'All services included', 'Priority pickup', 'Doorstep pickup & delivery'],
  },
];

const TIME_SLOTS = [
  '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Load Razorpay ─────────────────────────────────────────────────────────────
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Order Details', 'Payment', 'Confirmed'];
  return (
    <div className="steps fade-up">
      {steps.map((s, i) => (
        <div key={i} className="step-item" style={{ flex: i < steps.length - 1 ? 1 : 0 }}>
          <div className={`step-dot ${i < step ? 'step-dot-done' : i === step ? 'step-dot-active' : 'step-dot-future'}`}>
            {i < step ? <CheckCircle size={13} /> : i + 1}
          </div>
          <span className={`step-label ${i === step ? 'step-label-active' : 'step-label-future'}`}>{s}</span>
          {i < steps.length - 1 && <div className={`step-line ${i < step ? 'step-line-done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Service row ───────────────────────────────────────────────────────────────
function ServiceRow({ svc, count, onToggle, onCount }) {
  const selected = count > 0;
  const { Icon } = svc;
  return (
    <div className={`service-row ${selected ? 'selected' : ''}`}
      onClick={() => !selected && onToggle()}>
      <div className="service-row-check"
        onClick={e => { e.stopPropagation(); onToggle(); }}>
        {selected && <CheckCircle size={13} color="white" />}
      </div>
      <div style={{ color: selected ? 'var(--blue)' : 'var(--ink-4)', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div className="service-row-info">
        <div className="service-row-name">{svc.label}</div>
        <div className="service-row-desc">{svc.desc}</div>
      </div>
      <div className="service-row-rate">Rs {svc.rate}/cloth</div>
      {selected && (
        <div className="service-row-counter" onClick={e => e.stopPropagation()}>
          <button className="counter-btn"
            onClick={() => onCount(Math.max(1, count - 1))} disabled={count <= 1}>
            <Minus size={13} />
          </button>
          <span className="counter-val">{count}</span>
          <button className="counter-btn" onClick={() => onCount(count + 1)}>
            <Plus size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Amount breakdown ──────────────────────────────────────────────────────────
function AmountSummary({ serviceCounts }) {
  const rows = SERVICES
    .filter(s => serviceCounts[s.id] > 0)
    .map(s => ({ label: s.label, count: serviceCounts[s.id], subtotal: s.rate * serviceCounts[s.id] }));
  const total = rows.reduce((a, r) => a + r.subtotal, 0);
  if (!rows.length) return null;
  return (
    <div className="amount-summary fade-up">
      {rows.map(r => (
        <div key={r.label} className="amount-row">
          <span>{r.label} × {r.count} cloths</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>Rs {r.subtotal}</span>
        </div>
      ))}
      <div className="amount-total">
        <span className="amount-total-label">Total Amount</span>
        <span className="amount-total-val">Rs {total}</span>
      </div>
    </div>
  );
}

// ── Calendar date picker ──────────────────────────────────────────────────────
function DatePicker({ label, value, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewDate, setViewDate] = useState(() => new Date(today));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = (day) => {
    const selected = new Date(year, month, day);
    if (selected < today) return;
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(iso);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return iso === value;
  };

  const isPast = (day) => new Date(year, month, day) < today;

  const formatDisplay = (iso) => {
    if (!iso) return '';
    const [y,m,d] = iso.split('-');
    return `${d} ${MONTHS[parseInt(m)-1]} ${y}`;
  };

  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={13} /> {label}
      </label>
      {value && (
        <div style={{ marginBottom: 8, padding: '6px 12px', background: 'var(--blue-light)', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--blue)', display: 'inline-block' }}>
          {formatDisplay(value)}
        </div>
      )}
      <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'white' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
          <button type="button" onClick={prevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 4, borderRadius: 6 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{MONTHS[month]} {year}</span>
          <button type="button" onClick={nextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 4, borderRadius: 6 }}>
            <ChevronRight size={16} />
          </button>
        </div>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '6px 8px 2px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-4)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 8px 10px', gap: 2 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <button key={day} type="button" onClick={() => selectDay(day)}
              disabled={isPast(day)}
              style={{
                width: '100%', aspectRatio: '1', border: 'none', borderRadius: 'var(--radius)',
                cursor: isPast(day) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                background: isSelected(day) ? 'var(--blue)' : 'transparent',
                color: isSelected(day) ? 'white' : isPast(day) ? 'var(--ink-4)' : 'var(--ink)',
                opacity: isPast(day) ? 0.35 : 1,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!isPast(day) && !isSelected(day)) e.target.style.background = 'var(--blue-light)'; }}
              onMouseLeave={e => { if (!isSelected(day)) e.target.style.background = 'transparent'; }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Time picker ───────────────────────────────────────────────────────────────
function TimePicker({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={13} /> {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {TIME_SLOTS.map(slot => (
          <button key={slot} type="button" onClick={() => onChange(slot)}
            style={{
              padding: '7px 13px', borderRadius: 'var(--radius)',
              border: `1.5px solid ${value === slot ? 'var(--blue)' : 'var(--line)'}`,
              background: value === slot ? 'var(--blue)' : 'white',
              color: value === slot ? 'white' : 'var(--ink-3)',
              fontSize: '0.8rem', fontWeight: value === slot ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
            }}>
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Razorpay payment screen ───────────────────────────────────────────────────
function RazorpayScreen({ order, onSuccess, setErr }) {
  const [loading, setLoading] = useState(false);

  const openRazorpay = async (preferredApp) => {
    setLoading(true); setErr('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load payment SDK. Check your internet connection.');

      const res = await razorpayCreate(order.id);
      const { razorpay_order_id, amount, currency, key_id } = res.data;

      // Build config — pass preferred UPI app so Razorpay opens it directly
      const config = {
        key:         key_id,
        amount:      amount,
        currency:    currency,
        name:        'WashWave',
        description: `Order ${order.order_number}`,
        order_id:    razorpay_order_id,
        theme:       { color: '#1055c8', hide_topbar: false },
        // Lock to UPI method with specific app when GPay/PhonePe clicked
        ...(preferredApp !== 'all' && {
          method: {
            upi:          true,
            card:         false,
            netbanking:   false,
            wallet:       false,
            emi:          false,
          }
        }),
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay using UPI',
                instruments: preferredApp === 'gpay'
                  ? [{ method: 'upi', apps: ['google_pay'] }]
                  : preferredApp === 'phonepe'
                  ? [{ method: 'upi', apps: ['phonepe'] }]
                  : [{ method: 'upi' }],
              },
            },
            sequence: ['block.utib'],
            preferences: { show_default_blocks: preferredApp === 'all' },
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await razorpayVerify({
              order_id:            order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
            });
            onSuccess(verifyRes.data);
          } catch(e) {
            setErr('Payment received but verification failed. Please contact support with ID: ' + response.razorpay_payment_id);
          } finally { setLoading(false); }
        },
        modal: {
          ondismiss: () => setLoading(false),
          animation: true,
        },
      };

      const rzp = new window.Razorpay(config);
      rzp.on('payment.failed', r => {
        setErr('Payment failed: ' + (r.error?.description || 'Please try again'));
        setLoading(false);
      });
      rzp.open();
    } catch(e) {
      setErr(e.message || 'Could not open payment');
      setLoading(false);
    }
  };

  const payOptions = [
    {
      id: 'gpay',
      label: 'Google Pay',
      sublabel: 'Opens Google Pay directly',
      color: '#1a73e8',
      bg: '#e8f0fe',
      border: '#93c5fd',
      logo: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/>
          <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"/>
          <path d="M10.53 28.59c-.48-1.37-.76-2.83-.76-4.59s.27-3.22.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"/>
          <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/>
        </svg>
      ),
    },
    {
      id: 'phonepe',
      label: 'PhonePe',
      sublabel: 'Opens PhonePe directly',
      color: '#5f259f',
      bg: '#f3e8ff',
      border: '#c4b5fd',
      logo: (
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#5f259f"/>
          <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 5c4.08 0 7.72 1.88 10.12 4.82L14.82 34.12C12.88 31.72 12 28.08 12 24c0-6.63 5.37-11 12-11zm0 22c-4.08 0-7.72-1.88-10.12-4.82l19.3-16.3C35.12 16.28 36 19.92 36 24c0 6.63-5.37 11-12 11z" fill="white"/>
        </svg>
      ),
    },
    {
      id: 'all',
      label: 'More Options',
      sublabel: 'UPI · Cards · Net Banking',
      color: '#047857',
      bg: '#d1fae5',
      border: '#6ee7b7',
      logo: (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Amount display */}
      <div className="pay-box" style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.65, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Amount to pay
        </div>
        <div className="pay-amount">Rs {order.amount}</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: 6 }}>
          Order {order.order_number}
        </div>
      </div>

      {/* Payment method buttons */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <h4>Choose Payment Method</h4>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => openRazorpay(opt.id)}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 'var(--radius)',
                border: `1.5px solid ${opt.border}`,
                background: opt.bg, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
                opacity: loading ? 0.6 : 1,
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ flexShrink: 0 }}>{opt.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: opt.color }}>{opt.label}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--ink-4)', marginTop: 1 }}>{opt.sublabel}</div>
              </div>
              <ArrowRight size={16} color={opt.color} />
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '8px', color: 'var(--ink-3)', fontSize: '0.85rem' }}>
          Opening payment... please wait
        </div>
      )}

      <div className="alert alert-info">
        <AlertCircle size={14} />
        <span>After payment is complete, your order will be automatically confirmed. No manual entry needed.</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewOrderPage() {
  const [step, setStep]           = useState(0);
  const [orderMode, setOrderMode] = useState('ondemand');
  const [subPlan, setSubPlan]     = useState('');
  const [serviceCounts, setSC]    = useState({ washing:0, dry_cleaning:0, ironing:0, full_laundry:0 });
  const [address, setAddress]     = useState('');
  const [pincode, setPincode]     = useState('');
  const [notes, setNotes]         = useState('');
  const [pickupDate, setPickupDate]       = useState('');
  const [pickupTime, setPickupTime]       = useState('');
  const [deliveryDate, setDeliveryDate]   = useState('');
  const [deliveryTime, setDeliveryTime]   = useState('');
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const navigate = useNavigate();

  const hasServices = Object.values(serviceCounts).some(v => v > 0);
  const toggleService = id => setSC(p => ({ ...p, [id]: p[id] > 0 ? 0 : 1 }));
  const setCount = (id, val) => setSC(p => ({ ...p, [id]: Math.max(1, val) }));

  const handlePlaceOrder = async () => {
    if (orderMode === 'ondemand' && !hasServices) return setErr('Select at least one service');
    if (orderMode === 'subscription' && !subPlan)  return setErr('Select a subscription plan');
    if (!address.trim())      return setErr('Enter pickup address');
    if (!pincode.trim() || pincode.length !== 6) return setErr('Enter a valid 6-digit pincode');
    if (!pickupDate)          return setErr('Select a pickup date');
    if (!pickupTime)          return setErr('Select a pickup time');
    if (!deliveryDate)        return setErr('Select a delivery date');
    if (!deliveryTime)        return setErr('Select a delivery time');

    setLoading(true); setErr('');
    try {
      const payload = {
        order_type:     orderMode,
        notes,
        pickup_address: address,
        pincode,
        pickup_date:    pickupDate,
        pickup_time:    pickupTime,
        delivery_date:  deliveryDate,
        delivery_time:  deliveryTime,
      };
      if (orderMode === 'subscription') {
        payload.subscription_plan = subPlan;
        payload.service_items = [];
      } else {
        payload.service_items = SERVICES
          .filter(s => serviceCounts[s.id] > 0)
          .map(s => ({ service: s.id, count: serviceCounts[s.id] }));
      }
      const res = await createOrder(payload);
      setOrder(res.data);
      setStep(1);
    } catch(e) {
      setErr(e.response?.data?.detail || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const formatDate = iso => {
    if (!iso) return '';
    const [y,m,d] = iso.split('-');
    return `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} ${y}`;
  };

  return (
    <div className="page page-sm" style={{ paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: 6 }} className="fade-up">New Order</h1>
      <p style={{ color:'var(--ink-3)', marginBottom:'1.6rem', fontSize:'0.9rem' }} className="fade-up fade-up-1">
        Book a laundry pickup from your door
      </p>
      <StepBar step={step} />

      {/* ── STEP 0 ───────────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="fade-up fade-up-2">
          {err && <div className="alert alert-error"><AlertCircle size={15}/><span>{err}</span></div>}

          {/* Mode toggle */}
          <div style={{ display:'flex', background:'var(--line-2)', padding:4, borderRadius:'var(--radius)', marginBottom:'1rem', border:'1px solid var(--line)' }}>
            {[{id:'ondemand',label:'On-Demand Order'},{id:'subscription',label:'Subscription Plan'}].map(m => (
              <button key={m.id} onClick={() => { setOrderMode(m.id); setErr(''); }}
                style={{ flex:1, padding:'9px', borderRadius:8, border:'none', fontFamily:'inherit',
                  fontWeight:700, fontSize:'0.88rem', cursor:'pointer', transition:'all 0.15s',
                  background: orderMode===m.id ? 'white' : 'transparent',
                  color: orderMode===m.id ? 'var(--blue)' : 'var(--ink-4)',
                  boxShadow: orderMode===m.id ? 'var(--shadow-sm)' : 'none' }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* On-demand services */}
          {orderMode === 'ondemand' && (
            <div className="card" style={{ marginBottom:'1rem' }}>
              <div className="card-header"><h4>Select Services & Cloth Count</h4></div>
              <div className="card-body">
                {SERVICES.map(s => (
                  <ServiceRow key={s.id} svc={s} count={serviceCounts[s.id]}
                    onToggle={() => toggleService(s.id)}
                    onCount={val => setCount(s.id, val)} />
                ))}
                {hasServices && <AmountSummary serviceCounts={serviceCounts} />}
              </div>
            </div>
          )}

          {/* Subscription plans */}
          {orderMode === 'subscription' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1rem' }}>
              {SUBSCRIPTION_PLANS.map(plan => (
                <div key={plan.id} onClick={() => setSubPlan(plan.id)}
                  style={{ border:`2px solid ${subPlan===plan.id ? 'var(--blue)' : 'var(--line)'}`,
                    borderRadius:'var(--radius)', padding:'1.2rem',
                    background: subPlan===plan.id ? 'var(--blue-light)' : 'white',
                    cursor:'pointer', transition:'all 0.15s', position:'relative' }}>
                  {plan.badge && (
                    <div style={{ position:'absolute', top:-10, right:12, background:'var(--blue)', color:'white', fontSize:'0.68rem', fontWeight:700, padding:'2px 10px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                      <Star size={10}/> {plan.badge}
                    </div>
                  )}
                  <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:4, color: subPlan===plan.id ? 'var(--blue)' : 'var(--ink)' }}>
                    {plan.label}
                  </div>
                  <div style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.5rem', color: subPlan===plan.id ? 'var(--blue)' : 'var(--ink)', marginBottom:2 }}>
                    Rs {plan.price}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--ink-4)', marginBottom:10 }}>
                    {plan.clothes} clothes
                  </div>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'var(--ink-3)', marginBottom:4 }}>
                      <CheckCircle size={11} color="var(--green)"/> {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Pickup date & time */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header">
              <h4 style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Calendar size={16}/> Pickup Schedule
              </h4>
            </div>
            <div className="card-body">
              <DatePicker label="Pickup Date" value={pickupDate} onChange={setPickupDate} />
              {pickupDate && <TimePicker label="Pickup Time" value={pickupTime} onChange={setPickupTime} />}
            </div>
          </div>

          {/* Delivery date & time */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header">
              <h4 style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Clock size={16}/> Delivery Schedule
              </h4>
            </div>
            <div className="card-body">
              <DatePicker label="Delivery Date" value={deliveryDate} onChange={setDeliveryDate} />
              {deliveryDate && <TimePicker label="Delivery Time" value={deliveryTime} onChange={setDeliveryTime} />}
            </div>
          </div>

          {/* Pickup address */}
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <div className="card-header"><h4>Pickup Details</h4></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Pickup Address</label>
                <div style={{ position:'relative' }}>
                  <textarea className="form-control" placeholder="House number, street, area..."
                    value={address} onChange={e => setAddress(e.target.value)}
                    rows={2} style={{ paddingLeft:40 }} />
                  <MapPin size={15} style={{ position:'absolute', left:13, top:13, color:'var(--ink-4)' }}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <div style={{ position:'relative' }}>
                  <input className="form-control" placeholder="560001" maxLength={6}
                    value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,''))}
                    style={{ paddingLeft:40 }} />
                  <Hash size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">
                  Special Instructions
                  <span style={{ fontWeight:400, textTransform:'none', marginLeft:4, color:'var(--ink-4)' }}>(optional)</span>
                </label>
                <div style={{ position:'relative' }}>
                  <textarea className="form-control" placeholder="e.g. Handle delicates with care..."
                    value={notes} onChange={e => setNotes(e.target.value)}
                    rows={2} style={{ paddingLeft:40 }} />
                  <FileText size={15} style={{ position:'absolute', left:13, top:13, color:'var(--ink-4)' }}/>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handlePlaceOrder}
            disabled={loading || (orderMode==='ondemand' && !hasServices) || (orderMode==='subscription' && !subPlan)}>
            {loading ? 'Placing order...' : <><span>Continue to Payment</span><ArrowRight size={17}/></>}
          </button>
        </div>
      )}

      {/* ── STEP 1: Payment ──────────────────────────────────────────────── */}
      {step === 1 && order && (
        <div className="fade-up fade-up-2">
          {/* Order summary */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header">
              <h4>Order Summary</h4>
              <span className="mono" style={{ fontSize:'0.8rem', color:'var(--ink-3)' }}>{order.order_number}</span>
            </div>
            <div className="card-body">
              {order.order_type === 'subscription' ? (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', marginBottom:8 }}>
                  <span style={{ color:'var(--ink-3)' }}>
                    {SUBSCRIPTION_PLANS.find(p=>p.id===order.subscription_plan)?.label} — {order.clothes_count} clothes
                  </span>
                  <span style={{ fontWeight:700 }}>Rs {order.amount}</span>
                </div>
              ) : (order.service_items||[]).map((item,i) => {
                const svc = SERVICES.find(s=>s.id===item.service);
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', marginBottom:8 }}>
                    <span style={{ color:'var(--ink-3)' }}>{svc?.label} × {item.count} cloths</span>
                    <span style={{ fontWeight:600 }}>Rs {(svc?.rate||10)*item.count}</span>
                  </div>
                );
              })}
              <div className="divider" style={{ margin:'10px 0' }}/>
              {/* Schedule */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div style={{ padding:'8px 10px', background:'var(--bg)', borderRadius:'var(--radius)', border:'1px solid var(--line)' }}>
                  <div style={{ fontSize:'0.68rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Pickup</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:700 }}>{formatDate(order.pickup_date)}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--blue)', fontWeight:600 }}>{order.pickup_time}</div>
                </div>
                <div style={{ padding:'8px 10px', background:'var(--bg)', borderRadius:'var(--radius)', border:'1px solid var(--line)' }}>
                  <div style={{ fontSize:'0.68rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Delivery</div>
                  <div style={{ fontSize:'0.82rem', fontWeight:700 }}>{formatDate(order.delivery_date)}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600 }}>{order.delivery_time}</div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.3rem', color:'var(--blue)' }}>
                  Rs {order.amount}
                </span>
              </div>
            </div>
          </div>

          {err && <div className="alert alert-error" style={{ marginBottom:12 }}><AlertCircle size={14}/><span>{err}</span></div>}

          <RazorpayScreen order={order} onSuccess={confirmed => { setOrder(confirmed); setStep(2); }} setErr={setErr} />
        </div>
      )}

      {/* ── STEP 2: Confirmed ────────────────────────────────────────────── */}
      {step === 2 && order && (
        <div className="fade-up fade-up-2">
          <div className="card" style={{ textAlign:'center', padding:'3rem 2rem', marginBottom:'1rem' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem' }}>
              <CheckCircle size={32} color="var(--green)"/>
            </div>
            <h2 style={{ marginBottom:8 }}>Order Confirmed!</h2>
            <p style={{ color:'var(--ink-3)', marginBottom:'1.5rem' }}>
              Payment received. Our team will be there at your scheduled time.
            </p>
            <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'14px 24px', display:'inline-block', border:'1px solid var(--line)', marginBottom:20 }}>
              <p style={{ fontSize:'0.72rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Order Number</p>
              <p className="mono" style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--blue)', letterSpacing:'0.04em' }}>
                {order.order_number}
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:300, margin:'0 auto' }}>
              <div style={{ padding:'10px', background:'var(--blue-light)', borderRadius:'var(--radius)' }}>
                <div style={{ fontSize:'0.68rem', color:'var(--blue)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Pickup</div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink)' }}>{formatDate(order.pickup_date)}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--blue)', fontWeight:600 }}>{order.pickup_time}</div>
              </div>
              <div style={{ padding:'10px', background:'var(--green-light)', borderRadius:'var(--radius)' }}>
                <div style={{ fontSize:'0.68rem', color:'var(--green)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Delivery</div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink)' }}>{formatDate(order.delivery_date)}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600 }}>{order.delivery_time}</div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline" style={{ flex:1 }} onClick={() => navigate('/dashboard')}>
              View All Orders
            </button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={() => navigate(`/track?order=${order.order_number}`)}>
              Track Order <ArrowRight size={15}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}