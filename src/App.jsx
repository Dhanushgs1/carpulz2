import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:3000';

function App() {
  const [cars, setCars] = useState([]);
  const [homeSettings, setHomeSettings] = useState({ hero_title: '', hero_subtitle: '', faqs: [] });
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Input sanitizers
  const handleNameChange = (val) => setName(val.replace(/[0-9]/g, ''));
  const handleCityChange = (val) => setCity(val.replace(/[0-9]/g, ''));
  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setPhoneError(false);
  };
  const [phoneError, setPhoneError] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [reelModal, setReelModal] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  function getVideoEmbedUrl(url, autoplay = false) {
    if (!url) return '';
    const autoParam = autoplay ? '?autoplay=1' : '';
    if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/')) {
      const id = url.split('/').pop().split('?')[0];
      return `https://www.youtube.com/embed/${id}${autoParam}`;
    }
    if (url.includes('instagram.com/reel/') || url.includes('instagram.com/reels/') || url.includes('instagram.com/p/')) {
      let id = '';
      if (url.includes('/reel/')) id = url.split('/reel/')[1]?.split('/')[0];
      else if (url.includes('/reels/')) id = url.split('/reels/')[1]?.split('/')[0];
      else if (url.includes('/p/')) id = url.split('/p/')[1]?.split('/')[0];
      
      return `https://www.instagram.com/reel/${id}/embed/`;
    }
    return url;
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/cars`).then(r => r.json()).then(data => {
      const carList = data.filter(item => item.brand && item.model);
      setCars(carList);
    }).catch(() => {});
    fetch(`${API_BASE}/api/home`).then(r => r.json()).then(data => {
      setHomeSettings(data || { hero_title: '', hero_subtitle: '', faqs: [] });
    }).catch(() => {});
  }, []);

  const brands = useMemo(() => [...new Set(cars.map(c => c.brand))].sort(), [cars]);
  const modelOptions = useMemo(() => cars.filter(c => c.brand === brand).map(c => c.model), [brand, cars]);

  function sanitizePhone(value) {
    return value.replace(/\D/g, '').slice(0, 10);
  }

  const validPhone = sanitizePhone(phone).length === 10;
  const canSubmit = name.trim() && validPhone && city.trim() && selectedCar;

  function openCarPage(car) {
    setSelectedCar(car);
    setActiveGalleryTab(0);
    setSlideIndex(0);
  }

  function closeCatalog() {
    setShowModal(false);
  }

  function handleCatalogSubmit() {
    if (!canSubmit) {
      if (!validPhone) setPhoneError(true);
      return;
    }

    const lead = {
      name: name.trim(),
      phone: `+91${sanitizePhone(phone)}`,
      city: city.trim(),
      brand: selectedCar.brand,
      model: selectedCar.model
    };

    fetch(`${API_BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    }).catch(() => {});

    setIsUnlocked(true);
    closeCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  /* ─── GALLERY HELPERS ─── */
  const galleries = selectedCar?.galleries || [];
  const activeGallery = galleries[activeGalleryTab] || { images: [] };
  const galleryImages = activeGallery.images || [];

  function prevSlide() { setSlideIndex(i => Math.max(0, i - 1)); }
  function nextSlide() { setSlideIndex(i => Math.min(galleryImages.length - 1, i + 1)); }

  /* ─── SPECS ─── */
  const specs = selectedCar?.specs || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v);



  /* ═══════════════ HOME PAGE ═══════════════ */
  if (!selectedCar || !isUnlocked) {
    return (
      <div className="home-page-simple">
        {/* Hero */}
        <section className="hero-simple">
          <div className="hero-content">
            <h1 className="hero-title" style={{ whiteSpace: 'nowrap', fontSize: 'clamp(1.3rem, 5vw, 4.8rem)' }} dangerouslySetInnerHTML={{ __html: (homeSettings.hero_title || 'Premium Car<br /><span class="accent">Transformations</span>').replace(/\n/g, '<br />').replace(/Best-in-Class\.?/gi, '<span style="color: #C68346;">$&</span>') }}>
            </h1>
            <p className="hero-subtitle">{homeSettings.hero_subtitle || 'Select your car below and explore our transformation packages'}</p>

            <div className="selector-card-premium">
              {/* Name */}
              <div className="premium-input-group">
                <label className="field-label-premium">
                  <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Full Name
                </label>
                <input
                  className="premium-select"
                  style={{ padding: '16px 24px' }}
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {/* Phone */}
              <div className="premium-input-group">
                <label className="field-label-premium">
                  <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Phone Number
                </label>
                <input
                  className="premium-select"
                  style={{ padding: '16px 24px' }}
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                />
                {phoneError && <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>Please enter a valid 10-digit number</span>}
              </div>

              {/* City */}
              <div className="premium-input-group">
                <label className="field-label-premium">
                  <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  City
                </label>
                <input
                  className="premium-select"
                  style={{ padding: '16px 24px' }}
                  type="text"
                  value={city}
                  onChange={e => handleCityChange(e.target.value)}
                  placeholder="Your city"
                />
              </div>

              {/* Brand */}
              <div className="premium-input-group">
                <label className="field-label-premium">
                  <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
                  Brand
                </label>
                <div className="select-wrapper">
                  <select className="premium-select" value={brand} onChange={e => { setBrand(e.target.value); setModel(''); }}>
                    <option value="">Choose Brand</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Model */}
              {brand && (
                <div className="premium-input-group">
                  <label className="field-label-premium">
                    <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    Model
                  </label>
                  <div className="select-wrapper">
                    <select className="premium-select" value={model} onChange={e => setModel(e.target.value)}>
                      <option value="">Choose Model</option>
                      {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <button
                className="btn-premium-cta"
                disabled={!brand || !model || !name.trim() || !city.trim() || phone.length < 10}
                onClick={() => {
                  const found = cars.find(c => c.brand === brand && c.model === model);
                  if (found) {
                    setSelectedCar(found);
                    const lead = {
                      name: name.trim(),
                      phone: `+91${sanitizePhone(phone)}`,
                      city: city.trim(),
                      brand: found.brand,
                      model: found.model
                    };
                    fetch(`${API_BASE}/api/leads`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(lead)
                    }).catch(() => {});
                    setIsUnlocked(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Get Packages
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="features-strip">
              <div className="feature-item premium">🎨 Premium Finish</div>
              <div className="feature-item quick">⚡ Quick Install</div>
              <div className="feature-item warranty">🛡️ Warranty Included</div>
              <div className="feature-item best-class">✨ From Base to <span style={{ color: '#C68346' }}>Best-in-Class.</span></div>
            </div>
          </div>
        </section>

        {/* Home FAQs */}
        {homeSettings.faqs && homeSettings.faqs.length > 0 && (
          <section className="home-faq-section" style={{ marginBottom: 100 }}>
            <h2 className="home-faq-title">Frequently Asked Questions</h2>
            <div className="faq-accordion-v2">
              {(homeSettings.faqs || []).map((faq, i) => (
                <div key={i} className={`faq-tab-v2 ${openFaqIndex === i ? 'active' : ''}`}>
                  <button className="faq-toggle-v2" onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}>
                    <span className="faq-q-text">{faq.q}</span>
                    <svg className="faq-arrow-v2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div className="faq-answer-v2">
                    <div className="faq-answer-inner">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WhatsApp Float */}
        <a className="wa-float" href="https://wa.me/919688443333" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>

      </div>
    );
  }

  /* ═══════════════ CAR DETAIL / PACKAGES PAGE ═══════════════ */
  return (
    <div className="home-page-simple">
      <div className="cd-pkg-container">
        <div style={{ marginBottom: 20 }}>
          <button 
            className="cd-back-btn-simple" 
            onClick={() => { setSelectedCar(null); setIsUnlocked(false); setBrand(''); setModel(''); }}
          >
            ← Back to Search
          </button>
        </div>
        {/* Hero Grid */}
        <div className="cd-hero-grid">
          <div className="cd-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Reels Section */}
            {selectedCar.reels && selectedCar.reels.length > 0 && (
              <div className="reels-section-premium-compact" style={{ margin: 0, padding: '0 0 20px 0', background: 'transparent' }}>
                <h2 className="section-title-premium-v2" style={{ marginBottom: 15 }}>Reels</h2>
                <div className="reels-scroller-v3 compact-scroller">
                  {selectedCar.reels.map((reel, i) => {
                    const reelUrl = typeof reel === 'string' ? reel : reel.url;
                    const reelTitle = typeof reel === 'string' ? `Reel ${i + 1}` : (reel.title || `Reel ${i + 1}`);
                    return (
                      <div key={i} className="reel-card-v3">
                        <div className="reel-video-embed">
                          <iframe src={getVideoEmbedUrl(reelUrl, false)} allowFullScreen title={reelTitle} loading="lazy" />
                        </div>
                        <div className="reel-info-overlay-v3"><h4 className="reel-title-v3">{reelTitle}</h4></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="cd-gallery-card">
              <div className="cd-gallery-pills" style={{ marginBottom: 15 }}>
                {galleries.map((g, i) => (
                  <button
                    key={i}
                    className={`cd-pill ${activeGalleryTab === i ? 'active' : ''}`}
                    onClick={() => { setActiveGalleryTab(i); setSlideIndex(0); }}
                  >
                    {g.title}
                  </button>
                ))}
              </div>

              {galleryImages.length > 0 ? (
                <div className="slider-main">
                  <div className="slider-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
                    {galleryImages.map((img, i) => (
                      <div className="slider-slide" key={i}><img src={img} alt={`${selectedCar.brand} ${selectedCar.model}`} /></div>
                    ))}
                  </div>
                  {galleryImages.length > 1 && slideIndex > 0 && <button className="nav-btn prev" onClick={prevSlide}>‹</button>}
                  {galleryImages.length > 1 && slideIndex < galleryImages.length - 1 && <button className="nav-btn next" onClick={nextSlide}>›</button>}
                  <span className="slider-counter">{slideIndex + 1} / {galleryImages.length}</span>
                </div>
              ) : (
                <img src={selectedCar.image} alt={selectedCar.brand} className="cd-main-img" />
              )}
            </div>
          </div>

          <div className="cd-info-card">
            <h1 className="cd-model-name" style={{ fontSize: '2.5rem' }}>{selectedCar.brand} {selectedCar.model}</h1>
            <div className="cd-rating-row">
              <span className="cd-rating-badge">★ {selectedCar.rating || '4.5'}</span>
              <span className="cd-review-text">{selectedCar.reviewCount || '850'} Reviews</span>
            </div>

            <div className="cd-desc-bullets">
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{selectedCar.description}</p>
            </div>

            <div className="cd-price-block">
              <span className="cd-price-val" style={{ fontSize: '2.2rem' }}>{selectedCar.price_range || 'Rs. 10 - 20 Lakh*'}</span>
              {selectedCar.price_subtext && <p className="cd-showroom-text">{selectedCar.price_subtext}</p>}
            </div>

            {selectedCar.brochure_pdf && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <a href={selectedCar.brochure_pdf} target="_blank" rel="noreferrer" className="btn-outline-gold" style={{ padding: '16px 32px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 700, textDecoration: 'none', border: '2px solid var(--bronze)', color: 'var(--bronze)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3"/></svg>
                  Price Book
                </a>
              </div>
            )}

            {/* Transformation Includes */}
            {selectedCar.transformations && selectedCar.transformations.length > 0 && (
              <div className="premium-content-box" style={{ margin: 0, marginTop: selectedCar.brochure_pdf ? 0 : 24 }}>
                <h3 className="box-title">Transformation Includes</h3>
                <ul className="checkmark-list">
                  {selectedCar.transformations.map((t, i) => (
                    <li key={i}><span className="chk-icon">✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Details Grid */}
        <div className="cd-bottom-grid" style={{ marginTop: 40, gap: 30, paddingBottom: 100 }}>
          {/* Left Side: Key Specifications */}
          <div className="cd-bottom-left">
            {specEntries.length > 0 && (
              <div className="cd-specs-box" style={{ height: '100%' }}>
                <h3 className="cd-specs-title">Key Specifications</h3>
                <div style={{ padding: '20px 30px' }}>
                  <div className="cd-specs-grid-v2">
                    {specEntries.map(([key, val]) => (
                      <div className="cd-spec-item-v2" key={key}>
                        <span className="cd-spec-label-v2">{key.replace(/_/g, ' ')}</span>
                        <span className="cd-spec-value-v2">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: FAQ Section */}
          <div className="cd-bottom-right">

            {selectedCar.faq && selectedCar.faq.length > 0 && (
              <div className="premium-content-box" style={{ background: '#fff', margin: 0, height: '100%' }}>
                <h3 className="box-title">Frequently Asked Questions</h3>
                <div className="faq-static-list">
                  {selectedCar.faq.map((item, i) => (
                    <div className="faq-static-item" key={i}>
                      <h4 className="faq-static-q">{item.q}</h4>
                      <p className="faq-static-a">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reel Modal */}
      {reelModal && (
        <div className="reel-modal-overlay" onClick={() => setReelModal(null)}>
          <div className="reel-modal-content" onClick={e => e.stopPropagation()}>
            <div className="reel-iframe-wrap">
              <iframe src={`${reelModal}embed/`} allowFullScreen title="Reel" />
            </div>
            <button className="close-reel" onClick={() => setReelModal(null)}>✕</button>
          </div>
        </div>
      )}

      {/* VIP Enquiry Modal */}
      {showModal && (
        <div className="overlay overlay-blur" onClick={closeCatalog}>
          <div className="vip-modal-container" onClick={e => e.stopPropagation()}>
            <button className="vip-modal-close" onClick={closeCatalog}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="vip-modal-left">
              {selectedCar && (
                <>
                  <div className="vip-modal-bg" style={{ backgroundImage: `url(${selectedCar.image})` }} />
                  <div className="vip-modal-overlay">
                    <div className="vip-modal-badge">{selectedCar.brand}</div>
                    <h3 className="vip-modal-car-title">{selectedCar.model}</h3>
                    <p className="vip-modal-car-desc">Request the complete transformation price catalogue.</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="vip-modal-right">
              <div className="vip-modal-header">
                <h2>Get Price List</h2>
                <p>Where should we send your detailed catalogue?</p>
              </div>

              <form onSubmit={e => { e.preventDefault(); handleCatalogSubmit(); }} className="vip-form">
                <div className="vip-input-group">
                  <label>Full Name</label>
                  <div className="vip-input-wrapper">
                    <svg className="vip-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                  </div>
                </div>

                <div className="vip-input-group">
                  <label>City</label>
                  <div className="vip-input-wrapper">
                    <svg className="vip-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <input value={city} onChange={e => handleCityChange(e.target.value)} placeholder="e.g. Coimbatore" required />
                  </div>
                </div>

                <div className="vip-input-group">
                  <label>Phone Number</label>
                  <div className="vip-input-wrapper">
                    <div className="vip-phone-prefix">+91</div>
                    <input type="tel" maxLength="10" value={phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="98765 43210" required />
                  </div>
                  {phoneError && <span className="vip-error">Please enter a valid 10-digit number</span>}
                </div>

                <button className="btn-vip-submit" type="submit" disabled={!name.trim() || !city.trim() || phone.length < 10}>
                  Get Price List
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div className="vip-trust-badges">
                  <span className="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Secure Details</span>
                  <span className="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Quick Callback</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Float */}
      <a className="wa-float" href="https://wa.me/919688443333" target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}

export default App;
