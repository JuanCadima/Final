'use client';

import React from 'react';

export function Footer() {
  const handleLinkClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    switch (type) {
      case 'become_walker':
        alert("¡Gracias por tu interés! Nuestra plantilla de paseadores en San Francisco está completa en este momento, pero abriremos solicitudes para nuevos grupos el próximo mes.");
        break;
      case 'safety':
        alert("La seguridad es nuestra máxima prioridad. Cada paseo está cubierto por nuestra póliza de seguro premium de $1M e incluye asistencia veterinaria de guardia las 24 horas, los 7 días de la semana. Se envían pautas detalladas durante la incorporación.");
        break;
      case 'support':
        alert("¿Necesitas ayuda? Nuestro equipo de soporte está disponible las 24 horas, los 7 días de la semana. Escríbenos a support@pawsandpause.com o llámanos al 1-800-PAWS-PAUSE.");
        break;
      case 'terms':
        alert("Condiciones del servicio: Paws&Pause conecta a dueños de mascotas con paseadores premium verificados. Las condiciones estándar del servicio, los detalles de la cobertura de responsabilidad civil y las políticas de cancelación se formalizarán en el contrato.");
        break;
      case 'privacy':
        alert("Política de privacidad: Protegemos tu información personal, dirección y perfiles de mascotas. Tus datos están encriptados y solo se comparten con el paseador seleccionado.");
        break;
      case 'socials':
        alert("¡Síguenos en las redes sociales como @PawsAndPause para ver resúmenes diarios de las aventuras de nuestros paseadores!");
        break;
      default:
        break;
    }
  };

  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0 2rem', background: 'var(--bg-main)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">Paws&Pause</a>
            <p>Definiendo el futuro del cuidado de mascotas a través de la excelencia editorial y una confiabilidad sin igual.</p>
          </div>
          
          <div className="footer-col">
            <h4>Explorar</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => handleLinkClick(e, 'become_walker')}>Conviértete en Paseador</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => handleLinkClick(e, 'safety')}>Pautas de Seguridad</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/#services">Nuestra Misión</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Soporte</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => handleLinkClick(e, 'support')}>Centro de Soporte</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => handleLinkClick(e, 'terms')}>Condiciones de Servicio</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="#" onClick={(e) => handleLinkClick(e, 'privacy')}>Política de Privacidad</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Mantente Inspirado</h4>
            <div className="socials" style={{ display: 'flex', gap: '1rem', fontSize: '1.25rem', marginTop: '0.5rem' }}>
              <a href="#" onClick={(e) => handleLinkClick(e, 'socials')} title="Facebook">FB</a>
              <a href="#" onClick={(e) => handleLinkClick(e, 'socials')} title="Instagram">IG</a>
              <a href="#" onClick={(e) => handleLinkClick(e, 'socials')} title="X (Twitter)">X</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ borderTop: '1px solid var(--border-color)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>© 2024 Paws&Pause Editorial. Todos los derechos reservados.</p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <span>🌐 ES</span>
            <span>📱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
