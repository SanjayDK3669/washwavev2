import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, getMe } from '../utils/api';
import {
  Shirt, Wind, Flame, Package, Plus, Minus, MapPin, Hash,
  FileText, CheckCircle, ArrowRight, AlertCircle, Calendar,
  Clock, ChevronLeft, ChevronRight, Star, Smartphone, QrCode,
  Wallet, Banknote, Trash2
} from 'lucide-react';

const SERVICES = [
  { id:'washing',      label:'Washing',      rate:10, Icon:Shirt,   desc:'Regular wash & rinse' },
  { id:'dry_cleaning', label:'Dry Cleaning', rate:30, Icon:Wind,    desc:'Chemical dry clean' },
  { id:'ironing',      label:'Ironing',      rate:8,  Icon:Flame,   desc:'Press & fold' },
  { id:'full_laundry', label:'Full Laundry', rate:25, Icon:Package, desc:'Wash + dry + fold' },
];

const SUBSCRIPTION_PLANS = [
  { id:'basic',    label:'Basic Plan',    clothes:10, price:349, badge:null,
    features:['10 clothes per order','All services included','Doorstep pickup'] },
  { id:'standard', label:'Standard Plan', clothes:20, price:649, badge:'Best Value',
    features:['20 clothes per order','All services included','Priority pickup','Doorstep pickup'] },
];

// Pickup slots: 8AM–11AM and 4PM–7PM, 30 min intervals
const PICKUP_SLOTS = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM',
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['S','M','T','W','T','F','S'];

const PAYMENT_METHODS = [
  { id:'phone_pay', label:'PhonePe',       sub:'Pay via PhonePe UPI',        Icon:Smartphone },
  { id:'qr_code',   label:'Scan QR Code',  sub:'Scan our QR & pay any UPI',  Icon:QrCode },
  { id:'upi',       label:'UPI Transfer',  sub:'Any UPI app (GPay, etc.)',    Icon:Wallet },
  { id:'cash',      label:'Cash on Pickup',sub:'Pay when we collect clothes', Icon:Banknote },
];

// ── Calendar ──────────────────────────────────────────────────────────────────
function CalendarPicker({ label, value, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const toIso = d => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const isPast = d => new Date(year, month, d) < today;
  const isSelected = d => toIso(d) === value;
  const fmtVal = iso => { if (!iso) return ''; const [y,m,d]=iso.split('-'); return `${d} ${MONTHS[+m-1].slice(0,3)} ${y}`; };

  return (
    <div className="form-group">
      <label className="form-label" style={{ display:'flex', alignItems:'center', gap:5 }}>
        <Calendar size={12}/> {label}
      </label>
      {value && (
        <div style={{ marginBottom:8, padding:'5px 12px', background:'var(--blue-light)', borderRadius:'var(--radius)', fontSize:'0.83rem', fontWeight:700, color:'var(--blue)', display:'inline-block' }}>
          {fmtVal(value)}
        </div>
      )}
      <div style={{ border:'1.5px solid var(--line)', borderRadius:'var(--radius)', background:'white', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderBottom:'1px solid var(--line)', background:'var(--bg)' }}>
          <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth()-1, 1))}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-3)', display:'flex', padding:4, borderRadius:6 }}>
            <ChevronLeft size={15}/>
          </button>
          <span style={{ fontWeight:700, fontSize:'0.88rem' }}>{MONTHS[month]} {year}</span>
          <button type="button" onClick={() => setView(v => new Date(v.getFullYear(), v.getMonth()+1, 1))}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-3)', display:'flex', padding:4, borderRadius:6 }}>
            <ChevronRight size={15}/>
          </button>
        </div>
        <div className="cal-grid" style={{ padding:'5px 8px 2px' }}>
          {DAYS.map((d,i) => <div key={i} style={{ textAlign:'center', fontSize:'0.68rem', fontWeight:700, color:'var(--ink-4)', padding:'4px 0' }}>{d}</div>)}
        </div>
        <div className="cal-grid" style={{ padding:'2px 8px 10px', gap:3 }}>
          {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>i+1).map(day => (
            <button key={day} type="button" className={`cal-day ${isSelected(day)?'selected':''}`}
              disabled={isPast(day)}
              onClick={() => onChange(toIso(day))}>
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Time slots ────────────────────────────────────────────────────────────────
function TimePicker({ label, value, onChange }) {
  const morning = PICKUP_SLOTS.filter(s => s.includes('AM'));
  const evening = PICKUP_SLOTS.filter(s => s.includes('PM'));
  return (
    <div className="form-group">
      <label className="form-label" style={{ display:'flex', alignItems:'center', gap:5 }}>
        <Clock size={12}/> {label}
      </label>
      <div style={{ marginBottom:6, fontSize:'0.75rem', color:'var(--ink-4)', fontWeight:600 }}>MORNING</div>
      <div className="time-grid" style={{ marginBottom:10 }}>
        {morning.map(s => (
          <button key={s} type="button" className={`time-slot ${value===s?'selected':''}`} onClick={() => onChange(s)}>{s}</button>
        ))}
      </div>
      <div style={{ marginBottom:6, fontSize:'0.75rem', color:'var(--ink-4)', fontWeight:600 }}>EVENING</div>
      <div className="time-grid">
        {evening.map(s => (
          <button key={s} type="button" className={`time-slot ${value===s?'selected':''}`} onClick={() => onChange(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ── Service row ───────────────────────────────────────────────────────────────
function ServiceRow({ svc, count, onToggle, onCount }) {
  const selected = count > 0;
  const { Icon } = svc;
  return (
    <div className={`service-row ${selected?'selected':''}`} onClick={() => !selected && onToggle()}>
      <div className="service-row-check" onClick={e => { e.stopPropagation(); onToggle(); }}>
        {selected && <CheckCircle size={12} color="white"/>}
      </div>
      <div style={{ color: selected ? 'var(--blue)' : 'var(--ink-4)', flexShrink:0 }}><Icon size={19}/></div>
      <div className="service-row-info">
        <div className="service-row-name">{svc.label}</div>
        <div className="service-row-desc">{svc.desc}</div>
      </div>
      <div className="service-row-rate">Rs {svc.rate}/cloth</div>
      {selected && (
        <div className="service-row-counter" onClick={e => e.stopPropagation()}>
          <button className="counter-btn" onClick={() => onCount(Math.max(1,count-1))} disabled={count<=1}><Minus size={12}/></button>
          <span className="counter-val">{count}</span>
          <button className="counter-btn" onClick={() => onCount(count+1)}><Plus size={12}/></button>
        </div>
      )}
    </div>
  );
}

// ── Amount summary ────────────────────────────────────────────────────────────
function AmountSummary({ serviceCounts }) {
  const rows = SERVICES.filter(s=>serviceCounts[s.id]>0).map(s => ({ label:s.label, count:serviceCounts[s.id], subtotal:s.rate*serviceCounts[s.id] }));
  const total = rows.reduce((a,r)=>a+r.subtotal,0);
  if (!rows.length) return null;
  return (
    <div className="amount-summary fade-up">
      {rows.map(r => (
        <div key={r.label} className="amount-row">
          <span>{r.label} × {r.count} cloths</span>
          <span style={{ fontFamily:'JetBrains Mono', fontWeight:600 }}>Rs {r.subtotal}</span>
        </div>
      ))}
      <div className="amount-total">
        <span className="amount-total-label">Total Amount</span>
        <span className="amount-total-val">Rs {total}</span>
      </div>
    </div>
  );
}

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Order Details','Payment','Confirmed'];
  return (
    <div className="steps fade-up">
      {steps.map((s,i) => (
        <div key={i} className="step-item" style={{ flex: i<steps.length-1 ? 1 : 0 }}>
          <div className={`step-dot ${i<step?'step-dot-done':i===step?'step-dot-active':'step-dot-future'}`}>
            {i<step ? <CheckCircle size={12}/> : i+1}
          </div>
          <span className={`step-label ${i===step?'step-label-active':'step-label-future'}`}>{s}</span>
          {i<steps.length-1 && <div className={`step-line ${i<step?'step-line-done':''}`}/>}
        </div>
      ))}
    </div>
  );
}

// ── Saved address picker ──────────────────────────────────────────────────────
function AddressPicker({ savedAddresses, selectedIdx, onSelect, address, setAddress, pincode, setPincode }) {
  const [mode, setMode] = useState(savedAddresses.length > 0 ? 'saved' : 'new');

  return (
    <div>
      {savedAddresses.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {['saved','new'].map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{ padding:'7px 16px', borderRadius:'var(--radius)', border:`1.5px solid ${mode===m?'var(--blue)':'var(--line)'}`, background: mode===m ? 'var(--blue-light)':'white', color: mode===m ? 'var(--blue)':'var(--ink-3)', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {m === 'saved' ? 'Saved Addresses' : 'New Address'}
            </button>
          ))}
        </div>
      )}

      {mode === 'saved' && savedAddresses.length > 0 && (
        <div>
          {savedAddresses.map((sa, i) => (
            <button key={i} type="button" className={`saved-addr ${selectedIdx===i?'selected':''}`}
              onClick={() => onSelect(i, sa.address, sa.pincode)}>
              <MapPin size={14} style={{ color:'var(--blue)', marginTop:2, flexShrink:0 }}/>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontSize:'0.86rem', fontWeight:600, color:'var(--ink)' }}>{sa.address}</div>
                <div style={{ fontSize:'0.76rem', color:'var(--ink-4)', marginTop:2 }}>Pincode: {sa.pincode}</div>
              </div>
              {selectedIdx === i && <CheckCircle size={16} color="var(--blue)"/>}
            </button>
          ))}
          <button type="button" onClick={() => setMode('new')}
            style={{ width:'100%', padding:'9px', border:'1.5px dashed var(--line)', borderRadius:'var(--radius)', background:'transparent', color:'var(--ink-3)', fontSize:'0.82rem', cursor:'pointer', fontFamily:'inherit', marginTop:4 }}>
            + Use a different address
          </button>
        </div>
      )}

      {mode === 'new' && (
        <>
          <div className="form-group">
            <label className="form-label">Pickup Address</label>
            <div style={{ position:'relative' }}>
              <textarea className="form-control" placeholder="House number, street, area..."
                value={address} onChange={e => setAddress(e.target.value)} rows={2} style={{ paddingLeft:40 }}/>
              <MapPin size={14} style={{ position:'absolute', left:13, top:13, color:'var(--ink-4)' }}/>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Pincode</label>
            <div style={{ position:'relative' }}>
              <input className="form-control" placeholder="560001" maxLength={6}
                value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g,''))}
                style={{ paddingLeft:40 }}/>
              <Hash size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NewOrderPage() {
  const [step, setStep]       = useState(0);
  const [orderMode, setMode]  = useState('ondemand');
  const [subPlan, setSubPlan] = useState('');
  const [serviceCounts, setSC]= useState({washing:0,dry_cleaning:0,ironing:0,full_laundry:0});
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes]     = useState('');
  const [pickupDate, setPDate]= useState('');
  const [pickupTime, setPTime]= useState('');
  const [payMethod, setPayM]  = useState('');
  const [upiRef, setUpiRef]   = useState('');
  const [savedAddresses, setSaved] = useState([]);
  const [selectedAddrIdx, setSelIdx] = useState(-1);
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const navigate = useNavigate();

  // Load saved addresses
  useEffect(() => {
    getMe().then(r => { setSaved(r.data.saved_addresses || []); }).catch(()=>{});
  }, []);

  const hasServices = Object.values(serviceCounts).some(v=>v>0);
  const totalAmount = SERVICES.reduce((a,s)=>a+(serviceCounts[s.id]>0?s.rate*serviceCounts[s.id]:0),0);
  const isCash = payMethod === 'cash';

  const toggleService = id => setSC(p => ({ ...p, [id]: p[id]>0?0:1 }));
  const setCount = (id,val) => setSC(p => ({ ...p, [id]: Math.max(1,val) }));

  const handleSelectAddr = (idx, addr, pin) => {
    setSelIdx(idx); setAddress(addr); setPincode(pin);
  };

  const handlePlaceOrder = async () => {
    if (orderMode==='ondemand' && !hasServices)  return setErr('Select at least one service');
    if (orderMode==='subscription' && !subPlan)  return setErr('Select a subscription plan');
    if (!address.trim())      return setErr('Enter pickup address');
    if (!pincode || pincode.length!==6) return setErr('Enter a valid 6-digit pincode');
    if (!pickupDate)          return setErr('Select a pickup date');
    if (!pickupTime)          return setErr('Select a pickup time');
    if (!payMethod)           return setErr('Select a payment method');
    if (!isCash && !upiRef.trim()) return setErr('Enter your UPI transaction ID');

    setLoading(true); setErr('');
    try {
      const payload = {
        order_type:     orderMode,
        notes,
        pickup_address: address,
        pincode,
        pickup_date:    pickupDate,
        pickup_time:    pickupTime,
        payment_method: payMethod,
        upi_ref:        isCash ? '' : upiRef.trim(),
      };
      if (orderMode==='subscription') {
        payload.subscription_plan = subPlan;
        payload.service_items = [];
      } else {
        payload.service_items = SERVICES.filter(s=>serviceCounts[s.id]>0).map(s=>({service:s.id,count:serviceCounts[s.id]}));
      }
      const res = await createOrder(payload);
      setOrder(res.data);
      setStep(1);
    } catch(e) { setErr(e.response?.data?.detail || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  const formatDate = iso => { if(!iso)return''; const [y,m,d]=iso.split('-'); return `${d} ${MONTHS[+m-1].slice(0,3)} ${y}`; };

  const selectedPayment = PAYMENT_METHODS.find(p=>p.id===payMethod);

  return (
    <div className="page page-sm" style={{ paddingTop:'1.5rem' }}>
      <h1 style={{ marginBottom:5 }} className="fade-up">New Order</h1>
      <p style={{ color:'var(--ink-3)', marginBottom:'1.4rem', fontSize:'0.88rem' }} className="fade-up fade-up-1">
        Book a laundry pickup from your door
      </p>
      <StepBar step={step}/>

      {/* ── STEP 0: Details ── */}
      {step === 0 && (
        <div className="fade-up fade-up-2">
          {err && <div className="alert alert-error"><AlertCircle size={14}/><span>{err}</span></div>}

          {/* Mode toggle */}
          <div style={{ display:'flex', background:'var(--line-2)', padding:4, borderRadius:'var(--radius)', marginBottom:'1rem', border:'1px solid var(--line)' }}>
            {[{id:'ondemand',label:'On-Demand'},{id:'subscription',label:'Subscription Plan'}].map(m => (
              <button key={m.id} onClick={()=>{setMode(m.id);setErr('');}}
                style={{ flex:1, padding:'8px', borderRadius:8, border:'none', fontFamily:'inherit', fontWeight:700, fontSize:'0.84rem', cursor:'pointer', transition:'all 0.15s',
                  background: orderMode===m.id ? 'white' : 'transparent',
                  color: orderMode===m.id ? 'var(--blue)' : 'var(--ink-4)',
                  boxShadow: orderMode===m.id ? 'var(--shadow-sm)' : 'none' }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* On-demand */}
          {orderMode==='ondemand' && (
            <div className="card" style={{ marginBottom:'1rem' }}>
              <div className="card-header"><h4>Select Services & Cloth Count</h4></div>
              <div className="card-body">
                {SERVICES.map(s => (
                  <ServiceRow key={s.id} svc={s} count={serviceCounts[s.id]}
                    onToggle={()=>toggleService(s.id)} onCount={val=>setCount(s.id,val)}/>
                ))}
                {hasServices && <AmountSummary serviceCounts={serviceCounts}/>}
              </div>
            </div>
          )}

          {/* Subscription */}
          {orderMode==='subscription' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1rem' }}>
              {SUBSCRIPTION_PLANS.map(plan => (
                <div key={plan.id} onClick={()=>setSubPlan(plan.id)}
                  style={{ border:`2px solid ${subPlan===plan.id?'var(--blue)':'var(--line)'}`, borderRadius:'var(--radius)', padding:'1rem',
                    background: subPlan===plan.id ? 'var(--blue-light)' : 'white', cursor:'pointer', transition:'all 0.15s', position:'relative' }}>
                  {plan.badge && (
                    <div style={{ position:'absolute', top:-9, right:10, background:'var(--blue)', color:'white', fontSize:'0.65rem', fontWeight:700, padding:'2px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
                      <Star size={9}/> {plan.badge}
                    </div>
                  )}
                  <div style={{ fontWeight:800, fontSize:'0.95rem', marginBottom:3, color: subPlan===plan.id ? 'var(--blue)' : 'var(--ink)' }}>{plan.label}</div>
                  <div style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.4rem', color: subPlan===plan.id ? 'var(--blue)' : 'var(--ink)', marginBottom:2 }}>Rs {plan.price}</div>
                  <div style={{ fontSize:'0.73rem', color:'var(--ink-4)', marginBottom:8 }}>{plan.clothes} clothes</div>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--ink-3)', marginBottom:3 }}>
                      <CheckCircle size={10} color="var(--green)"/> {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Pickup schedule */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header">
              <h4 style={{ display:'flex', alignItems:'center', gap:7 }}><Calendar size={15}/> Pickup Schedule</h4>
            </div>
            <div className="card-body">
              <CalendarPicker label="Pickup Date" value={pickupDate} onChange={setPDate}/>
              {pickupDate && <TimePicker label="Pickup Time" value={pickupTime} onChange={setPTime}/>}
            </div>
          </div>

          {/* Pickup address */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header"><h4>Pickup Address</h4></div>
            <div className="card-body">
              <AddressPicker
                savedAddresses={savedAddresses}
                selectedIdx={selectedAddrIdx}
                onSelect={handleSelectAddr}
                address={address} setAddress={setAddress}
                pincode={pincode} setPincode={setPincode}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="card-header"><h4>Payment Method</h4></div>
            <div className="card-body">
              {PAYMENT_METHODS.map(pm => {
                const { Icon } = pm;
                const sel = payMethod === pm.id;
                return (
                  <div key={pm.id} className={`pay-method-option ${sel?'selected':''}`} onClick={()=>setPayM(pm.id)}>
                    <div className="pay-method-radio">
                      {sel && <div className="pay-method-radio-dot"/>}
                    </div>
                    <div style={{ width:36, height:36, borderRadius:10, background: sel ? 'var(--blue)' : 'var(--line-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={18} color={sel ? 'white' : 'var(--ink-3)'}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color: sel ? 'var(--blue)' : 'var(--ink)' }}>{pm.label}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--ink-4)', marginTop:1 }}>{pm.sub}</div>
                    </div>
                  </div>
                );
              })}

              {/* QR code display */}
              {payMethod === 'qr_code' && (
                <div className="qr-box" style={{ marginTop:12 }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--ink-3)', marginBottom:10 }}>Scan to pay</p>
                  <img src="https://washwavebackendv2.onrender.com/images/ww_ORcode.jpeg" alt="WashWave QR Code"
                    onError={e => { e.target.src=''; e.target.alt='QR code not found — place ww_ORcode.jpeg in backend/images/'; }}
                  />
                  <p style={{ fontSize:'0.76rem', color:'var(--ink-4)', marginTop:8 }}>
                    Scan using any UPI app and enter the transaction ID below
                  </p>
                </div>
              )}

              {/* PhonePe info */}
              {payMethod === 'phone_pay' && (
                <div className="alert alert-info" style={{ marginTop:12 }}>
                  <AlertCircle size={14}/>
                  <span>Open PhonePe → Pay → Phone Number : <strong>+91 9019883633</strong><br/>Enter amount Rs {orderMode==='subscription' ? SUBSCRIPTION_PLANS.find(p=>p.id===subPlan)?.price || '—' : totalAmount}, complete payment and enter transaction ID below.</span>
                </div>
              )}

              {/* UPI info */}
              {payMethod === 'upi' && (
                <div className="alert alert-info" style={{ marginTop:12 }}>
                  <AlertCircle size={14}/>
                  <span>Pay to UPI ID: <strong>yajnasdkstesla@okicici</strong> using any UPI app (GPay, Paytm, etc.). Enter transaction ID below.</span>
                </div>
              )}

              {/* Transaction ID input for non-cash */}
              {payMethod && !isCash && (
                <div className="form-group" style={{ marginTop:14, marginBottom:0 }}>
                  <label className="form-label">UPI Transaction ID</label>
                  <input className="form-control mono" placeholder="e.g. 412345678901"
                    value={upiRef} onChange={e=>setUpiRef(e.target.value)}/>
                  <p className="form-hint">Find this in your UPI app under recent transactions</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ marginBottom:'1.4rem' }}>
            <div className="card-header"><h4>Special Instructions <span style={{ fontWeight:400, color:'var(--ink-4)' }}>(optional)</span></h4></div>
            <div className="card-body">
              <div style={{ position:'relative' }}>
                <textarea className="form-control" placeholder="e.g. Handle delicates with care..."
                  value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{ paddingLeft:40 }}/>
                <FileText size={14} style={{ position:'absolute', left:13, top:13, color:'var(--ink-4)' }}/>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={handlePlaceOrder}
            disabled={loading || (orderMode==='ondemand'&&!hasServices) || (orderMode==='subscription'&&!subPlan)}>
            {loading ? 'Placing order...' : <><span>Place Order</span><ArrowRight size={17}/></>}
          </button>
        </div>
      )}

      {/* ── STEP 1: Order Placed ── */}
      {step === 1 && order && (
        <div className="fade-up fade-up-2">
          <div className="card" style={{ textAlign:'center', padding:'2.5rem 1.5rem', marginBottom:'1rem' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background: isCash ? 'var(--green-light)' : 'var(--amber-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
              {isCash
                ? <CheckCircle size={28} color="var(--green)"/>
                : <Clock size={28} color="var(--amber)"/>
              }
            </div>
            <h2 style={{ marginBottom:8 }}>{isCash ? 'Order Confirmed!' : 'Order Placed!'}</h2>
            <p style={{ color:'var(--ink-3)', marginBottom:'1.4rem', fontSize:'0.9rem' }}>
              {isCash
                ? 'Your order is confirmed. Pay cash when we collect your clothes.'
                : 'Your payment is under review. Admin will verify your transaction ID and confirm the order shortly.'}
            </p>
            <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'12px 20px', display:'inline-block', border:'1px solid var(--line)', marginBottom:14 }}>
              <p style={{ fontSize:'0.7rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Order Number</p>
              <p className="mono" style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--blue)', letterSpacing:'0.04em' }}>{order.order_number}</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:280, margin:'0 auto' }}>
              <div style={{ padding:'8px', background:'var(--blue-light)', borderRadius:'var(--radius)' }}>
                <div style={{ fontSize:'0.65rem', color:'var(--blue)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>Pickup Date</div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink)' }}>{formatDate(order.pickup_date)}</div>
              </div>
              <div style={{ padding:'8px', background:'var(--blue-light)', borderRadius:'var(--radius)' }}>
                <div style={{ fontSize:'0.65rem', color:'var(--blue)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>Pickup Time</div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--ink)' }}>{order.pickup_time}</div>
              </div>
            </div>
            {!isCash && order.upi_ref && (
              <div style={{ marginTop:12, padding:'8px 14px', background:'var(--bg)', borderRadius:'var(--radius)', fontSize:'0.78rem', color:'var(--ink-3)', border:'1px solid var(--line)' }}>
                Transaction Ref submitted: <span className="mono" style={{ fontWeight:700 }}>{order.upi_ref}</span>
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline" style={{ flex:1 }} onClick={()=>navigate('/dashboard')}>View All Orders</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={()=>navigate(`/track?order=${order.order_number}`)}>
              Track Order <ArrowRight size={14}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}