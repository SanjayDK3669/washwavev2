import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shirt, Wind, Flame, Package, ArrowRight, CheckCircle, Truck, Clock, X, Shield } from 'lucide-react';

/* ── Terms & Conditions modal ─────────────────────────────────────────────── */
function TermsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Shield size={18} color="var(--blue)"/>
            <h3 style={{ margin:0 }}>Terms & Conditions</h3>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-3)', display:'flex' }}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize:'0.8rem', color:'var(--ink-4)', marginBottom:'1rem' }}>Last updated: April 2025 · WashWave Laundry Services</p>

          <h3>1. Acceptance of Terms</h3>
          <p>By accessing or using WashWave's platform, mobile application, or services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms constitute a legally binding agreement between you ("Customer") and WashWave ("Company", "we", "us").</p>

          <h3>2. Services Description</h3>
          <p>WashWave provides on-demand laundry pickup and delivery services including washing, dry cleaning, ironing, and full laundry processing. We connect customers with our laundry processing facilities. Service availability may vary based on your location and pincode.</p>

          <h3>3. Registration & Account</h3>
          <p>You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use our services. WashWave reserves the right to suspend or terminate accounts that violate these terms.</p>

          <h3>4. Booking & Orders</h3>
          <p>Orders are subject to availability and service area coverage. Once an order is placed and payment confirmed, a pickup slot is assigned. Customers must ensure clothes are available at the specified address during the chosen pickup time window. WashWave reserves the right to reschedule pickups in case of unforeseen circumstances with prior notice.</p>

          <h3>5. Pricing & Payments</h3>
          <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Pricing is per cloth item based on service type: Washing Rs 10/cloth, Ironing Rs 8/cloth, Full Laundry Rs 25/cloth, Dry Cleaning Rs 30/cloth. Subscription plans are priced at Rs 349 (10 clothes) and Rs 649 (20 clothes). Prices are subject to change with prior notice.</p>
          <p>Payment must be completed before order confirmation (except Cash on Pickup). UPI payments are verified by our admin team within 2–4 business hours. Cash on Pickup must be paid in exact change to our delivery agent. WashWave does not store any payment card information. All UPI transactions are secured by your respective payment provider.</p>

          <h3>6. Payment Verification</h3>
          <p>For UPI/digital payments, customers must submit a valid UPI transaction reference number. WashWave's admin team will verify the transaction with our payment records. If verification fails, the customer will be notified and required to re-submit a valid transaction ID or choose an alternative payment method. WashWave is not responsible for failed transactions due to incorrect UPI IDs or insufficient balance.</p>

          <h3>7. Garment Care & Liability</h3>
          <p>Customers are responsible for declaring any special care instructions for garments. WashWave follows standard industry care label guidelines. We are not liable for pre-existing damage, color bleeding due to fabric quality, or shrinkage of items that are not care-label compliant. Maximum liability for any damaged or lost item is limited to Rs 500 per item or the order value, whichever is lower. Claims must be raised within 24 hours of delivery.</p>

          <h3>8. Cancellation & Refund Policy</h3>
          <p>Orders may be cancelled before pickup without charge. After pickup, a 50% service charge applies. Refunds for cancelled prepaid orders will be processed within 5–7 business days to the original payment method. No refunds are applicable once clothes have been processed. WashWave reserves the right to cancel orders due to operational constraints and will provide a full refund in such cases.</p>

          <h3>9. Pickup & Delivery</h3>
          <p>Pickup and delivery times are estimated and not guaranteed. WashWave is not responsible for delays due to traffic, weather, or other external factors. Customers must be available during the chosen time slot or designate an authorized person to hand over/receive clothes. Clothes not available at pickup time may result in order cancellation.</p>

          <h3>10. Subscription Plans</h3>
          <p>Subscription plans are valid for one order per cycle at the subscribed cloth count. Unused clothes in a subscription cycle do not carry forward. Subscriptions are non-transferable and non-refundable once availed. WashWave reserves the right to modify subscription terms with 30 days' notice.</p>

          <h3>11. Privacy & Data</h3>
          <p>WashWave collects personal information (name, phone, address) solely for service delivery purposes. We do not sell or share your data with third parties for marketing. Your data is stored securely and protected in accordance with applicable Indian data protection laws. By using our service, you consent to the collection and use of your information as described in our Privacy Policy.</p>

          <h3>12. User Conduct</h3>
          <p>Users must not submit garments containing illegal substances, weapons, or hazardous materials. Abusive or threatening behavior toward WashWave staff is grounds for immediate account termination. Users must not attempt to exploit pricing errors or misuse promotional offers.</p>

          <h3>13. Governing Law & Disputes</h3>
          <p>These terms are governed by the laws of India. Any disputes arising from use of WashWave services shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka. WashWave encourages resolving disputes through customer support before escalating to legal proceedings.</p>

          <h3>14. Changes to Terms</h3>
          <p>WashWave reserves the right to modify these Terms & Conditions at any time. Changes will be communicated via the app or website. Continued use of our services after changes constitutes acceptance of the revised terms.</p>

          <h3>15. Contact Us</h3>
          <p>For queries regarding these terms, payments, or service issues, please contact us through the WashWave platform. We aim to respond to all queries within 24 business hours.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Home page ─────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuth();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)}/>}

      {/* Hero */}
      <div className="hero">
        <div style={{ maxWidth:580, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.1)', padding:'5px 14px', borderRadius:'var(--radius)', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)', marginBottom:'1.4rem', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }}/>
            Now accepting orders
          </div>
          <h1 style={{ color:'white', fontSize:'clamp(1.6rem, 6vw, 2.8rem)', marginBottom:'0.9rem', letterSpacing:'-0.04em', lineHeight:1.05 }}>
            Laundry done right,<br/>delivered to your door.
          </h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'clamp(0.9rem, 3vw, 1.05rem)', marginBottom:'1.8rem', lineHeight:1.6 }}>
            Book a pickup, pay your way, and track your order in real time. Starting at Rs 8 per cloth.
          </p>
          {user ? (
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/new-order" className="btn btn-lg" style={{ background:'white', color:'var(--brand-dark)', fontWeight:800 }}>
                Place New Order <ArrowRight size={17}/>
              </Link>
              <Link to="/dashboard" className="btn btn-lg" style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}>
                My Orders
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background:'white', color:'var(--brand-dark)', fontWeight:800 }}>
                Get Started <ArrowRight size={17}/>
              </Link>
              <Link to="/login" className="btn btn-lg" style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding:'3.5rem 1.5rem', background:'white', borderBottom:'1px solid var(--line)' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h2 style={{ marginBottom:8 }}>Simple, transparent pricing</h2>
            <p style={{ color:'var(--ink-3)', fontSize:'0.92rem' }}>Per-cloth pricing. Each service billed at its own rate.</p>
          </div>
          <div className="grid-4">
            {[
              {icon:Shirt,   label:'Washing',      price:10, desc:'Regular wash & rinse'},
              {icon:Wind,    label:'Dry Cleaning',  price:30, desc:'Chemical dry clean'},
              {icon:Flame,   label:'Ironing',       price:8,  desc:'Press & fold'},
              {icon:Package, label:'Full Laundry',  price:25, desc:'Wash + dry + fold'},
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card" style={{ textAlign:'center', padding:'1.3rem 1rem' }}>
                  <div style={{ color:'var(--blue)', marginBottom:9, display:'flex', justifyContent:'center' }}><Icon size={22}/></div>
                  <div style={{ fontWeight:700, marginBottom:4, fontSize:'0.9rem' }}>{s.label}</div>
                  <div style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.3rem', color:'var(--blue)', marginBottom:3 }}>Rs {s.price}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--ink-4)' }}>per cloth · {s.desc}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              {label:'Basic Plan', clothes:10, price:349, tag:'Subscription'},
              {label:'Standard Plan', clothes:20, price:649, tag:'Best Value'},
            ].map(p => (
              <div key={p.label} className="card" style={{ padding:'1rem 1.2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{p.label}</div>
                  <div style={{ fontSize:'0.76rem', color:'var(--ink-4)', marginTop:2 }}>{p.clothes} clothes · {p.tag}</div>
                </div>
                <div style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.2rem', color:'var(--blue)' }}>Rs {p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding:'3.5rem 1.5rem', background:'var(--bg)' }}>
        <div style={{ maxWidth:660, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h2 style={{ marginBottom:8 }}>How it works</h2>
            <p style={{ color:'var(--ink-3)', fontSize:'0.92rem' }}>Three steps to clean clothes</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            {[
              {num:'01', icon:CheckCircle, title:'Place Your Order', desc:'Select services, cloth count, pickup schedule and address. Choose your preferred payment method.'},
              {num:'02', icon:Truck, title:'We Pick Up & Clean', desc:'Our team arrives at your scheduled time, collects your clothes and processes each item with care.'},
              {num:'03', icon:Clock, title:'Track & Receive', desc:'Use your order number to see real-time status. We deliver your clean clothes back to your door.'},
            ].map(step => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="card" style={{ display:'flex', gap:'1rem', padding:'1.2rem 1.4rem', alignItems:'flex-start' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontWeight:800, fontSize:'1.3rem', color:'var(--line)', minWidth:32, lineHeight:1 }}>{step.num}</div>
                  <div style={{ color:'var(--blue)', marginTop:2, flexShrink:0 }}><Icon size={19}/></div>
                  <div>
                    <h4 style={{ marginBottom:3 }}>{step.title}</h4>
                    <p style={{ fontSize:'0.86rem', color:'var(--ink-3)', margin:0 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'3.5rem 1.5rem', background:'white', textAlign:'center' }}>
        <h2 style={{ marginBottom:10 }}>Ready to get started?</h2>
        <p style={{ color:'var(--ink-3)', marginBottom:'1.3rem', fontSize:'0.92rem' }}>Create a free account and place your first order today.</p>
        <Link to={user ? '/new-order' : '/register'} className="btn btn-dark btn-lg">
          {user ? 'Place an Order' : 'Create Free Account'} <ArrowRight size={17}/>
        </Link>
      </div>

      {/* Footer */}
      <div style={{ background:'var(--brand-dark)', color:'rgba(255,255,255,0.4)', padding:'1.5rem', textAlign:'center', fontSize:'0.78rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
          <img src="https://washwavebackendv2.onrender.com/images/ww_logo.jpeg" alt="WashWave" onError={e=>e.target.style.display='none'}
            style={{ width:24, height:24, borderRadius:6, objectFit:'cover' }}/>
          <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:800, fontSize:'0.9rem' }}>WashWave</span>
        </div>
        <p style={{ marginBottom:8 }}>Professional laundry pickup & delivery service · Bengaluru, India</p>
        <button onClick={() => setShowTerms(true)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', textDecoration:'underline', fontFamily:'inherit' }}>
          Terms & Conditions
        </button>
        <span style={{ margin:'0 8px', opacity:0.3 }}>·</span>
        <span>All prices inclusive of taxes · Pay via UPI, QR, PhonePe or Cash</span>
      </div>
    </div>
  );
}