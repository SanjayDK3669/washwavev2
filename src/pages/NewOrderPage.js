import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, razorpayCreate, razorpayVerify } from '../utils/api';
import {
  Shirt, Wind, Flame, Package, Plus, Minus,
  MapPin, Hash, FileText, CheckCircle, ArrowRight,
  AlertCircle, CreditCard
} from 'lucide-react';

const SERVICES = [
  { id: 'washing',      label: 'Washing',      rate: 10, icon: Shirt,   desc: 'Regular wash & rinse' },
  { id: 'dry_cleaning', label: 'Dry Cleaning', rate: 30, icon: Wind,    desc: 'Chemical dry clean' },
  { id: 'ironing',      label: 'Ironing',      rate: 8,  icon: Flame,   desc: 'Press & fold' },
  { id: 'full_laundry', label: 'Full Laundry', rate: 25, icon: Package, desc: 'Wash + dry + fold' },
];

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

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

function ServiceRow({ svc, count, onToggle, onCount }) {
  const selected = count > 0;
  const Icon = svc.icon;
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
            onClick={() => onCount(Math.max(1, count - 1))}
            disabled={count <= 1}>
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

function AmountSummary({ serviceCounts }) {
  const rows = SERVICES
    .filter(s => serviceCounts[s.id] > 0)
    .map(s => ({
      label:    s.label,
      count:    serviceCounts[s.id],
      rate:     s.rate,
      subtotal: s.rate * serviceCounts[s.id],
    }));
  const total = rows.reduce((a, r) => a + r.subtotal, 0);
  if (rows.length === 0) return null;
  return (
    <div className="amount-summary fade-up">
      {rows.map(r => (
        <div key={r.label} className="amount-row">
          <span>{r.label} × {r.count} cloths</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
            Rs {r.subtotal}
          </span>
        </div>
      ))}
      <div className="amount-total">
        <span className="amount-total-label">Total Amount</span>
        <span className="amount-total-val">Rs {total}</span>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const [step, setStep]       = useState(0);
  const [serviceCounts, setSC] = useState({
    washing: 0, dry_cleaning: 0, ironing: 0, full_laundry: 0
  });
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes]     = useState('');
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const navigate = useNavigate();

  const hasServices = Object.values(serviceCounts).some(v => v > 0);

  const toggleService = id => setSC(p => ({ ...p, [id]: p[id] > 0 ? 0 : 1 }));
  const setCount = (id, val) => setSC(p => ({ ...p, [id]: Math.max(1, val) }));

  const handlePlaceOrder = async () => {
    if (!hasServices)         return setErr('Select at least one service');
    if (!address.trim())      return setErr('Enter pickup address');
    if (!pincode.trim())      return setErr('Enter pincode');
    if (pincode.length !== 6) return setErr('Pincode must be 6 digits');
    setLoading(true); setErr('');
    try {
      const service_items = SERVICES
        .filter(s => serviceCounts[s.id] > 0)
        .map(s => ({ service: s.id, count: serviceCounts[s.id] }));
      const res = await createOrder({
        service_items, notes, pickup_address: address, pincode
      });
      setOrder(res.data);
      setStep(1);
    } catch(e) {
      setErr(e.response?.data?.detail || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const handlePayNow = async () => {
    setLoading(true); setErr('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Failed to load Razorpay SDK');

      const res = await razorpayCreate(order.id);
      const { razorpay_order_id, amount, currency, key_id } = res.data;

      const options = {
        key:         key_id,
        amount:      amount,
        currency:    currency,
        name:        'WashWave',
        description: `Order ${order.order_number}`,
        order_id:    razorpay_order_id,
        theme:       { color: '#1055c8' },
        handler: async (response) => {
          try {
            const verifyRes = await razorpayVerify({
              order_id:            order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
            });
            setOrder(verifyRes.data);
            setStep(2);
          } catch(e) {
            setErr('Payment verification failed. Contact support with payment ID: '
              + response.razorpay_payment_id);
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', r => {
        setErr('Payment failed: ' + (r.error?.description || 'Unknown error'));
        setLoading(false);
      });
      rzp.open();
    } catch(e) {
      setErr(e.message || 'Could not initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="page page-sm" style={{ paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: 6 }} className="fade-up">New Order</h1>
      <p style={{ color: 'var(--ink-3)', marginBottom: '1.6rem', fontSize: '0.9rem' }}
        className="fade-up fade-up-1">
        Book a laundry pickup from your door
      </p>
      <StepBar step={step} />

      {/* ── STEP 0: Order Details ── */}
      {step === 0 && (
        <div className="fade-up fade-up-2">
          {err && (
            <div className="alert alert-error">
              <AlertCircle size={15} /><span>{err}</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <h4>Select Services & Cloth Count</h4>
            </div>
            <div className="card-body">
              {SERVICES.map(s => (
                <ServiceRow
                  key={s.id}
                  svc={s}
                  count={serviceCounts[s.id]}
                  onToggle={() => toggleService(s.id)}
                  onCount={val => setCount(s.id, val)}
                />
              ))}
              {hasServices && <AmountSummary serviceCounts={serviceCounts} />}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header"><h4>Pickup Details</h4></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Pickup Address</label>
                <div style={{ position: 'relative' }}>
                  <textarea className="form-control"
                    placeholder="House number, street, area..."
                    value={address} onChange={e => setAddress(e.target.value)}
                    rows={2} style={{ paddingLeft: 40 }} />
                  <MapPin size={15} style={{ position: 'absolute', left: 13, top: 13, color: 'var(--ink-4)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-control" placeholder="560001" maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    style={{ paddingLeft: 40 }} />
                  <Hash size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Special Instructions
                  <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4, color: 'var(--ink-4)' }}>
                    (optional)
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea className="form-control"
                    placeholder="e.g. Handle delicates with care..."
                    value={notes} onChange={e => setNotes(e.target.value)}
                    rows={2} style={{ paddingLeft: 40 }} />
                  <FileText size={15} style={{ position: 'absolute', left: 13, top: 13, color: 'var(--ink-4)' }} />
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg"
            onClick={handlePlaceOrder}
            disabled={loading || !hasServices}>
            {loading
              ? 'Placing order...'
              : <><span>Continue to Payment</span><ArrowRight size={17} /></>}
          </button>
        </div>
      )}

      {/* ── STEP 1: Payment ── */}
      {step === 1 && order && (
        <div className="fade-up fade-up-2">
          {err && (
            <div className="alert alert-error">
              <AlertCircle size={15} /><span>{err}</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <h4>Order Summary</h4>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                {order.order_number}
              </span>
            </div>
            <div className="card-body">
              {(order.service_items || []).map((item, i) => {
                const svc = SERVICES.find(s => s.id === item.service);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--ink-3)' }}>
                      {svc?.label || item.service} × {item.count} cloths
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      Rs {(svc?.rate || 10) * item.count}
                    </span>
                  </div>
                );
              })}
              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '1.3rem', color: 'var(--blue)' }}>
                  Rs {order.amount}
                </span>
              </div>
            </div>
          </div>

          <div className="pay-box" style={{ marginBottom: '1rem' }}>
            <div className="pay-amount">Rs {order.amount}</div>
            <div className="pay-label">Secure payment powered by Razorpay</div>
            <button className="pay-btn" onClick={handlePayNow} disabled={loading}>
              <CreditCard size={20} />
              {loading ? 'Opening payment...' : 'Pay Now'}
            </button>
            <div style={{ marginTop: 14, fontSize: '0.78rem', opacity: 0.55 }}>
              GPay · PhonePe · UPI · Cards · Net Banking
            </div>
          </div>

          <div className="alert alert-info">
            <AlertCircle size={15} />
            <span>
              After payment, your order is confirmed automatically. No manual entry needed.
            </span>
          </div>
        </div>
      )}

      {/* ── STEP 2: Confirmed ── */}
      {step === 2 && order && (
        <div className="fade-up fade-up-2">
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
              <CheckCircle size={32} color="var(--green)" />
            </div>
            <h2 style={{ marginBottom: 8 }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: '1.5rem' }}>
              Payment received. Your order is with our team.
            </p>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px 24px', display: 'inline-block', border: '1px solid var(--line)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Order Number
              </p>
              <p className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue)', letterSpacing: '0.04em' }}>
                {order.order_number}
              </p>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-4)', marginTop: 12 }}>
              Save this number to track your order
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1 }}
              onClick={() => navigate('/dashboard')}>
              View All Orders
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }}
              onClick={() => navigate(`/track?order=${order.order_number}`)}>
              Track Order <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}