import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shirt, Wind, Flame, Package, ArrowRight, CheckCircle, Truck, Clock } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: 'var(--radius)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            Now accepting orders
          </div>
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Laundry done right,<br />delivered to your door.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Book a pickup, pay securely, and track your order in real time.
            Starting at Rs 8 per cloth.
          </p>
          {user ? (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/new-order" className="btn btn-lg"
                style={{ background: 'white', color: 'var(--brand-dark)', fontWeight: 800 }}>
                Place New Order <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-lg"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                My Orders
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg"
                style={{ background: 'white', color: 'var(--brand-dark)', fontWeight: 800 }}>
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-lg"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: '4rem 2rem', background: 'white', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: 8 }}>Simple, transparent pricing</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.95rem' }}>
              Per-cloth pricing. Each service billed at its own rate.
            </p>
          </div>
          <div className="grid-4">
            {[
              { icon: Shirt,   label: 'Washing',      price: 10, desc: 'Regular wash & rinse' },
              { icon: Wind,    label: 'Dry Cleaning', price: 30, desc: 'Chemical dry clean' },
              { icon: Flame,   label: 'Ironing',      price: 8,  desc: 'Press & fold' },
              { icon: Package, label: 'Full Laundry', price: 25, desc: 'Wash + dry + fold' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ color: 'var(--blue)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '1.4rem', color: 'var(--blue)', marginBottom: 4 }}>
                    Rs {s.price}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-4)' }}>
                    per cloth · {s.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '4rem 2rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: 8 }}>How it works</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '0.95rem' }}>Three steps to clean clothes</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { num: '01', icon: CheckCircle, title: 'Place Your Order',   desc: 'Select services, enter cloth count for each, add your pickup address and pay securely via Razorpay.' },
              { num: '02', icon: Truck,       title: 'We Pick Up & Clean', desc: 'Our team picks up from your door, processes each item, and keeps you updated at every step.' },
              { num: '03', icon: Clock,       title: 'Track & Receive',    desc: 'Use your order number to track real-time status. We deliver your clean clothes back to you.' },
            ].map(step => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="card"
                  style={{ display: 'flex', gap: '1.2rem', padding: '1.3rem 1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '1.4rem', color: 'var(--line)', minWidth: 36, lineHeight: 1 }}>
                    {step.num}
                  </div>
                  <div style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{step.title}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)', margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4rem 2rem', background: 'white', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Ready to get started?</h2>
        <p style={{ color: 'var(--ink-3)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Create a free account and place your first order today.
        </p>
        <Link to={user ? '/new-order' : '/register'} className="btn btn-dark btn-lg">
          {user ? 'Place an Order' : 'Create Free Account'} <ArrowRight size={18} />
        </Link>
      </div>

      {/* Footer */}
      <div style={{ background: 'var(--brand-dark)', color: 'rgba(255,255,255,0.35)', padding: '1.5rem 2rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-bright)' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>WashWave</span>
        </div>
        Payments powered by Razorpay · Secure & instant confirmation
      </div>
    </div>
  );
}