import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3000';

function AdminApp() {
  const [cars, setCars] = useState([]);
  const [leads, setLeads] = useState([]);
  const [adminTab, setAdminTab] = useState('cars');
  const [customerSearch, setCustomerSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [editingCarId, setEditingCarId] = useState(null);
  const [homeSettings, setHomeSettings] = useState({ 
    hero_title: '', 
    hero_subtitle: '', 
    faqs: [] 
  });

  const emptyForm = {
    id: '',
    brand: 'Hyundai',
    model: '',
    badge: '',
    image: '',
    price_range: '',
    price_subtext: '',
    brochure_pdf: '',
    description: '',
    galleries: [{ title: 'Exterior', images: [] }],
    specs: { engine: '', torque: '', drive_type: '', power: '', seating: '', fuel: '' },
    transformations: [''],
    reels: [],
    reels_section_title: '',
    faq: [{ q: '', a: '' }],
    reviews: [],
    rating: '',
    reviewCount: ''
  };

  const [formState, setFormState] = useState({ ...emptyForm });

  /* ─── LOAD DATA ─── */
  useEffect(() => {
    fetch(`${API_BASE}/api/cars`).then(r => r.json()).then(data => {
      setCars(data.filter(item => item.brand && item.model));
    }).catch(() => {});
    fetch(`${API_BASE}/api/leads`).then(r => r.json()).then(data => {
      setLeads(Array.isArray(data) ? data : []);
    }).catch(() => {});
    fetch(`${API_BASE}/api/home`).then(r => r.json()).then(data => {
      setHomeSettings(data || { hero_title: '', hero_subtitle: '', faqs: [] });
    }).catch(() => {});
  }, []);

  /* ─── SAVE CARS ─── */
  async function saveCars(updatedCars) {
    setSaving(true);
    setSaveStatus('');
    try {
      await fetch(`${API_BASE}/api/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCars)
      });
      setCars(updatedCars);
      setSaveStatus('✓ Saved!');
    } catch {
      setSaveStatus('✗ Error saving');
    }
    setSaving(false);
    setTimeout(() => setSaveStatus(''), 3000);
  }

  async function handleSaveHomeSettings() {
    setSaving(true);
    setSaveStatus('');
    try {
      await fetch(`${API_BASE}/api/home`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homeSettings)
      });
      setSaveStatus('✓ Home Settings Saved!');
    } catch {
      setSaveStatus('✗ Error saving settings');
    }
    setSaving(false);
    setTimeout(() => setSaveStatus(''), 3000);
  }

  /* ─── FORM HELPERS ─── */
  function resetForm() { setFormState({ ...emptyForm }); setEditingCarId(null); }

  function updateForm(field, value) {
    setFormState(prev => ({ ...prev, [field]: value }));
  }

  function updateSpec(key, value) {
    setFormState(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  }

  function updateTransformation(i, value) {
    setFormState(prev => {
      const t = [...prev.transformations];
      t[i] = value;
      return { ...prev, transformations: t };
    });
  }

  function addTransformation() {
    setFormState(prev => ({ ...prev, transformations: [...prev.transformations, ''] }));
  }

  function removeTransformation(i) {
    setFormState(prev => ({ ...prev, transformations: prev.transformations.filter((_, idx) => idx !== i) }));
  }

  function updateFaq(i, field, value) {
    setFormState(prev => {
      const faq = [...prev.faq];
      faq[i] = { ...faq[i], [field]: value };
      return { ...prev, faq };
    });
  }

  function addFaq() {
    setFormState(prev => ({ ...prev, faq: [...prev.faq, { q: '', a: '' }] }));
  }

  function removeFaq(i) {
    setFormState(prev => ({ ...prev, faq: prev.faq.filter((_, idx) => idx !== i) }));
  }

  /* Gallery helpers */
  function addGallery() {
    setFormState(prev => ({ ...prev, galleries: [...prev.galleries, { title: '', images: [] }] }));
  }

  function removeGallery(i) {
    setFormState(prev => ({ ...prev, galleries: prev.galleries.filter((_, idx) => idx !== i) }));
  }

  function updateGalleryTitle(i, title) {
    setFormState(prev => {
      const g = [...prev.galleries];
      g[i] = { ...g[i], title };
      return { ...prev, galleries: g };
    });
  }

  function addGalleryImage(gi) {
    setFormState(prev => {
      const g = [...prev.galleries];
      g[gi] = { ...g[gi], images: [...g[gi].images, ''] }; // Add empty slot
      return { ...prev, galleries: g };
    });
  }

  function updateGalleryImage(gi, ii, url) {
    setFormState(prev => {
      const g = [...prev.galleries];
      g[gi] = { ...g[gi], images: g[gi].images.map((img, idx) => idx === ii ? url : img) };
      return { ...prev, galleries: g };
    });
  }

  function removeGalleryImage(gi, ii) {
    setFormState(prev => {
      const g = [...prev.galleries];
      g[gi] = { ...g[gi], images: g[gi].images.filter((_, idx) => idx !== ii) };
      return { ...prev, galleries: g };
    });
  }

  /* Reel helpers */
  function addReel() {
    setFormState(prev => ({ ...prev, reels: [...prev.reels, { url: '', image: '', title: '' }] }));
  }

  function removeReel(i) {
    setFormState(prev => ({ ...prev, reels: prev.reels.filter((_, idx) => idx !== i) }));
  }

  function updateReel(i, field, value) {
    setFormState(prev => {
      const r = [...prev.reels];
      r[i] = { ...r[i], [field]: value };
      return { ...prev, reels: r };
    });
  }

  /* Home Settings Helpers */
  function updateHomeField(field, value) {
    setHomeSettings(prev => ({ ...prev, [field]: value }));
  }

  function updateHomeFaq(i, field, value) {
    setHomeSettings(prev => {
      const faqs = [...prev.faqs];
      faqs[i] = { ...faqs[i], [field]: value };
      return { ...prev, faqs };
    });
  }

  function addHomeFaq() {
    setHomeSettings(prev => ({ ...prev, faqs: [...prev.faqs, { q: '', a: '' }] }));
  }

  function removeHomeFaq(i) {
    setHomeSettings(prev => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }));
  }

  /* ─── ADD / EDIT ─── */
  function handleSaveCar() {
    if (!formState.brand || !formState.model || !formState.image) {
      alert('Brand, Model, and Image URL are required.');
      return;
    }

    const carData = {
      ...formState,
      transformations: formState.transformations.filter(t => t.trim()),
      faq: formState.faq.filter(f => f.q.trim() || f.a.trim())
    };

    let updated;
    if (editingCarId) {
      updated = cars.map(c => c.id === editingCarId ? { ...carData, id: editingCarId } : c);
    } else {
      carData.id = `car-${Date.now()}`;
      updated = [carData, ...cars];
    }

    saveCars(updated);
    setAdminTab('cars');
    resetForm();
  }

  function handleEditCar(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    setFormState({
      ...emptyForm,
      ...car,
      galleries: car.galleries || [{ title: 'Exterior', images: car.image ? [car.image] : [] }],
      specs: { ...emptyForm.specs, ...(car.specs || {}) },
      transformations: car.transformations?.length ? car.transformations : [''],
      reels: car.reels || [],
      faq: car.faq?.length ? car.faq : [{ q: '', a: '' }]
    });
    setEditingCarId(id);
    setAdminTab('add');
  }

  function handleDeleteCar(id) {
    if (!window.confirm('Delete this car permanently?')) return;
    saveCars(cars.filter(c => c.id !== id));
  }

  async function handleDeleteLead(id) {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await fetch(`${API_BASE}/api/leads/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setLeads(leads.filter(l => l.id !== id));
    } catch {
      alert('Failed to delete lead');
    }
  }

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  /* ─── IMAGE UPLOAD ─── */
  async function handleUploadImage(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'X-Filename': file.name },
          body: file
        });
        const data = await res.json();
        if (data.url) callback(data.url);
      } catch (err) {
        alert('Upload failed');
      }
    };
    input.click();
  }

  /* ─── RENDER ─── */
  const filteredLeads = leads.filter(lead =>
    (lead.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (lead.phone || '').includes(customerSearch)
  );

  const todayLeadsCount = leads.filter(l => isToday(l.timestamp)).length;

  return (
    <div className="admin-shell-premium">
      {/* Header */}
      <header className="admin-header-premium">
        <div className="admin-header-inner">
          <div>
            <h1 className="admin-brand-title">CARPULLZ<span className="bronze-text">ADMIN</span></h1>
            <p className="admin-tagline">Management Dashboard</p>
          </div>
          <div className="admin-status">
            <span className="status-dot" />
            System Online
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="admin-nav-bar">
        <div className="admin-nav-inner">
          <button className={`admin-tab ${adminTab === 'cars' ? 'active' : ''}`} onClick={() => setAdminTab('cars')}>🚗 Cars</button>
          <button className={`admin-tab ${adminTab === 'add' ? 'active' : ''}`} onClick={() => { setAdminTab('add'); resetForm(); }}>➕ Add Car</button>
          <button className={`admin-tab ${adminTab === 'customers' ? 'active' : ''}`} onClick={() => setAdminTab('customers')}>👥 Customers</button>
          <button className={`admin-tab ${adminTab === 'settings' ? 'active' : ''}`} onClick={() => setAdminTab('settings')}>⚙️ Settings</button>
        </div>
      </nav>

      <main className="admin-main">
        {saveStatus && <div style={{ background: saveStatus.includes('✓') ? '#dcfce7' : '#fee2e2', padding: '12px 20px', borderRadius: 12, marginBottom: 20, fontWeight: 700, color: saveStatus.includes('✓') ? '#166534' : '#991b1b' }}>{saveStatus}</div>}

        {/* ── Cars Tab ── */}
        {adminTab === 'cars' && (
          <section>
            <div className="tab-header">
              <h2 className="tab-title">Cars <span className="count-pill">{cars.length}</span></h2>
            </div>
            <div className="cars-grid">
              {cars.map(car => (
                <div className="car-admin-card" key={car.id}>
                  <div className="car-admin-img-wrap">
                    <img src={car.image} alt={`${car.brand} ${car.model}`} />
                  </div>
                  <div className="car-admin-body">
                    <div className="car-admin-brand">{car.brand}</div>
                    <h3 className="car-admin-model">{car.model}</h3>
                    {car.price_range && <div style={{ color: '#a46d44', fontWeight: 700, marginBottom: 12 }}>{car.price_range}</div>}
                    <div className="card-btns">
                      <button className="btn-outline-sm" onClick={() => handleEditCar(car.id)}>Edit</button>
                      <button className="btn-danger-sm" onClick={() => handleDeleteCar(car.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Add/Edit Car Tab ── */}
        {adminTab === 'add' && (
          <section className="admin-form-container">
            <div className="tab-header-premium">
              <h2 className="tab-title-premium">{editingCarId ? '✏️ Edit Car' : '➕ Add New Car'}</h2>
            </div>

            <div className="form-sections-grid">
              {/* Basic Info */}
              <div className="form-card-premium">
                <h3 className="section-card-title">Basic Information</h3>
                <p className="section-hint">Core car details visible on the main page</p>
                <div className="form-grid-2">
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Brand *</label>
                    <select className="premium-select-box" value={formState.brand} onChange={e => updateForm('brand', e.target.value)}>
                      {['Hyundai', 'Maruti Suzuki', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Model *</label>
                    <input className="premium-input" value={formState.model} onChange={e => updateForm('model', e.target.value)} placeholder="e.g. Seltos" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Badge</label>
                    <input className="premium-input" value={formState.badge} onChange={e => updateForm('badge', e.target.value)} placeholder="Popular, Trending, New" />
                  </div>
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Main Image URL *</label>
                    <input className="premium-input" value={formState.image} onChange={e => updateForm('image', e.target.value)} placeholder="https://..." />
                    <button className="btn-outline-premium" style={{ marginTop: 8 }} onClick={() => handleUploadImage(url => updateForm('image', url))}>📤 Upload Image</button>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Price Range</label>
                    <input className="premium-input" value={formState.price_range} onChange={e => updateForm('price_range', e.target.value)} placeholder="Rs. 10 - 20 Lakh*" />
                  </div>
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Price Subtext</label>
                    <input className="premium-input" value={formState.price_subtext} onChange={e => updateForm('price_subtext', e.target.value)} placeholder="*Ex-showroom" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Rating (e.g. 4.7)</label>
                    <input className="premium-input" value={formState.rating} onChange={e => updateForm('rating', e.target.value)} placeholder="4.7" />
                  </div>
                  <div className="fgroup-premium">
                    <label className="flabel-premium">Review Count</label>
                    <input className="premium-input" value={formState.reviewCount} onChange={e => updateForm('reviewCount', e.target.value)} placeholder="1200" />
                  </div>
                </div>
                <div className="fgroup-premium">
                  <label className="flabel-premium">Description</label>
                  <textarea className="premium-textarea" value={formState.description} onChange={e => updateForm('description', e.target.value)} rows="3" placeholder="Car description..." />
                </div>
                <div className="fgroup-premium">
                  <label className="flabel-premium">Brochure PDF URL</label>
                  <input className="premium-input" value={formState.brochure_pdf} onChange={e => updateForm('brochure_pdf', e.target.value)} placeholder="https://..." />
                  <button className="btn-outline-premium" style={{ marginTop: 8 }} onClick={() => handleUploadImage(url => updateForm('brochure_pdf', url))}>📤 Upload PDF</button>
                </div>
              </div>

              {/* Specs */}
              <div className="form-card-premium">
                <h3 className="section-card-title">Key Specifications</h3>
                <div className="form-grid-3">
                  {Object.keys(emptyForm.specs).map(key => (
                    <div className="fgroup-premium" key={key}>
                      <label className="flabel-premium-small">{key.replace(/_/g, ' ')}</label>
                      <input className="premium-input" value={formState.specs[key] || ''} onChange={e => updateSpec(key, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Galleries */}
              <div className="form-card-premium">
                <div className="section-header-flex-premium">
                  <h3 className="section-card-title">Photo Galleries</h3>
                  <button className="btn-add-mini-gold" onClick={addGallery}>+ Add Gallery</button>
                </div>
                {formState.galleries.map((gallery, gi) => (
                  <div className="gallery-sector-card-premium" key={gi}>
                    <div className="sector-header-premium">
                      <div className="sector-title-group">
                        <input className="premium-input-title" value={gallery.title} onChange={e => updateGalleryTitle(gi, e.target.value)} placeholder="Gallery title..." />
                      </div>
                      <div className="sector-actions-premium">
                        <button className="btn-add-mini" onClick={() => addGalleryImage(gi)}>+ Add Image</button>
                        {formState.galleries.length > 1 && <button className="btn-remove-sector" onClick={() => removeGallery(gi)}>✕</button>}
                      </div>
                    </div>
                    <div className="gallery-edit-grid">
                      {gallery.images.map((img, ii) => (
                        <div className="gallery-edit-item-premium" key={ii}>
                          <div className="gallery-item-image-preview">
                            {img ? <img src={img} alt="" /> : <div className="no-image-placeholder">No Image</div>}
                            <button className="btn-remove-mini-abs" onClick={() => removeGalleryImage(gi, ii)}>✕</button>
                          </div>
                          <div className="gallery-item-controls">
                            <input 
                              className="premium-input-sm" 
                              value={img} 
                              onChange={e => updateGalleryImage(gi, ii, e.target.value)} 
                              placeholder="Image URL..." 
                            />
                            <button className="btn-picker-premium-sm" onClick={() => handleUploadImage(url => updateGalleryImage(gi, ii, url))}>
                              📤
                            </button>
                          </div>
                        </div>
                      ))}
                      {gallery.images.length === 0 && <p className="empty-hint">No images added yet. Click "+ Add Image".</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transformations */}
              <div className="form-card-premium">
                <h3 className="section-card-title">Transformations</h3>
                <p className="section-hint">List of transformation features included</p>
                <div className="list-builder-premium">
                  {formState.transformations.map((t, i) => (
                    <div className="list-item-premium" key={i}>
                      <input className="premium-input" value={t} onChange={e => updateTransformation(i, e.target.value)} placeholder="e.g. Full Body Kit Upgrade" style={{ flex: 1 }} />
                      {formState.transformations.length > 1 && <button className="btn-remove-sector" onClick={() => removeTransformation(i)}>✕</button>}
                    </div>
                  ))}
                  <button className="btn-add-mini" onClick={addTransformation}>+ Add Item</button>
                </div>
              </div>

              {/* Reels */}
              <div className="form-card-premium">
                <div className="section-header-flex-premium">
                  <h3 className="section-card-title">Reels / Videos</h3>
                  <button className="btn-add-mini-gold" onClick={addReel}>+ Add Reel</button>
                </div>
                <div className="fgroup-premium">
                  <label className="flabel-premium">Reels Section Title</label>
                  <input className="premium-input" value={formState.reels_section_title} onChange={e => updateForm('reels_section_title', e.target.value)} placeholder="Transformation Reels" />
                </div>
                <div className="reels-builder-premium">
                  {formState.reels.map((reel, i) => (
                    <div className="reel-card-premium" key={i}>
                      <div className="reel-card-header">
                        <h5>🎬 Reel {i + 1}</h5>
                        <button className="btn-remove-sector" onClick={() => removeReel(i)}>✕</button>
                      </div>
                      <div className="fgroup-premium">
                        <label className="flabel-premium-small">Reel Title</label>
                        <input className="premium-input" value={reel.title || ''} onChange={e => updateReel(i, 'title', e.target.value)} placeholder="e.g. Creta Full Body Wrap" />
                      </div>
                      <div className="form-grid-2" style={{ marginBottom: 0 }}>
                        <div className="fgroup-premium">
                          <label className="flabel-premium-small">Reel / YouTube Shorts URL (Required)</label>
                          <input className="premium-input" value={reel.url || ''} onChange={e => updateReel(i, 'url', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="fgroup-premium">
                          <label className="flabel-premium-small">Custom Thumbnail (Optional)</label>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <input className="premium-input" value={reel.image || ''} onChange={e => updateReel(i, 'image', e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
                            <button className="btn-picker-premium" onClick={() => handleUploadImage(url => updateReel(i, 'image', url))}>📤</button>
                          </div>
                        </div>
                      </div>
                      {reel.image && (
                        <div style={{ marginTop: 10 }}>
                          <img src={reel.image} alt="Thumb" style={{ width: 60, height: 100, borderRadius: 8, objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  ))}
                  {formState.reels.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>No reels added yet</p>}
                </div>
              </div>

              {/* FAQ */}
              <div className="form-card-premium">
                <div className="section-header-flex-premium">
                  <h3 className="section-card-title">FAQ</h3>
                  <button className="btn-add-mini-gold" onClick={addFaq}>+ Add FAQ</button>
                </div>
                <div className="faq-builder-stack">
                  {formState.faq.map((item, i) => (
                    <div className="faq-item-premium-editor" key={i}>
                      <div className="faq-edit-header">
                        <span style={{ fontWeight: 800, color: '#475569' }}>FAQ {i + 1}</span>
                        {formState.faq.length > 1 && <button className="btn-remove-sector" onClick={() => removeFaq(i)}>✕</button>}
                      </div>
                      <input className="premium-input" value={item.q} onChange={e => updateFaq(i, 'q', e.target.value)} placeholder="Question" style={{ marginTop: 10 }} />
                      <textarea className="premium-textarea" value={item.a} onChange={e => updateFaq(i, 'a', e.target.value)} placeholder="Answer" rows="2" style={{ marginTop: 10 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="form-sticky-footer-premium">
              <span className="footer-status-pill">
                {!formState.brand || !formState.model || !formState.image ?
                  <span className="status-err">⚠ Brand, Model & Image required</span> :
                  <span className="status-ok">✓ Ready to save</span>
                }
              </span>
              <div className="footer-actions">
                <button className="btn-cancel-premium" onClick={() => { setAdminTab('cars'); resetForm(); }}>Cancel</button>
                <button className="btn-save-premium-xl" disabled={saving} onClick={handleSaveCar}>
                  {saving ? 'Saving...' : (editingCarId ? 'Update Car' : 'Add Car')}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Customers Tab ── */}
        {adminTab === 'customers' && (
          <section>
            <div className="tab-header">
              <h2 className="tab-title">
                Customers <span className="count-pill">{leads.length}</span>
                {todayLeadsCount > 0 && <span className="today-count-pill">Today: {todayLeadsCount}</span>}
              </h2>
              <a href={`${API_BASE}/api/export`} className="btn-outline-premium" download>📥 Export All Data</a>
            </div>
            <div className="search-row-premium">
              <div className="search-box-premium">
                <svg className="search-p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input className="premium-search-inp" type="text" placeholder="Search by name or phone..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Car</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, i) => {
                    const today = isToday(lead.timestamp);
                    return (
                      <tr key={lead.id || i} style={{ background: today ? '#fffbf0' : 'transparent' }}>
                        <td>{i + 1} {today && <span style={{ background: '#a46d44', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 4, marginLeft: 5 }}>TODAY</span>}</td>
                        <td style={{ fontWeight: 700 }}>{lead.name}</td>
                        <td><a href={`tel:${lead.phone}`} className="phone-link">{lead.phone}</a></td>
                        <td>{lead.city}</td>
                        <td>{lead.brand} {lead.model}</td>
                        <td>{lead.timestamp ? new Date(lead.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                        <td>
                          <button className="btn-danger-sm" onClick={() => handleDeleteLead(lead.id)} style={{ padding: '6px 10px' }}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No leads found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Settings Tab ── */}
        {adminTab === 'settings' && (
          <section className="admin-form-container">
            <div className="tab-header-premium">
              <h2 className="tab-title-premium">⚙️ Home Page Settings</h2>
              {saveStatus && <div className="inline-save-status">{saveStatus}</div>}
            </div>

            <div className="form-sections-grid">
              {/* Hero Section */}
              <div className="form-card-premium">
                <h3 className="section-card-title">Hero Section</h3>
                <p className="section-hint">The main headline and subtitle at the top of the landing page</p>
                <div className="fgroup-premium">
                  <label className="flabel-premium">Hero Title</label>
                  <input className="premium-input" value={homeSettings.hero_title || ''} onChange={e => updateHomeField('hero_title', e.target.value)} placeholder="e.g. Premium Car Transformations" />
                </div>
                <div className="fgroup-premium">
                  <label className="flabel-premium">Hero Subtitle</label>
                  <textarea className="premium-textarea" value={homeSettings.hero_subtitle || ''} onChange={e => updateHomeField('hero_subtitle', e.target.value)} rows="3" placeholder="Description under the title..." />
                </div>
              </div>

              {/* Home FAQs */}
              <div className="form-card-premium">
                <div className="section-header-flex-premium">
                  <h3 className="section-card-title">Home Page FAQs</h3>
                  <button className="btn-add-mini-gold" onClick={addHomeFaq}>+ Add FAQ</button>
                </div>
                <p className="section-hint">These FAQs appear on the main landing page</p>
                <div className="faq-builder-stack">
                  {(homeSettings.faqs || []).map((item, i) => (
                    <div className="faq-item-premium-editor" key={i}>
                      <div className="faq-edit-header">
                        <span style={{ fontWeight: 800, color: '#475569' }}>FAQ {i + 1}</span>
                        <button className="btn-remove-sector" onClick={() => removeHomeFaq(i)}>✕</button>
                      </div>
                      <input className="premium-input" value={item.q} onChange={e => updateHomeFaq(i, 'q', e.target.value)} placeholder="Question" style={{ marginTop: 10 }} />
                      <textarea className="premium-textarea" value={item.a} onChange={e => updateHomeFaq(i, 'a', e.target.value)} placeholder="Answer" rows="2" style={{ marginTop: 10 }} />
                    </div>
                  ))}
                  {(homeSettings.faqs || []).length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>No FAQs added yet</p>}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="form-sticky-footer-premium">
              <span className="footer-status-pill">
                <span className="status-ok">✓ Draft matches local server preferences</span>
              </span>
              <div className="footer-actions">
                <button className="btn-cancel-premium" onClick={() => setAdminTab('cars')}>Cancel</button>
                <button className="btn-save-premium-xl" disabled={saving} onClick={handleSaveHomeSettings}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminApp;
