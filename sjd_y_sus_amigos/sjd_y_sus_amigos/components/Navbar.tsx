'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../hooks/AppContext';

export function Navbar() {
  const router = useRouter();
  const { user, profile, logout, bookings } = useAppContext();
  const [searchVal, setSearchVal] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Generate dynamic notifications & messages based on current user's bookings
  const dynamicNotifs: { id: string; text: string }[] = [];
  const dynamicMsgs: { id: string; sender: string; text: string }[] = [];

  if (user && profile && bookings && bookings.length > 0) {
    if (profile.role === 'client') {
      bookings.forEach((booking) => {
        if (booking.status === 'confirmed') {
          dynamicNotifs.push({
            id: `notif-confirmed-${booking.id}`,
            text: `🎉 ¡${booking.walkerName} ha aceptado tu solicitud de reserva para el ${booking.date}!`,
          });
          dynamicMsgs.push({
            id: `msg-confirmed-${booking.id}`,
            sender: booking.walkerName,
            text: `💬 ${booking.walkerName}: "¡Hola! Estoy deseando realizar el servicio de ${booking.service} el ${booking.date} a la(s) ${booking.time}. ¡Nos vemos pronto!"`,
          });
        } else if (booking.status === 'rejected') {
          dynamicNotifs.push({
            id: `notif-rejected-${booking.id}`,
            text: `❌ ${booking.walkerName} ha rechazado tu solicitud de reserva.`,
          });
          dynamicMsgs.push({
            id: `msg-rejected-${booking.id}`,
            sender: booking.walkerName,
            text: `💬 ${booking.walkerName}: "Lo siento, no tengo disponibilidad para esa fecha y hora. ¡Espero poder pasear a tu mascota en otra ocasión!"`,
          });
        } else {
          // pending
          dynamicNotifs.push({
            id: `notif-pending-${booking.id}`,
            text: `⏳ Tu solicitud de paseo con ${booking.walkerName} para el ${booking.date} ha sido enviada y está pendiente.`,
          });
          dynamicMsgs.push({
            id: `msg-pending-${booking.id}`,
            sender: booking.walkerName,
            text: `💬 ${booking.walkerName}: "¡Hola! He recibido tu solicitud para ${booking.service}. La revisaré muy pronto."`,
          });
        }
      });
    } else if (profile.role === 'employee') {
      bookings.forEach((booking) => {
        if (booking.status === 'pending') {
          dynamicNotifs.push({
            id: `notif-emp-pending-${booking.id}`,
            text: `📅 Tienes una nueva solicitud de ${booking.service} pendiente para el ${booking.date}.`,
          });
          dynamicMsgs.push({
            id: `msg-emp-pending-${booking.id}`,
            sender: 'Cliente',
            text: `💬 Cliente: "Hola, ¿tienes disponibilidad para pasear a mi mascota el ${booking.date} a la(s) ${booking.time}?"`,
          });
        } else if (booking.status === 'confirmed') {
          dynamicNotifs.push({
            id: `notif-emp-confirmed-${booking.id}`,
            text: `✅ Has confirmado la reserva para el ${booking.date}.`,
          });
          dynamicMsgs.push({
            id: `msg-emp-confirmed-${booking.id}`,
            sender: 'Cliente',
            text: `💬 Cliente: "¡Excelente, gracias por confirmar! Nos vemos el ${booking.date}."`,
          });
        }
      });
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push(`/walkers?q=${encodeURIComponent(searchVal)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    router.push('/');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'employee': return 'Paseador';
      case 'client': return 'Cliente';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return { bg: '#ffe3e3', text: '#c92a2a' };
      case 'employee': return { bg: '#e3fafc', text: '#0b7285' };
      case 'client': return { bg: '#dff2cc', text: '#5a8a29' };
      default: return { bg: '#eee', text: '#666' };
    }
  };

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container nav-content">
        <a href="/" className="logo">Paws&Pause</a>
        
        <nav className="nav-links">
          <a href="/walkers">Buscar Paseadores</a>
          <a href="/#services">Servicios</a>
          <a href="/walkers?q=cuidado">Especialidades</a>
        </nav>
        
        <div className="nav-actions">
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar paseador..." 
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ color: '#222' }}
            />
          </div>
          
          <div className="action-icons" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {user ? (
              <>
                {/* Notifications Icon */}
                <div style={{ position: 'relative' }}>
                  <span 
                    onClick={() => { setShowNotif(!showNotif); setShowChat(false); setShowProfileMenu(false); }} 
                    style={{ cursor: 'pointer', display: 'flex', position: 'relative' }}
                    title="Notificaciones"
                  >
                    🔔
                    {dynamicNotifs.length > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#d9534f', color: '#fff', fontSize: '0.6rem', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {dynamicNotifs.length}
                      </span>
                    )}
                  </span>
                  {showNotif && (
                    <div style={{
                      position: 'absolute', top: '100%', right: '-40px', marginTop: '12px',
                      background: '#fff', border: '1px solid #eaeaea', borderRadius: '14px',
                      padding: '1rem', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 200, color: '#333', fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                        <strong>Notificaciones</strong>
                        <span onClick={() => setShowNotif(false)} style={{ cursor: 'pointer', color: '#999' }}>×</span>
                      </div>
                      {dynamicNotifs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                          {dynamicNotifs.map((n) => (
                            <div key={n.id} style={{ color: '#555', lineHeight: '1.4', paddingBottom: '4px', borderBottom: '1px solid #f9f9f9' }}>
                              {n.text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
                          No tienes notificaciones nuevas.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Icon */}
                <div style={{ position: 'relative' }}>
                  <span 
                    onClick={() => { setShowChat(!showChat); setShowNotif(false); setShowProfileMenu(false); }} 
                    style={{ cursor: 'pointer', display: 'flex', position: 'relative' }}
                    title="Mensajes"
                  >
                    💬
                    {dynamicMsgs.length > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#d9534f', color: '#fff', fontSize: '0.6rem', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {dynamicMsgs.length}
                      </span>
                    )}
                  </span>
                  {showChat && (
                    <div style={{
                      position: 'absolute', top: '100%', right: '-10px', marginTop: '12px',
                      background: '#fff', border: '1px solid #eaeaea', borderRadius: '14px',
                      padding: '1rem', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 200, color: '#333', fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                        <strong>Mensajes</strong>
                        <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', color: '#999' }}>×</span>
                      </div>
                      {dynamicMsgs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                          {dynamicMsgs.map((m) => (
                            <div key={m.id} style={{ color: '#555', lineHeight: '1.4', paddingBottom: '4px', borderBottom: '1px solid #f9f9f9' }}>
                              {m.text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
                          No tienes mensajes nuevos.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Dropdown Profile Menu */}
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); setShowChat(false); }}
                    style={{ cursor: 'pointer' }}
                    className="avatar-sm"
                    title="Mi Cuenta"
                  >
                    <img 
                      src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"} 
                      alt="Avatar de usuario" 
                    />
                  </div>

                  {showProfileMenu && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                      background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px',
                      padding: '1.25rem', width: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      zIndex: 200, color: '#333', fontSize: '0.85rem', display: 'flex',
                      flexDirection: 'column', gap: '0.75rem'
                    }}>
                      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {profile?.name || 'Usuario'}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.email}
                        </div>
                        <span style={{ 
                          background: getRoleColor(profile?.role).bg, 
                          color: getRoleColor(profile?.role).text, 
                          padding: '2px 8px', 
                          borderRadius: '20px', 
                          fontSize: '0.65rem', 
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {getRoleLabel(profile?.role)}
                        </span>
                      </div>
                      
                      <a 
                        href="/dashboard" 
                        onClick={() => setShowProfileMenu(false)}
                        style={{ color: '#444', textDecoration: 'none', padding: '4px 0', display: 'block', fontWeight: 500 }}
                      >
                        🎛️ Mi Panel
                      </a>
                      
                      <button 
                        onClick={handleLogout}
                        style={{ 
                          background: 'none', border: 'none', color: '#d9534f', 
                          textAlign: 'left', padding: '8px 0 0 0', cursor: 'pointer', 
                          fontSize: '0.85rem', borderTop: '1px solid #eee', width: '100%',
                          fontWeight: 500
                        }}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a 
                href="/login" 
                className="btn btn-outline" 
                style={{ 
                  borderRadius: '50px', 
                  padding: '0.4rem 1.2rem', 
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 500
                }}
              >
                Iniciar Sesión
              </a>
            )}
          </div>
          
          <a href="/walkers" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Reservar Paseo</a>
        </div>
      </div>
    </header>
  );
}
