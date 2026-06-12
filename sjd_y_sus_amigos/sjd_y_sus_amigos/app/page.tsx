'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    stars: '★★★★★',
    quote: '"Paws&Pause cambió mi forma de pensar sobre el cuidado de mascotas. Los paseadores son verdaderos profesionales que tratan a mi Corgi como a la realeza."',
    name: 'Sarah Jenkins',
    role: 'Madre de Oliver',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    colorClass: 'orange'
  },
  {
    id: 2,
    stars: '★★★★★',
    quote: '"La atención al detalle es inigualable. Me encanta recibir las fotos de estilo editorial de las aventuras de Luna mientras estoy en el trabajo."',
    name: 'David Chen',
    role: 'Padre de Luna',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    colorClass: 'green'
  },
  {
    id: 3,
    stars: '★★★★★',
    quote: '"La seguridad era mi principal preocupación, pero el proceso de verificación en Paws&Pause me dio total confianza de inmediato."',
    name: 'Elena Rodriguez',
    role: 'Madre de Max',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    colorClass: 'yellow'
  }
];

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotateNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTestimonials((prev) => [...prev.slice(1), prev[0]]);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const rotatePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTestimonials((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <>
      <Navbar />
      
      <main style={{position: 'relative'}}>
        <div className="home-bg-top"></div>
        
        <section className="hero container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="kicker">El Santuario Selecto</span>
              <h1>
                El estándar de oro<br />
                <span className="italic-serif">para tu mejor amigo.</span>
              </h1>
              <p>
                Más que un paseo. Ofrecemos un cuidado de alta gama y calidad editorial para mascotas que merecen una experiencia de estilo de vida premium.
              </p>
              <div className="hero-btns">
                <a href="/walkers" className="btn btn-primary">Buscar un Paseador</a>
                <a href="#services" className="btn btn-secondary">Explorar Servicios</a>
              </div>
            </div>
            
            <div className="hero-images">
              <div className="img-card img-1">
                <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600" alt="Perro feliz corriendo" />
              </div>
              <div className="img-card img-2">
                <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400" alt="Perro sentado" />
              </div>
              
              <div className="floating-card">
                <span className="floating-tag">Servicio Premium</span>
                <span className="floating-text">Seguimiento GPS en Vivo</span>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Diseñado para la Simplicidad</h2>
              <p>Cuidado elevado en tres sencillos pasos. Nosotros nos encargamos de los detalles, tú disfrutas de la tranquilidad.</p>
            </div>
            
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-num">01</span>
                <div className="step-icon icon-orange">🔍</div>
                <h3>Descubre tu Pareja Ideal</h3>
                <p>Explora nuestra cuidada selección de paseadores profesionales verificados que se alinean con el temperamento de tu perro.</p>
              </div>
              
              <div className="step-card">
                <span className="step-num">02</span>
                <div className="step-icon icon-green">📅</div>
                <h3>Reserva sin Esfuerzo</h3>
                <p>Programa paseos puntuales o rutinas recurrentes a través de nuestra interfaz intuitiva. Precios fijos, sin sorpresas.</p>
              </div>
              
              <div className="step-card">
                <span className="step-num">03</span>
                <div className="step-icon icon-yellow">🐾</div>
                <h3>Paseos a la Medida</h3>
                <p>Recibe actualizaciones de GPS en tiempo real, fotos destacadas y un resumen completo después de cada sesión.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-light">
          <div className="container">
            <div className="community-header">
              <div className="community-title">
                <span className="kicker-green">La Comunidad</span>
                <h2>De la confianza de dueños de mascotas con un gusto impecable.</h2>
              </div>
              <div className="nav-arrows">
                <button className="arrow-btn" onClick={rotatePrev} aria-label="Testimonio anterior">←</button>
                <button className="arrow-btn" onClick={rotateNext} aria-label="Siguiente testimonio">→</button>
              </div>
            </div>
            
            <div className="testimonials-grid">
              {testimonials.map((test) => (
                <div key={test.id} className="test-card" style={{ transition: 'transform 0.4s ease, opacity 0.4s ease' }}>
                  <div>
                    <div className="stars">{test.stars}</div>
                    <p className="test-quote">{test.quote}</p>
                  </div>
                  <div className="test-author">
                    <div className="author-img">
                      <img src={test.img} alt={test.name} />
                    </div>
                    <div className="author-info">
                      <h4>{test.name}</h4>
                      <p>{test.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cta-banner">
              <h2>¿Listo para dar un respiro a sus patitas?</h2>
              <p>Únete a miles de perros felices y sus humanos hoy.<br/>El primer paseo corre por nuestra cuenta.</p>
              <a href="/walkers" className="btn btn-white">Únete a Paws&Pause Hoy</a>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </>
  );
}
