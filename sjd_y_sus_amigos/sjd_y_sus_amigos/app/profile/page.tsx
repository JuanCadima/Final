'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAppContext } from '../../hooks/AppContext';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, walkers, addBooking, addReview, isLoading } = useAppContext();

  // ✅ ALL hooks must be called unconditionally at the top — Rules of Hooks
  const [serviceType, setServiceType] = useState<'standard' | 'adventure'>('standard');
  const [date, setDate] = useState('Mar 15');
  const [time, setTime] = useState('Mediodía');
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [newStars, setNewStars] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addReview(walker.id, newStars, newComment);
      setNewComment('');
      setNewStars(5);
      setReviewMsg('¡Gracias! Tu reseña ha sido publicada con éxito.');
      setTimeout(() => setReviewMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setReviewMsg('Ocurrió un error al enviar tu reseña.');
    }
  };

  // Find walker by id from query params, fallback to first walker
  const walkerId = searchParams.get('id') || 'sarah-mitchell';
  const walker = walkers.find(w => w.id === walkerId) || walkers[0];

  // Early returns AFTER all hooks are declared
  if (isLoading) {
    return (
      <div style={{textAlign: 'center', padding: '4rem 0', color: '#666'}}>
        <p>Cargando perfil del paseador...</p>
      </div>
    );
  }

  if (!walker) {
    return (
      <div style={{textAlign: 'center', padding: '4rem 0', color: '#666'}}>
        <p>Paseador no encontrado.</p>
      </div>
    );
  }

  const price = serviceType === 'adventure' ? walker.price + 20 : walker.price;
  const serviceName = serviceType === 'adventure' ? 'La Hora de la Aventura' : 'Paseo Estándar de 30 min';

  const handleReserve = () => {
    if (!user) {
      router.push(`/login`);
      return;
    }
    addBooking({
      walkerName: walker.name,
      service: serviceName,
      date,
      time,
      price
    });
    router.push('/dashboard');
  };

  const DATES = [
    { day: 'Mon', num: '14' },
    { day: 'Tue', num: '15' },
    { day: 'Wed', num: '16' },
    { day: 'Thu', num: '17' }
  ];

  const TIMES = ['Morning', 'Mid-day', 'Afternoon', 'Evening'];

  return (
    <main className="container" style={{paddingTop: '2rem'}}>
      <div className="profile-header">
        <div className="profile-img-container">
          <img src={walker.imageUrl} alt={walker.name} className="profile-img" />
          {walker.rating >= 4.9 && (
            <div className="top-rated-badge">
              ⭐ PASEADOR EXCELENTE
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-location">
            {walker.location} • <span className="profile-stars">{'★'.repeat(Math.round(walker.rating))}</span> <span className="profile-reviews-count">({walker.reviewsCount} Reseñas)</span>
          </div>
          <h1>{walker.name}</h1>
          <p className="profile-tagline">{walker.tagline}</p>
        </div>
      </div>
      
      <div className="profile-layout">
        <div className="profile-main">
          
          <section className="section-box">
            <h3><div className="section-icon">👤</div> Sobre Mí</h3>
            <div className="about-box">
              {walker.aboutParagraphs.map((para, idx) => (
                <p key={idx} style={idx === walker.aboutParagraphs.length - 1 ? {margin: 0} : {}}>{para}</p>
              ))}
            </div>
          </section>
          
          <section className="section-box">
            <h3><div className="section-icon green">📸</div> Un Día en la Vida</h3>
            <div className="day-grid">
              <div className="day-img-lg">
                <img src={walker.photos.large} alt={`${walker.name} con perro`} />
              </div>
              <div className="day-img-sm-1">
                <img src={walker.photos.sm1} alt="Perro pequeño corriendo" />
              </div>
              <div className="day-img-sm-2">
                <img src={walker.photos.sm2} alt="Cara de perro feliz" />
              </div>
              <div className="day-img-tall">
                <img src={walker.photos.tall} alt={`${walker.name} paseando`} />
              </div>
            </div>
          </section>
          
          <section className="section-box">
            <h3><div className="section-icon">🏅</div> Experiencia</h3>
            <div className="exp-list">
              {walker.experience.map((exp, idx) => (
                <div key={idx} className="exp-item">
                  <div className="exp-icon" style={{background: exp.bg, color: exp.color}}>{exp.icon}</div>
                  <div className="exp-info">
                    <h4>{exp.title}</h4>
                    <p>{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="section-box">
            <h3><div className="section-icon">🏷️</div> Servicios y Precios</h3>
            <div className="pricing-grid">
              <div className={`price-card ${serviceType === 'standard' ? 'highlight' : ''}`} onClick={() => setServiceType('standard')} style={{cursor: 'pointer'}}>
                <div className="price-header">
                  <h4>Paseo Estándar de 30 min</h4>
                  <span className="price">${walker.price}</span>
                </div>
                <p>Ideal para estirar las patas al mediodía y un descanso para ir al baño. Incluye recarga de agua y fotos actualizadas.</p>
                <ul className="price-features">
                  <li>Atención personalizada (1 a 1)</li>
                  <li>Seguimiento de Ruta por GPS</li>
                </ul>
              </div>
              
              <div className={`price-card ${serviceType === 'adventure' ? 'highlight' : ''}`} onClick={() => setServiceType('adventure')} style={{cursor: 'pointer'}}>
                <div className="price-header">
                  <h4>La Hora de la Aventura</h4>
                  <span className="price">${walker.price + 20}</span>
                </div>
                <p>60 minutos de exploración de alta energía o tiempo en parque de socialización. Ideal para razas activas.</p>
                <ul className="price-features">
                  <li>Tiempo de juego extendido</li>
                  <li>Cepillado incluido</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section className="section-box">
            <div className="reviews-header">
              <h3><div className="section-icon green">💬</div> Reseñas</h3>
              <button 
                onClick={() => setShowReviewsModal(true)}
                style={{background: 'none', border: 'none', fontSize: '0.85rem', color: '#a54605', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'}}
              >
                Ver las {walker.reviewsCount} Reseñas →
              </button>
            </div>
            
            {walker.reviews.map((rev, idx) => (
              <div key={idx} className="review-item">
                <div className="review-author">
                  <div className="avatar-sm" style={{width: 36, height: 36, borderRadius: '50%', background: '#ccc', overflow: 'hidden'}}>
                    <img src={rev.avatar} alt={rev.author} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                  <div>
                    <div style={{fontWeight: 600, fontSize: '0.85rem'}}>{rev.author}</div>
                    <div className="stars" style={{fontSize: '0.7rem', color: '#8a7322', letterSpacing: '1px'}}>{'★'.repeat(rev.stars)}</div>
                  </div>
                </div>
                <p className="review-quote">"{rev.quote}"</p>
              </div>
            ))}

            {/* Formulario de Calificación */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #eae7de',
            }}>
              <h4 style={{fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 600, color: '#222'}}>Dejar una Calificación y Reseña</h4>
              {user ? (
                <form onSubmit={handleReviewSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#555'}}>Tu Calificación:</label>
                    <div style={{display: 'flex', gap: '0.25rem'}}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewStars(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: star <= newStars ? '#8a7322' : '#ccc',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: '#555'}}>Tu Reseña:</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu opinión sobre el paseo o la atención..."
                      required
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        color: '#222',
                        backgroundColor: '#fff'
                      }}
                    />
                  </div>
                  {reviewMsg && <p style={{fontSize: '0.85rem', color: '#5a8a29', margin: 0, fontWeight: 500}}>{reviewMsg}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{alignSelf: 'flex-start', padding: '0.5rem 1.5rem', fontSize: '0.85rem'}}
                  >
                    Enviar Reseña
                  </button>
                </form>
              ) : (
                <p style={{fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: 0}}>
                  Inicia sesión como cliente para poder calificar y dejar una reseña a este paseador.
                </p>
              )}
            </div>
          </section>
        </div>
        <aside className="profile-sidebar">
          <div className="booking-sidebar-container">
            <div className="booking-sidebar">
              <h3>Reservar con {walker.name.split(' ')[0]}</h3>
              
              <div className="form-group">
                <label className="form-label">Tipo de Servicio</label>
                <select 
                  className="form-select" 
                  value={serviceType} 
                  onChange={e => setServiceType(e.target.value as 'standard' | 'adventure')}
                  style={{background: '#fff', color: '#222'}}
                >
                  <option value="standard">Paseo Estándar de 30 min - ${walker.price}</option>
                  <option value="adventure">La Hora de la Aventura - ${walker.price + 20}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <div className="dates-grid">
                  {DATES.map(d => {
                    const dateStr = `${d.day} ${d.num}`;
                    return (
                      <button 
                        key={dateStr}
                        className={`date-btn ${date === dateStr ? 'active' : ''}`}
                        onClick={() => setDate(dateStr)}
                      >
                        <span className="date-day">{d.day === 'Mon' ? 'Lun' : d.day === 'Tue' ? 'Mar' : d.day === 'Wed' ? 'Mié' : 'Jue'}</span>
                        <span className="date-num">{d.num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Horario Preferido</label>
                <div className="times-grid">
                  {TIMES.map(t => {
                    const transTime = t === 'Morning' ? 'Mañana' : t === 'Mid-day' ? 'Mediodía' : t === 'Afternoon' ? 'Tarde' : 'Noche';
                    return (
                      <button 
                        key={t}
                        className="time-btn" 
                        style={time === t ? {background: '#white', borderColor: '#a54605', backgroundColor: '#fff', border: '2px solid #a54605'} : {}}
                        onClick={() => setTime(t)}
                      >
                        {transTime}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="estimate">
                <span>Estimación Total</span>
                <strong>${price.toFixed(2)}</strong>
              </div>
              
              <button className="btn btn-primary btn-block" onClick={handleReserve}>Solicitar Reserva</button>
              <div style={{textAlign: 'center', fontSize: '0.7rem', color: '#888', marginTop: '0.5rem'}}>
                No se te cobrará hasta que {walker.name.split(' ')[0]} acepte tu solicitud.
              </div>
              
              <div className="guarantee">
                <div className="guarantee-icon">🛡️</div>
                <div>
                  <strong style={{color: '#222', display: 'block', marginBottom: '2px'}}>Garantía Paws&Pause</strong>
                  Incluye seguro premium y soporte las 24 horas.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showReviewsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            padding: '2.5rem',
            borderRadius: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <button 
              onClick={() => setShowReviewsModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem', right: '1.5rem',
                background: 'none', border: 'none',
                fontSize: '1.5rem', cursor: 'pointer',
                color: '#666',
                outline: 'none'
              }}
            >
              ×
            </button>
            <h3 style={{fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', color: '#222'}}>
              Todas las Reseñas ({walker.reviewsCount})
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {walker.reviews.map((rev, i) => (
                <div key={i} style={{borderBottom: '1px solid #eee', paddingBottom: '1rem', color: '#333'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                    <img src={rev.avatar} alt={rev.author} style={{width: 36, height: 36, borderRadius: '50%', objectFit: 'cover'}} />
                    <div>
                      <strong style={{fontSize: '0.9rem'}}>{rev.author}</strong>
                      <div style={{color: '#8a7322', fontSize: '0.75rem'}}>{'★'.repeat(rev.stars)}</div>
                    </div>
                  </div>
                  <p style={{fontStyle: 'italic', fontSize: '0.95rem', color: '#444', margin: 0}}>" {rev.quote} "</p>
                </div>
              ))}
              {/* Extra mock review to look complete */}
              <div style={{paddingBottom: '1rem', color: '#333'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                  <div style={{width: 36, height: 36, borderRadius: '50%', background: '#eae7de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#555'}}>AM</div>
                  <div>
                    <strong style={{fontSize: '0.9rem'}}>Anna M. & 'Bella'</strong>
                    <div style={{color: '#8a7322', fontSize: '0.75rem'}}>★★★★★</div>
                  </div>
                </div>
                <p style={{fontStyle: 'italic', fontSize: '0.95rem', color: '#444', margin: 0}}>"Servicio absolutamente fenomenal. Siempre a tiempo, envía las mejores fotos y realmente ama a los perros. ¡No puedo recomendarlo lo suficiente!"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="container" style={{paddingTop: '3rem', minHeight: '80vh', textAlign: 'center'}}>
          <p>Cargando perfil del paseador...</p>
        </div>
      }>
        <ProfileContent />
      </Suspense>
      <Footer />
    </>
  );
}
