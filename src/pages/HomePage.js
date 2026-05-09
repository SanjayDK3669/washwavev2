import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, MapPin, Phone, Mail, MessageCircle, Clock,
  Shield, Zap, Leaf, Users, Truck, CheckCircle,
  ChevronRight, Award, ArrowRight
} from 'lucide-react';

/* ── Scroll reveal hook ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Animated counter ───────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = '' }) {
  const ref   = useRef(null);
  const done  = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let start = 0;
        const end = parseInt(target);
        const dur = 1800;
        const step = dur / end;
        const timer = setInterval(() => {
          start = Math.min(start + Math.ceil(end / 60), end);
          if (el) el.textContent = start.toLocaleString() + suffix;
          if (start >= end) clearInterval(timer);
        }, step > 16 ? step : 16);
      }
    }, { threshold: 0.5 });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────
   SECTIONS
───────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="hero">
      {/* Background blobs */}
      <div className="hero-bg-circle" style={{ width:500, height:500, top:-150, right:-100, animationDelay:'0s' }}/>
      <div className="hero-bg-circle" style={{ width:300, height:300, bottom:-50, left:'30%', animationDelay:'3s' }}/>

      <div className="hero-content fade-up">
        <div className="hero-eyebrow">
          <span style={{ fontSize:'0.7rem' }}>📍</span>
          Now serving Mangalore
        </div>

        <h1>
          Doorstep Laundry<br/>
          <span>Delivered Fresh.</span>
        </h1>

        <p className="hero-sub">
          Professional eco-friendly cleaning — washing, dry cleaning, ironing and full laundry — 
          picked up and delivered to your door. Book in 60 seconds.
        </p>

        <div className="hero-ctas">
          <Link to="/register" className="btn btn-xl" style={{
            background: 'white', color: 'var(--blue)', fontWeight: 800,
            boxShadow: '0 4px 20px rgba(255,255,255,0.25)'
          }}>
            Book a Pickup <ArrowRight size={18}/>
          </Link>
          <Link to="/login" className="btn btn-xl btn-outline" style={{
            border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }}>
            Track My Order
          </Link>
        </div>

        <div className="hero-trust">
          {[
            { icon: '⭐', label: <><strong>4.8★</strong> Rating</> },
            { icon: '🛡️', label: <><strong>10,000+</strong> Orders</> },
            { icon: '👥', label: <><strong>5,000+</strong> Customers</> },
            { icon: '🌿', label: <><strong>Eco</strong>-friendly</> },
          ].map((t, i) => (
            <div key={i} className="hero-trust-item">
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section" style={{ paddingTop:'3.5rem', paddingBottom:'3.5rem' }}>
      <div className="stats-grid">
        {[
          { num: '10000', suffix: '+', label: 'Orders Completed' },
          { num: '5000',  suffix: '+', label: 'Happy Customers' },
          { num: '50',    suffix: '+', label: 'Service Agents' },
          { num: '48',    suffix: 'hr', label: 'Avg. Turnaround' },
        ].map((s, i) => (
          <div key={i} className="stat-item reveal">
            <div className="stat-number">
              <AnimatedNumber target={s.num} suffix={s.suffix}/>
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { icon:'🧺', name:'Washing + Iron',        price:'₹45', per:'per item',  desc:'Full wash, dry and crisp iron — complete care for everyday clothes.' },
    { icon:'👔', name:'Only Ironing',           price:'₹30', per:'per item',  desc:'Precision press for already-clean clothes. Wrinkle-free guaranteed.' },
    { icon:'✨', name:'Dry Wash + Iron',        price:'₹90', per:'per item',  desc:'Solvent dry-cleaning + iron for delicates, formals and heavy fabrics.' },
    { icon:'🛏️', name:'Bed Sheet / Bed Spread', price:'₹55', per:'per piece', desc:'Full wash, dry and neat fold for bed sheets, spreads and covers.' },
    { icon:'📦', name:'Basic Plan',             price:'₹349',per:'10 clothes',desc:'Perfect for singles — 10 clothes picked, washed and delivered.' },
    { icon:'🌟', name:'Standard Plan',          price:'₹649',per:'20 clothes',desc:'Best value — 20 clothes with priority pickup and fast delivery.' },
  ];

  return (
    <section className="section section-alt">
      <div className="section-header reveal">
        <span className="section-eyebrow">Our Services</span>
        <h2 className="section-title">Everything your wardrobe needs</h2>
        <p className="section-sub">From everyday washing to delicate dry cleaning — professional care for every fabric type.</p>
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <div key={i} className={`service-card reveal fade-up-${Math.min(i, 5)}`}>
            <div className="service-icon">{s.icon}</div>
            <h3 style={{ fontSize:'1rem', marginBottom:4 }}>{s.name}</h3>
            <p style={{ fontSize:'0.82rem', marginBottom:'0.7rem', color:'var(--ink-4)' }}>{s.desc}</p>
            <div className="service-price">{s.price}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.per}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num:1, icon:'📱', title:'Book Online',    desc:'Choose your services, select a pickup slot, and confirm your order in under a minute.' },
    { num:2, icon:'🚗', title:'We Pick Up',     desc:'Our agent arrives at your doorstep on the scheduled date and time.' },
    { num:3, icon:'✨', title:'We Clean',       desc:'Professional cleaning with eco-friendly detergents and state-of-the-art equipment.' },
    { num:4, icon:'🎉', title:'Delivered Fresh',desc:'Your clothes are delivered clean, pressed and neatly packaged to your door.' },
  ];

  return (
    <section className="section">
      <div className="section-header reveal">
        <span className="section-eyebrow">How It Works</span>
        <h2 className="section-title">Clean clothes in 4 easy steps</h2>
        <p className="section-sub">We've made the entire process simple, transparent and hassle-free.</p>
      </div>

      <div className="steps-grid">
        {steps.map((s, i) => (
          <div key={i} className={`step-item reveal fade-up-${i}`}>
            <div className="step-num">{s.num}</div>
            <div style={{ fontSize:'2rem', marginBottom:'0.7rem' }}>{s.icon}</div>
            <h3 style={{ fontSize:'1rem', marginBottom:'0.5rem' }}>{s.title}</h3>
            <p style={{ fontSize:'0.84rem', color:'var(--ink-3)' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const features = [
    { icon:'🌿', color:'#ECFDF5', title:'Eco-Friendly',        desc:'Biodegradable detergents and water-saving processes reduce our carbon footprint.' },
    { icon:'✅', color:'#EFF6FF', title:'Verified Professionals',desc:'Every agent is background-verified, trained and uniformed for your safety.' },
    { icon:'⚡', color:'#FFF7ED', title:'Fast Turnaround',      desc:'Standard 48-hour delivery. Express same-day available for urgent orders.' },
    { icon:'💰', color:'#F0FDF4', title:'Transparent Pricing',  desc:'No hidden charges. What you see is what you pay, always.' },
    { icon:'📍', color:'#FDF4FF', title:'Real-Time Tracking',   desc:'Track your order from pickup to delivery, live from your dashboard.' },
    { icon:'🔒', color:'#FFF1F2', title:'Safe & Insured',       desc:'Your clothes are insured during transit. We take full responsibility.' },
  ];

  return (
    <section className="section section-alt">
      <div className="section-header reveal">
        <span className="section-eyebrow">Why WashWave</span>
        <h2 className="section-title">The smarter way to do laundry</h2>
        <p className="section-sub">We're not just a laundry service. We're your reliable partner in keeping life fresh.</p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className={`feature-card reveal fade-up-${Math.min(i, 4)}`}>
            <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
            <h3 style={{ fontSize:'0.98rem', marginBottom:6 }}>{f.title}</h3>
            <p style={{ fontSize:'0.84rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Pay Per Item',
      desc: 'Perfect for occasional use',
      popular: false,
      items: [
        { label:'Washing + Iron',        price:'₹45 / item' },
        { label:'Only Ironing',           price:'₹30 / item' },
        { label:'Dry Wash + Iron',        price:'₹90 / item' },
        { label:'Bed Sheet / Bed Spread', price:'₹55 / piece' },
      ],
      cta: 'Order Now',
      ctaStyle: 'btn-outline',
    },
    {
      name: 'Basic Plan',
      desc: '10 clothes per pickup',
      popular: false,
      price: '₹349',
      per: '/ pickup',
      items: [
        { label:'Up to 10 clothes',       price:'included' },
        { label:'Washing + Iron',         price:'✓' },
        { label:'Priority pickup',        price:'✓' },
        { label:'SMS updates',            price:'✓' },
      ],
      cta: 'Get Started',
      ctaStyle: 'btn-outline',
    },
    {
      name: 'Standard Plan',
      desc: '20 clothes per pickup',
      popular: true,
      price: '₹649',
      per: '/ pickup',
      items: [
        { label:'Up to 20 clothes',    price:'included' },
        { label:'Washing + Iron',      price:'✓' },
        { label:'Priority pickup',     price:'✓' },
        { label:'Real-time tracking',  price:'✓' },
        { label:'Dedicated agent',     price:'✓' },
      ],
      cta: 'Best Value',
      ctaStyle: 'btn-primary',
    },
  ];

  return (
    <section className="section">
      <div className="section-header reveal">
        <span className="section-eyebrow">Pricing</span>
        <h2 className="section-title">Simple, honest pricing</h2>
        <p className="section-sub">No surprises, no hidden fees. Pick what works for you.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, i) => (
          <div key={i} className={`pricing-card reveal fade-up-${i} ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="pricing-badge">⭐ Most Popular</div>}
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', color:'var(--dark)' }}>{plan.name}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--ink-4)', marginBottom: plan.price ? '0.8rem' : 0 }}>{plan.desc}</div>
              {plan.price && (
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <span className="pricing-amount">{plan.price}</span>
                  <span style={{ color:'var(--ink-4)', fontSize:'0.84rem' }}>{plan.per}</span>
                </div>
              )}
            </div>
            <div style={{ borderTop:'1px solid var(--line)', paddingTop:'1rem', marginBottom:'1.2rem' }}>
              {plan.items.map((item, j) => (
                <div key={j} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', fontSize:'0.86rem', borderBottom: j < plan.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ color:'var(--ink-2)' }}>{item.label}</span>
                  <span style={{ fontWeight:600, color: item.price === '✓' ? 'var(--green)' : 'var(--ink)' }}>{item.price}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className={`btn ${plan.ctaStyle} btn-full`}>
              {plan.cta} <ChevronRight size={15}/>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      name: 'Priya Shenoy',
      location: 'Mangalore',
      rating: 5,
      text: 'WashWave has completely changed how I handle laundry. The pickup is always on time and my clothes come back perfectly pressed. Highly recommend!',
      avatar: 'PS',
      color: '#0077FF',
    },
    {
      name: 'Rohan Kamath',
      location: 'Konaje',
      rating: 5,
      text: 'Best doorstep laundry service in Mangalore. The dry cleaning quality is exceptional and the pricing is very fair. Will continue using.',
      avatar: 'RK',
      color: '#00C2A8',
    },
    {
      name: 'Anitha D\'Souza',
      location: 'Mangalore University Area',
      rating: 5,
      text: 'Signed up for the Standard Plan and it\'s totally worth it. Saves me hours every week. The agents are professional and courteous.',
      avatar: 'AD',
      color: '#7C3AED',
    },
  ];

  return (
    <section className="section section-alt">
      <div className="section-header reveal">
        <span className="section-eyebrow">Testimonials</span>
        <h2 className="section-title">What our customers say</h2>
        <p className="section-sub">Real reviews from real customers across Mangalore.</p>
      </div>

      <div className="testimonials-grid">
        {reviews.map((r, i) => (
          <div key={i} className={`testimonial-card reveal fade-up-${i}`}>
            <div className="stars">
              {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor"/>)}
            </div>
            <p style={{ fontSize:'0.9rem', color:'var(--ink-2)', lineHeight:1.7, marginBottom:'1.2rem' }}>"{r.text}"</p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:38, height:38, borderRadius:'50%', background:r.color, color:'white',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:'0.78rem', fontFamily:'var(--font-display)', flexShrink:0
              }}>
                {r.avatar}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--dark)' }}>{r.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--ink-4)', display:'flex', alignItems:'center', gap:3 }}>
                  <MapPin size={10}/> {r.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceArea() {
  return (
    <section className="section">
      <div className="section-header reveal">
        <span className="section-eyebrow">Service Areas</span>
        <h2 className="section-title">Currently serving Mangalore</h2>
        <p className="section-sub">We're growing fast. If your area isn't listed, reach out — we may already be there!</p>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.8rem', justifyContent:'center' }} className="reveal">
        {['Konaje','Mangalore University Area','Kulshekar','Hampankatta','Bejai','Kankanady','Kadri','Pandeshwar','Attavar','Bunts Hostel Road'].map(area => (
          <span key={area} style={{
            display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
            borderRadius:'var(--radius-pill)', border:'1.5px solid var(--line)', background:'white',
            fontSize:'0.85rem', color:'var(--ink-2)', fontWeight:500
          }}>
            <MapPin size={12} color="var(--blue)"/> {area}
          </span>
        ))}
      </div>

      <div style={{ textAlign:'center', marginTop:'2rem' }} className="reveal">
        <p style={{ fontSize:'0.88rem', color:'var(--ink-3)', marginBottom:'0.8rem' }}>
          Don't see your area? WhatsApp us and we'll check availability.
        </p>
        <a href="https://wa.me/919019883633?text=Hi%20WashWave!%20I%20want%20to%20check%20if%20you%20deliver%20in%20my%20area."
          target="_blank" rel="noopener noreferrer"
          className="btn btn-teal">
          <MessageCircle size={16}/> Check My Area
        </a>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section section-alt">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center' }}>
        <div className="reveal">
          <span className="section-eyebrow">About WashWave</span>
          <h2 className="section-title" style={{ textAlign:'left', marginBottom:'1rem' }}>
            Built in Mangalore,<br/>for Mangalore
          </h2>
          <p style={{ marginBottom:'1rem' }}>
            WashWave was founded with a simple mission — to eliminate the time and hassle of laundry so you can focus on what matters most. We use technology to bring professional laundry services to your doorstep.
          </p>
          <p style={{ marginBottom:'1.5rem' }}>
            Based near Mangalore University in Konaje, we combine local trust with the reliability of a modern service platform. Our team of verified agents is trained to handle all fabric types with care.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
            {[
              'Eco-friendly detergents and processes',
              'Verified and trained pickup agents',
              'Transparent pricing — no hidden fees',
              'Real-time order tracking via dashboard',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:9, fontSize:'0.9rem', color:'var(--ink-2)' }}>
                <CheckCircle size={16} color="var(--green)" style={{ flexShrink:0 }}/> {item}
              </div>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {[
            { icon:'🌿', title:'Eco Mission',   desc:'Reducing water waste with efficient machines', bg:'var(--green-light)' },
            { icon:'🔒', title:'Safe & Secure', desc:'Your garments are insured during transit',      bg:'var(--blue-light)' },
            { icon:'⚡', title:'Tech-Driven',   desc:'End-to-end digital order management',           bg:'var(--amber-light)' },
            { icon:'❤️', title:'Customer First',desc:'5-star support, every step of the way',        bg:'var(--red-light)' },
          ].map((c, i) => (
            <div key={i} style={{ padding:'1.2rem', borderRadius:'var(--radius-xl)', background:c.bg, border:'1.5px solid var(--line)' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4, color:'var(--dark)' }}>{c.title}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--ink-3)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

function Contact() {
  const contacts = [
    { icon:<Phone size={18}/>,          label:'Phone',    value:'+91 90198 83633',          href:'tel:+919019883633' },
    { icon:<MessageCircle size={18}/>,  label:'WhatsApp', value:'+91 90198 83633',          href:'https://wa.me/919019883633' },
    { icon:<Mail size={18}/>,           label:'Email',    value:'business@sandyie.in',      href:'mailto:business@sandyie.in' },
    { icon:<MapPin size={18}/>,         label:'Office',   value:'Near Mangalore University, Konaje, Mangalore', href:'#' },
    { icon:<Clock size={18}/>,          label:'Hours',    value:'Monday – Sunday · 7:00 AM to 8:00 PM', href:'#' },
  ];

  return (
    <section className="section">
      <div className="section-header reveal">
        <span className="section-eyebrow">Contact Us</span>
        <h2 className="section-title">We're always here to help</h2>
        <p className="section-sub">Reach out via phone, WhatsApp, or email — we respond within hours.</p>
      </div>

      <div className="contact-grid">
        <div className="reveal">
          {contacts.map((c, i) => (
            <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{ textDecoration:'none', display:'block' }}>
              <div className="contact-item">
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700, marginBottom:2 }}>{c.label}</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--ink)' }}>{c.value}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="reveal" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ padding:'1.5rem', background:'var(--blue-light)', borderRadius:'var(--radius-xl)', border:'1.5px solid var(--blue-mid)' }}>
            <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--blue)', marginBottom:6, fontFamily:'var(--font-display)' }}>
              📱 Quick WhatsApp Order
            </div>
            <p style={{ fontSize:'0.86rem', color:'var(--ink-3)', marginBottom:'1rem' }}>
              Prefer chatting? WhatsApp us your order details and we'll handle the rest.
            </p>
            <a href="https://wa.me/919019883633?text=Hi%20WashWave!%20I%27d%20like%20to%20place%20a%20laundry%20order."
              target="_blank" rel="noopener noreferrer"
              className="btn btn-teal btn-full">
              <MessageCircle size={16}/> Chat on WhatsApp
            </a>
          </div>

          <div style={{ padding:'1.5rem', background:'var(--bg)', borderRadius:'var(--radius-xl)', border:'1.5px solid var(--line)' }}>
            <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--dark)', marginBottom:6, fontFamily:'var(--font-display)' }}>
              🗓️ Working Hours
            </div>
            {[
              { day:'Monday – Saturday', hours:'7:00 AM – 8:00 PM' },
              { day:'Sunday',            hours:'9:00 AM – 6:00 PM' },
            ].map((h, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i === 0 ? '1px solid var(--line)' : 'none', fontSize:'0.87rem' }}>
                <span style={{ color:'var(--ink-3)' }}>{h.day}</span>
                <span style={{ fontWeight:600, color:'var(--ink)' }}>{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <div style={{ padding:'0 0 4rem' }}>
      <div className="cta-banner reveal">
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:'0.8rem' }}>
            ✦ GET STARTED TODAY
          </div>
          <h2 style={{ color:'white', fontSize:'clamp(1.6rem, 3.5vw, 2.4rem)', marginBottom:'0.8rem' }}>
            Ready for fresh, clean clothes?
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'1rem', marginBottom:'1.8rem', maxWidth:480, margin:'0 auto 1.8rem' }}>
            Join 5,000+ happy customers in Mangalore. Book your first pickup today — it only takes a minute.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-xl" style={{ background:'white', color:'var(--blue)', fontWeight:800 }}>
              Book First Pickup <ArrowRight size={18}/>
            </Link>
            <a href="https://wa.me/919019883633" target="_blank" rel="noopener noreferrer"
              className="btn btn-xl" style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1.5px solid rgba(255,255,255,0.3)', backdropFilter:'blur(10px)' }}>
              <MessageCircle size={18}/> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div className="footer-brand">
            <img src="https://washwavebackendv2.onrender.com/images/ww_logo.jpeg" alt="WashWave"
              onError={e => e.target.style.display='none'}
              style={{ width:30, height:30, borderRadius:8, objectFit:'cover' }}/>
            WashWave
          </div>
          <p className="footer-desc">
            Professional doorstep laundry services in Mangalore. Eco-friendly, affordable, and reliable — always.
          </p>
          <div className="social-links">
            {[
              { label:'IG', href:'#' },
              { label:'FB', href:'#' },
              { label:'TW', href:'#' },
              { label:'LI', href:'#' },
            ].map(s => (
              <a key={s.label} href={s.href} className="social-link">{s.label}</a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="footer-col-title">Services</div>
          <div className="footer-links">
            {['Washing + Iron','Only Ironing','Dry Wash + Iron','Bed Sheet / Spread','Basic Plan','Standard Plan'].map(s => (
              <a key={s} href="#" className="footer-link">{s}</a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <div className="footer-col-title">Company</div>
          <div className="footer-links">
            {['About Us','How It Works','Service Areas','Careers','Blog'].map(s => (
              <a key={s} href="#" className="footer-link">{s}</a>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <div className="footer-col-title">Support</div>
          <div className="footer-links">
            <a href="mailto:business@sandyie.in" className="footer-link">business@sandyie.in</a>
            <a href="tel:+919019883633" className="footer-link">+91 90198 83633</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms & Conditions</a>
            <a href="#" className="footer-link">Refund Policy</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} WashWave. All rights reserved.</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span>📍 Near Mangalore University, Konaje, Mangalore</span>
        </span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  useReveal();

  return (
    <>
      <Hero/>
      <Stats/>
      <Services/>
      <HowItWorks/>
      <WhyUs/>
      <Pricing/>
      <Testimonials/>
      <About/>
      <ServiceArea/>
      <Contact/>
      <CTABanner/>
      <Footer/>

      {/* WhatsApp float */}
      <a href="https://wa.me/919019883633?text=Hi%20WashWave!%20I%27d%20like%20to%20book%20a%20laundry%20pickup."
        target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Chat on WhatsApp">
        <MessageCircle size={26} fill="white" stroke="none"/>
      </a>
    </>
  );
}