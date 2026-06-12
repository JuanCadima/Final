'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAppContext, Booking, Dog, Profile, Walker } from '../../hooks/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAppContext();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', minHeight: '80vh', textAlign: 'center' }}>
          <div className="skeleton-loader" style={{ display: 'inline-block', width: '50px', height: '50px', border: '5px solid #eee', borderTopColor: 'var(--accent-brown)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1.5rem', color: '#666', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>Cargando tu panel de control...</p>
          <style jsx global>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </main>
        <Footer />
      </>
    );
  }

  if (!user || !profile) {
    return null; // Redirecting...
  }

  // Conditionally render dashboard according to user role
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', minHeight: '80vh' }}>
        {profile.role === 'admin' && <AdminDashboard />}
        {profile.role === 'employee' && <WalkerDashboard />}
        {profile.role === 'client' && <ClientDashboard />}
      </main>
      <Footer />
    </>
  );
}

// ==========================================
// 1. CLIENT DASHBOARD VIEW
// ==========================================
function ClientDashboard() {
  const { bookings, dogs, addDog, cancelBooking, walkers, addReview, deleteAccount, logout } = useAppContext();
  const [isAddingDog, setIsAddingDog] = useState(false);
  const [newDog, setNewDog] = useState({ name: '', breed: '', photoUrl: '' });
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError('Error al eliminar cuenta. Intenta nuevamente.');
    }
  };

  const handleSendReview = async (booking: any) => {
    const walkerObj = walkers.find(w => w.name === booking.walkerName || w.id === booking.walkerId);
    if (walkerObj && comment.trim()) {
      await addReview(walkerObj.id, stars, comment);
      setRatingBookingId(null);
      setStars(5);
      setComment('');
    }
  };


  const handleAddDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDog.name && newDog.breed) {
      addDog({
        name: newDog.name,
        breed: newDog.breed,
        photoUrl: newDog.photoUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200'
      });
      setNewDog({ name: '', breed: '', photoUrl: '' });
      setIsAddingDog(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <span style={{ background: '#dff2cc', color: '#5a8a29', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Confirmado</span>;
      case 'rejected':
        return <span style={{ background: '#fdf3f2', color: '#d9534f', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Rechazado</span>;
      case 'pending':
      default:
        return <span style={{ background: '#faeab1', color: '#9c750b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Pendiente</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Mi Panel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Administra tus paseos programados y tus adorables mascotas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>
        {/* Left: Upcoming Walks */}
        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', fontWeight: 600 }}>Próximos Paseos</h2>
          
          {bookings.length === 0 ? (
            <div style={{ background: '#ffffff', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🦮</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 }}>No tienes paseos programados</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>¡Tu mejor amigo está esperando su próxima aventura!</p>
              <a href="/walkers" className="btn btn-primary">Buscar un Paseador</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookings.map(booking => (
                <div key={booking.id} style={{ border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        {getStatusBadge(booking.status)}
                        <strong style={{ fontSize: '1.15rem' }}>{booking.date} • {booking.time}</strong>
                      </div>
                      <div style={{ color: '#444', fontSize: '0.95rem' }}>
                        {booking.service} con <strong style={{ color: 'var(--accent-brown)' }}>{booking.walkerName}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>${booking.price.toFixed(2)}</div>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => {
                              setRatingBookingId(ratingBookingId === booking.id ? null : booking.id);
                              setStars(5);
                              setComment('');
                            }} 
                            style={{ background: 'none', border: 'none', color: '#8a7322', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                          >
                            ⭐ Calificar
                          </button>
                        )}
                        {booking.status !== 'rejected' && (
                          <button 
                            onClick={() => cancelBooking(booking.id)} 
                            style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                          >
                            Cancelar Paseo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {ratingBookingId === booking.id && (
                    <div style={{ width: '100%', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #eee' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600 }}>Califica tu paseo con {booking.walkerName}</h4>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <span 
                            key={num} 
                            onClick={() => setStars(num)} 
                            style={{ cursor: 'pointer', fontSize: '1.4rem', color: num <= stars ? '#ffc107' : '#e4e5e9' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea 
                        rows={3} 
                        placeholder="Escribe tu reseña..." 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#222', background: '#fff', outline: 'none', marginBottom: '0.75rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleSendReview(booking)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          Enviar Reseña
                        </button>
                        <button 
                          onClick={() => setRatingBookingId(null)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8rem', background: '#eee', border: '1px solid #ddd', color: '#555' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: My Dogs */}
        <aside>
          <div style={{ background: 'var(--bg-alt)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>Mis Perros</h2>
              {!isAddingDog && (
                <button 
                  onClick={() => setIsAddingDog(true)} 
                  style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  +
                </button>
              )}
            </div>

            {isAddingDog && (
              <form onSubmit={handleAddDog} style={{ marginBottom: '1.5rem', background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Nombre</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Rocky" 
                    value={newDog.name} 
                    onChange={e => setNewDog({...newDog, name: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Raza</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Golden Retriever" 
                    value={newDog.breed} 
                    onChange={e => setNewDog({...newDog, breed: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>URL Foto (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="https://images..." 
                    value={newDog.photoUrl} 
                    onChange={e => setNewDog({...newDog, photoUrl: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#222', background: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Guardar</button>
                  <button type="button" onClick={() => setIsAddingDog(false)} className="btn btn-secondary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Cancelar</button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {dogs.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', margin: '1rem 0' }}>No has agregado perros todavía.</p>
              ) : (
                dogs.map(dog => (
                  <div key={dog.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <img src={dog.photoUrl} alt={dog.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>{dog.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dog.breed}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Delete Account Section */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'none', border: '1px solid #d9534f', color: '#d9534f', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
          >
            🗑️ Eliminar mi cuenta
          </button>
        ) : (
          <div style={{ background: '#fdf3f2', border: '1px solid #f5c6cb', borderRadius: '16px', padding: '1.5rem', maxWidth: '480px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#c0392b', fontSize: '1rem' }}>⚠️ ¿Estás seguro?</h4>
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>Esta acción es irreversible. Tu cuenta, perros y reservas serán eliminados permanentemente.</p>
            {deleteError && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleDeleteAccount} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Sí, eliminar cuenta</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} style={{ background: '#eee', border: '1px solid #ddd', color: '#555', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. WALKER (EMPLOYEE) DASHBOARD VIEW
// ==========================================
function WalkerDashboard() {
  const { user, profile, bookings, walkers, updateWalkerProfile, updateBookingStatus, profiles, dogs, deleteAccount } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'schedule'>('requests');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError('Error al eliminar cuenta. Intenta nuevamente.');
    }
  };
  
  // Find matching walker record
  const currentWalker = walkers.find(w => w.id === user?.id || w.userId === user?.id || w.name === profile?.name) || walkers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: 30,
    tagline: '',
    bio: ''
  });
  const [notifMsg, setNotifMsg] = useState('');


  // Load walker record data into form
  useEffect(() => {
    if (currentWalker) {
      setFormData({
        name: currentWalker.name,
        location: currentWalker.location,
        price: currentWalker.price,
        tagline: currentWalker.tagline,
        bio: currentWalker.aboutParagraphs.join('\n\n')
      });
    }
  }, [currentWalker]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWalker) {
      await updateWalkerProfile(currentWalker.id, {
        name: formData.name,
        location: formData.location,
        price: Number(formData.price),
        tagline: formData.tagline,
        aboutParagraphs: formData.bio.split('\n\n').filter(p => p.trim() !== '')
      });
      setIsEditing(false);
      setNotifMsg('¡Tu perfil público se ha actualizado con éxito!');
      setTimeout(() => setNotifMsg(''), 3000);
    }
  };

  const handleBookingAction = async (id: string, action: 'confirmed' | 'rejected') => {
    await updateBookingStatus(id, action);
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <span style={{ background: '#dff2cc', color: '#5a8a29', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>Aceptado</span>;
      case 'rejected':
        return <span style={{ background: '#fdf3f2', color: '#d9534f', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>Rechazado</span>;
      case 'pending':
      default:
        return <span style={{ background: '#faeab1', color: '#9c750b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>Pendiente</span>;
    }
  };

  const getClientDetails = (userId?: string) => {
    if (!userId) return { name: 'Cliente Anónimo', avatarUrl: '' };
    const client = profiles.find(p => p.id === userId);
    return {
      name: client?.name || 'Cliente Demo',
      avatarUrl: client?.avatarUrl || ''
    };
  };

  const getClientDogs = (userId?: string) => {
    if (!userId) return [];
    return dogs.filter(d => d.userId === userId);
  };

  const confirmedBookings = bookings
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => (a.date + ' ' + a.time).localeCompare(b.date + ' ' + b.time));

  return (
    <div>
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Panel del Paseador</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gestiona tus solicitudes de trabajo y edita tu perfil público.</p>
      </div>

          {notifMsg && (
            <div style={{ background: '#f4faf0', borderLeft: '4px solid #5cb85c', color: '#3c763d', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <strong>✨ Éxito:</strong> {notifMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>
            {/* Left: Job Requests & Schedule */}
            <div>
              {/* Sub Tab Headers */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                  onClick={() => setActiveSubTab('requests')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSubTab === 'requests' ? '3px solid var(--accent-brown)' : '3px solid transparent',
                    color: activeSubTab === 'requests' ? 'var(--text-main)' : 'var(--text-muted)',
                    padding: '0.75rem 1rem',
                    fontSize: '1.05rem',
                    fontWeight: activeSubTab === 'requests' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🐾 Solicitudes de Paseo
                </button>
                <button
                  onClick={() => setActiveSubTab('schedule')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSubTab === 'schedule' ? '3px solid var(--accent-brown)' : '3px solid transparent',
                    color: activeSubTab === 'schedule' ? 'var(--text-main)' : 'var(--text-muted)',
                    padding: '0.75rem 1rem',
                    fontSize: '1.05rem',
                    fontWeight: activeSubTab === 'schedule' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📅 Mi Horario Diario
                </button>
              </div>

              {activeSubTab === 'requests' ? (
                // Requests Subtab
                <div>
                  {bookings.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🐾</div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 }}>No hay paseos solicitados</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>¡Cuando los clientes reserven contigo, aparecerán aquí!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {bookings.map(booking => {
                        const client = getClientDetails(booking.userId);
                        const clientDogs = getClientDogs(booking.userId);
                        return (
                          <div key={booking.id} style={{ border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                {getStatusBadge(booking.status)}
                                <strong style={{ fontSize: '1.1rem' }}>{booking.date} a las {booking.time}</strong>
                              </div>
                              <div style={{ color: '#555', fontSize: '0.9rem' }}>
                                Servicio: <strong>{booking.service}</strong>
                              </div>
                              <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>
                                Cliente: <strong>{client.name}</strong>
                              </div>
                              {clientDogs.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#666' }}>Mascota(s):</span>
                                  {clientDogs.map(d => (
                                    <span key={d.id} style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      🐶 <strong>{d.name}</strong> ({d.breed})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>${booking.price.toFixed(2)}</div>
                              {booking.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                    style={{ background: '#5cb85c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                                  >
                                    ✓ Aceptar
                                  </button>
                                  <button 
                                    onClick={() => handleBookingAction(booking.id, 'rejected')}
                                    style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                                  >
                                    ✗ Rechazar
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                  {booking.status === 'confirmed' ? 'Reserva Confirmada' : 'Reserva Rechazada'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Daily Schedule Subtab
                <div>
                  {confirmedBookings.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📅</div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 }}>No hay paseos confirmados</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>¡Acepta solicitudes pendientes para ver tu horario de trabajo!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {confirmedBookings.map((booking, idx) => {
                        const client = getClientDetails(booking.userId);
                        const clientDogs = getClientDogs(booking.userId);
                        return (
                          <div key={booking.id} style={{ border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', display: 'flex', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ background: 'var(--accent-brown)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {idx + 1}
                              </div>
                              {idx < confirmedBookings.length - 1 && (
                                <div style={{ width: '2px', flex: 1, background: '#eee', marginTop: '4px' }}></div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div>
                                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{booking.time}</strong>
                                  <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>({booking.date})</span>
                                </div>
                                <span style={{ background: '#eafaf1', color: '#2ecc71', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Confirmado</span>
                              </div>
                              <div style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                                Servicio: <strong>{booking.service}</strong> • Pago: <strong>${booking.price.toFixed(2)}</strong>
                              </div>
                              
                              <div style={{ background: 'var(--bg-alt)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Dueño:</span>
                                  <strong style={{ fontSize: '0.9rem' }}>{client.name}</strong>
                                </div>
                                {clientDogs.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Mascotas a pasear:</span>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {clientDogs.map(dog => (
                                        <div key={dog.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                          <img src={dog.photoUrl} alt={dog.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                          <span style={{ fontSize: '0.8rem' }}><strong>{dog.name}</strong> ({dog.breed})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>No hay detalles de mascotas disponibles</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

        {/* Right: Public Profile Settings */}
        <aside>
          <div style={{ background: 'var(--bg-alt)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Mi Perfil Público
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-brown)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                >
                  Editar
                </button>
              )}
            </h2>

            {isEditing ? (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Nombre</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Ubicación</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Precio Base ($)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Lema</label>
                  <input 
                    type="text" 
                    value={formData.tagline} 
                    onChange={e => setFormData({...formData, tagline: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Sobre Mí (Párrafos separados por 2 líneas enteras)</label>
                  <textarea 
                    rows={6}
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Guardar</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <img src={currentWalker?.imageUrl || profile?.avatarUrl} alt={currentWalker?.name} style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'block' }}>{currentWalker?.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentWalker?.location}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Precio por paseo:</span>
                  <strong>${currentWalker?.price}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Calificación:</span>
                  <strong style={{ color: '#8a7322' }}>★ {currentWalker?.rating.toFixed(1)}</strong>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Lema</span>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>"{currentWalker?.tagline}"</p>
                </div>
                
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Biografía</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', margin: 0, maxHeight: '120px', overflowY: 'auto' }}>
                    {currentWalker?.aboutParagraphs[0]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Delete Account Section */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'none', border: '1px solid #d9534f', color: '#d9534f', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
          >
            🗑️ Eliminar mi cuenta
          </button>
        ) : (
          <div style={{ background: '#fdf3f2', border: '1px solid #f5c6cb', borderRadius: '16px', padding: '1.5rem', maxWidth: '480px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#c0392b', fontSize: '1rem' }}>⚠️ ¿Estás seguro?</h4>
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>Esta acción es irreversible. Tu cuenta y historial serán eliminados permanentemente.</p>
            {deleteError && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleDeleteAccount} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Sí, eliminar cuenta</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} style={{ background: '#eee', border: '1px solid #ddd', color: '#555', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. ADMINISTRATOR DASHBOARD VIEW
// ==========================================
function AdminDashboard() {
  const { profiles, allBookings, allDogs, walkers, updateUserProfileRole, cancelBooking, isMockMode } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'walkers'>('users');
  const [roleChangeMsg, setRoleChangeMsg] = useState('');

  // 1. Calculate KPI Metrics
  const totalRevenue = allBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0);

  const pendingBookingsCount = allBookings.filter(b => b.status === 'pending').length;
  const totalClientsCount = profiles.filter(p => p.role === 'client').length;
  const totalWalkersCount = walkers.length;

  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    await updateUserProfileRole(userId, newRole);
    setRoleChangeMsg('¡El rol del usuario ha sido modificado con éxito!');
    setTimeout(() => setRoleChangeMsg(''), 3500);
  };

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dff2cc', text: '#5a8a29' };
      case 'rejected':
        return { bg: '#fdf3f2', text: '#d9534f' };
      case 'pending':
      default:
        return { bg: '#faeab1', text: '#9c750b' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Panel de Administración</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Métricas en tiempo real y gestión global de la plataforma Paws&Pause.</p>
      </div>

      {roleChangeMsg && (
        <div style={{ background: '#f4faf0', borderLeft: '4px solid #5cb85c', color: '#3c763d', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <strong>✨ Éxito:</strong> {roleChangeMsg}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Revenue Card */}
        <div style={{ background: 'linear-gradient(135deg, #a54605 0%, #833703 100%)', color: '#fff', padding: '1.75rem', borderRadius: '24px', boxShadow: '0 10px 20px rgba(165,70,5,0.15)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.85, letterSpacing: '0.5px' }}>Ingresos Totales</span>
          <h3 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0 0', fontWeight: 700, color: '#fff' }}>${totalRevenue.toFixed(2)}</h3>
          <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>De reservas confirmadas</span>
        </div>

        {/* Bookings Card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '1.75rem', borderRadius: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Total Reservas</span>
          <h3 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--text-main)' }}>{allBookings.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#9c750b', fontWeight: 600 }}>{pendingBookingsCount} pendientes de aprobación</span>
        </div>

        {/* Clients Card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '1.75rem', borderRadius: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Clientes</span>
          <h3 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--text-main)' }}>{totalClientsCount}</h3>
          <span style={{ fontSize: '0.7rem', color: '#666' }}>Con cuentas activas</span>
        </div>

        {/* Walkers Card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '1.75rem', borderRadius: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Paseadores</span>
          <h3 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--text-main)' }}>{totalWalkersCount}</h3>
          <span style={{ fontSize: '0.7rem', color: '#666' }}>En el catálogo</span>
        </div>

        {/* Dogs Card */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '1.75rem', borderRadius: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Perros</span>
          <h3 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0 0', fontWeight: 700, color: 'var(--text-main)' }}>{allDogs.length}</h3>
          <span style={{ fontSize: '0.7rem', color: '#666' }}>Registrados</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '3px solid var(--accent-brown)' : '3px solid transparent',
            paddingBottom: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'users' ? 'var(--accent-brown)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          👥 Gestión de Usuarios ({profiles.length})
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'bookings' ? '3px solid var(--accent-brown)' : '3px solid transparent',
            paddingBottom: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'bookings' ? 'var(--accent-brown)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          📅 Historial de Paseos ({allBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('walkers')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'walkers' ? '3px solid var(--accent-brown)' : '3px solid transparent',
            paddingBottom: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'walkers' ? 'var(--accent-brown)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          🐾 Catálogo de Paseadores ({walkers.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
        
        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: 600 }}>Cuentas de Usuarios Registrados</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#666' }}>
                    <th style={{ padding: '1rem' }}>Nombre</th>
                    <th style={{ padding: '1rem' }}>Correo Electrónico</th>
                    <th style={{ padding: '1rem' }}>ID de Usuario</th>
                    <th style={{ padding: '1rem' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Cambiar Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f2eee3', color: 'var(--text-main)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} alt={p.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{p.email}</td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#666', fontSize: '0.8rem' }}>{p.id.substring(0, 18)}...</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: p.role === 'admin' ? '#ffe3e3' : p.role === 'employee' ? '#e3fafc' : '#dff2cc',
                          color: p.role === 'admin' ? '#c92a2a' : p.role === 'employee' ? '#0b7285' : '#5a8a29',
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize'
                        }}>
                          {p.role === 'employee' ? 'Paseador' : p.role === 'admin' ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <select 
                          value={p.role} 
                          onChange={(e) => handleRoleChange(p.id, e.target.value as Profile['role'])}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                        >
                          <option value="client">Cliente</option>
                          <option value="employee">Paseador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: 600 }}>Registro General de Reservas</h3>
            {allBookings.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', margin: '2rem 0' }}>No hay reservas registradas en el sistema.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#666' }}>
                      <th style={{ padding: '1rem' }}>Servicio</th>
                      <th style={{ padding: '1rem' }}>Paseador</th>
                      <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                      <th style={{ padding: '1rem' }}>Precio</th>
                      <th style={{ padding: '1rem' }}>Estado</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map(b => {
                      const style = getStatusStyle(b.status);
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f2eee3' }}>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>{b.service}</td>
                          <td style={{ padding: '1rem' }}>{b.walkerName}</td>
                          <td style={{ padding: '1rem' }}>{b.date} • {b.time}</td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>${b.price.toFixed(2)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ background: style.bg, color: style.text, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {b.status === 'confirmed' ? 'Confirmado' : b.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {b.status !== 'rejected' && (
                              <button 
                                onClick={() => cancelBooking(b.id)}
                                style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WALKERS */}
        {activeTab === 'walkers' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: 600 }}>Paseadores Registrados en la Red</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#666' }}>
                    <th style={{ padding: '1rem' }}>Paseador</th>
                    <th style={{ padding: '1rem' }}>Ubicación</th>
                    <th style={{ padding: '1rem' }}>Tarifa</th>
                    <th style={{ padding: '1rem' }}>Calificación Promedio</th>
                    <th style={{ padding: '1rem' }}>Reseñas</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Ver Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {walkers.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #f2eee3' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={w.imageUrl} alt={w.name} style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500 }}>{w.name}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{w.location}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>${w.price}/paseo</td>
                      <td style={{ padding: '1rem', color: '#8a7322', fontWeight: 500 }}>★ {w.rating.toFixed(1)}</td>
                      <td style={{ padding: '1rem' }}>{w.reviewsCount} reseñas</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <a href={`/profile?id=${w.id}`} style={{ color: 'var(--accent-brown)', textDecoration: 'underline', fontWeight: 500, fontSize: '0.85rem' }}>Ver Perfil</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
