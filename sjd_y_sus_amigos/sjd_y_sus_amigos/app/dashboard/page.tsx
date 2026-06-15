'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAppContext, Booking, Dog, Profile, Walker } from '../../hooks/AppContext';
import { supabase } from '../../lib/supabase';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
];

const PRESET_DOG_PHOTOS = [
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=200'
];

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
  const { 
    user, 
    profile, 
    bookings, 
    dogs, 
    addDog, 
    deleteDog, 
    cancelBooking, 
    walkers, 
    addReview, 
    deleteAccount, 
    privateProfile, 
    updatePrivateProfile, 
    updateProfileAvatar 
  } = useAppContext();

  const [isAddingDog, setIsAddingDog] = useState(false);
  const [newDog, setNewDog] = useState({ name: '', breed: '', photoUrl: '', age: '', size: 'Mediano', notes: '' });
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paidBookingIds, setPaidBookingIds] = useState<string[]>([]);
  
  // Private Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    id_number: '',
    avatarUrl: ''
  });

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('paws_payment_') && localStorage.getItem(k) === 'paid');
    const ids = keys.map(k => k.replace('paws_payment_', ''));
    setPaidBookingIds(ids);
  }, []);

  const handleConfirmPayment = (bookingId: string) => {
    localStorage.setItem('paws_payment_' + bookingId, 'paid');
    setPaidBookingIds(prev => [...prev, bookingId]);
    setPaymentBooking(null);
  };

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
        photoUrl: newDog.photoUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200',
        age: newDog.age,
        size: newDog.size,
        notes: newDog.notes
      });
      setNewDog({ name: '', breed: '', photoUrl: '', age: '', size: 'Mediano', notes: '' });
      setIsAddingDog(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePrivateProfile({
      phone: profileForm.phone,
      address: profileForm.address,
      id_number: profileForm.id_number
    });

    if (profileForm.name !== profile?.name && user) {
      await supabase.from('profiles').update({ name: profileForm.name }).eq('id', user.id);
    }

    if (profileForm.avatarUrl !== profile?.avatarUrl) {
      await updateProfileAvatar(profileForm.avatarUrl);
    }

    setIsEditingProfile(false);
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
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Administra tus paseos programados, tus datos de contacto y tus adorables mascotas.</p>
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
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', alignItems: 'center' }}>
                        {booking.status === 'confirmed' && (
                          <>
                            {paidBookingIds.includes(booking.id) ? (
                              <span style={{ fontSize: '0.85rem', color: '#5a8a29', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                💵 Pagado
                              </span>
                            ) : (
                              <button 
                                onClick={() => setPaymentBooking(booking)}
                                style={{ background: 'none', border: 'none', color: '#2b8a3e', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                              >
                                💳 Pagar (QR)
                              </button>
                            )}
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
                          </>
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

        {/* Right: My Dogs & Config */}
        <aside>
          {/* My Dogs Card */}
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
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Edad</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 2 años, 6 meses" 
                    value={newDog.age} 
                    onChange={e => setNewDog({...newDog, age: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Tamaño</label>
                  <select
                    value={newDog.size}
                    onChange={e => setNewDog({...newDog, size: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Notas Especiales</label>
                  <textarea 
                    rows={3}
                    placeholder="Comportamiento, dieta o cuidados..." 
                    value={newDog.notes} 
                    onChange={e => setNewDog({...newDog, notes: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Foto de tu Perro</label>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {PRESET_DOG_PHOTOS.map(p => (
                      <img 
                        key={p} 
                        src={p} 
                        alt="Preset Dog"
                        onClick={() => setNewDog({...newDog, photoUrl: p})}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: newDog.photoUrl === p ? '2px solid var(--accent-brown)' : '2px solid transparent', objectFit: 'cover' }} 
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="O introduce una URL personalizada..." 
                    value={newDog.photoUrl} 
                    onChange={e => setNewDog({...newDog, photoUrl: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', color: '#222', background: '#fff' }}
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
                  <div key={dog.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <button 
                      onClick={async () => {
                        if(confirm(`¿Estás seguro de eliminar a ${dog.name}?`)) {
                          await deleteDog(dog.id);
                        }
                      }}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#d9534f', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.8 }}
                    >
                      🗑️
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={dog.photoUrl} alt={dog.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>{dog.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dog.breed} • {dog.size} • {dog.age || 'Edad N/D'}</span>
                      </div>
                    </div>
                    {dog.notes && (
                      <div style={{ background: '#f9f9f9', borderLeft: '3px solid #ccc', padding: '4px 8px', fontSize: '0.78rem', color: '#555', fontStyle: 'italic', borderRadius: '4px', marginTop: '2px' }}>
                        "{dog.notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Personal & Private Info Card */}
          <div style={{ background: 'var(--bg-alt)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              👤 Datos Personales
              {!isEditingProfile && (
                <button 
                  onClick={() => {
                    setProfileForm({
                      name: profile?.name || '',
                      phone: privateProfile?.phone || '',
                      address: privateProfile?.address || '',
                      id_number: privateProfile?.id_number || '',
                      avatarUrl: profile?.avatarUrl || ''
                    });
                    setIsEditingProfile(true);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-brown)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}
                >
                  Editar
                </button>
              )}
            </h2>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Nombre Completo</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Teléfono (Privado)</label>
                  <input 
                    type="text" 
                    value={profileForm.phone} 
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="Ej. +591 71234567"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Dirección (Privada)</label>
                  <input 
                    type="text" 
                    value={profileForm.address} 
                    onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                    placeholder="Ej. Av. Principal #123"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>DNI / ID (Privado)</label>
                  <input 
                    type="text" 
                    value={profileForm.id_number} 
                    onChange={e => setProfileForm({...profileForm, id_number: e.target.value})}
                    placeholder="Ej. CI 8765432"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Avatar</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {PRESET_AVATARS.map(av => (
                      <img 
                        key={av} 
                        src={av} 
                        alt="Preset Avatar"
                        onClick={() => setProfileForm({...profileForm, avatarUrl: av})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', border: profileForm.avatarUrl === av ? '2px solid var(--accent-brown)' : '2px solid transparent', objectFit: 'cover' }} 
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="O introduce una URL personalizada..." 
                    value={profileForm.avatarUrl} 
                    onChange={e => setProfileForm({...profileForm, avatarUrl: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Guardar</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ padding: '0.5rem', flex: 1, borderRadius: '8px', fontSize: '0.85rem' }}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={profile?.avatarUrl} alt={profile?.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'block' }}>{profile?.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{profile?.email}</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>📞 <strong>Teléfono:</strong> {privateProfile?.phone || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificado</span>}</div>
                  <div>📍 <strong>Dirección:</strong> {privateProfile?.address || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificada</span>}</div>
                  <div>🪪 <strong>DNI / Cédula:</strong> {privateProfile?.id_number || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificado</span>}</div>
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
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>Esta acción es irreversible. Tu cuenta, perros y reservas serán eliminados permanentemente.</p>
            {deleteError && <p style={{ color: '#d9534f', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleDeleteAccount} style={{ background: '#d9534f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Sí, eliminar cuenta</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} style={{ background: '#eee', border: '1px solid #ddd', color: '#555', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Payment QR Modal */}
      {paymentBooking && (
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
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            color: '#333'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Pago Seguro con QR</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Escanea el código QR desde tu app bancaria para pagar a <strong>{paymentBooking.walkerName}</strong>.
            </p>
            
            <div style={{ border: '2px solid #eae7de', padding: '1rem', borderRadius: '16px', display: 'inline-block', background: '#faf8f5', marginBottom: '1.5rem' }}>
              {/* Custom QR code generation using simple SVG blocks */}
              <svg width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block' }}>
                <rect width="100" height="100" fill="#ffffff"/>
                {/* QR corners */}
                <rect x="0" y="0" width="30" height="30" fill="#a54605"/>
                <rect x="5" y="5" width="20" height="20" fill="#ffffff"/>
                <rect x="9" y="9" width="12" height="12" fill="#a54605"/>
                
                <rect x="70" y="0" width="30" height="30" fill="#a54605"/>
                <rect x="75" y="5" width="20" height="20" fill="#ffffff"/>
                <rect x="79" y="9" width="12" height="12" fill="#a54605"/>
                
                <rect x="0" y="70" width="30" height="30" fill="#a54605"/>
                <rect x="5" y="75" width="20" height="20" fill="#ffffff"/>
                <rect x="9" y="79" width="12" height="12" fill="#a54605"/>
                
                {/* Random middle pixels simulating QR contents */}
                <rect x="40" y="10" width="6" height="6" fill="#833703"/>
                <rect x="55" y="5" width="8" height="6" fill="#a54605"/>
                <rect x="50" y="22" width="12" height="6" fill="#3c2f2f"/>
                <rect x="10" y="45" width="10" height="8" fill="#833703"/>
                <rect x="42" y="38" width="14" height="10" fill="#a54605"/>
                <rect x="72" y="48" width="18" height="12" fill="#3c2f2f"/>
                <rect x="40" y="70" width="15" height="10" fill="#a54605"/>
                <rect x="65" y="75" width="10" height="15" fill="#833703"/>
                <rect x="48" y="90" width="18" height="8" fill="#3c2f2f"/>
                
                {/* Center logo indicator */}
                <circle cx="50" cy="50" r="10" fill="#a54605"/>
                <text x="50" y="53" fontSize="8" fontWeight="bold" fill="#ffffff" textAnchor="middle">🐾</text>
              </svg>
            </div>
            
            <div style={{ background: '#f5f4ef', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#555', marginBottom: '1.75rem' }}>
              Monto a Transferir: <strong style={{ color: '#000', fontSize: '1rem' }}>${paymentBooking.price.toFixed(2)}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => handleConfirmPayment(paymentBooking.id)}
                className="btn btn-primary"
                style={{ padding: '0.6rem 2rem', fontSize: '0.9rem' }}
              >
                Confirmar Pago
              </button>
              <button 
                onClick={() => setPaymentBooking(null)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', background: '#eee', color: '#555', border: 'none' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. WALKER (EMPLOYEE) DASHBOARD VIEW
// ==========================================
function WalkerDashboard() {
  const { 
    user, 
    profile, 
    bookings, 
    walkers, 
    updateWalkerProfile, 
    updateBookingStatus, 
    profiles, 
    dogs, 
    deleteAccount, 
    privateProfile, 
    updatePrivateProfile, 
    updateProfileAvatar 
  } = useAppContext();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'schedule'>('requests');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [paidBookingIds, setPaidBookingIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Walker Form States
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: 30,
    tagline: '',
    bio: '',
    imageUrl: '',
    phone: '',
    address: '',
    id_number: '',
    allowedSizes: [] as string[],
    specialties: [] as string[]
  });
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('paws_payment_') && localStorage.getItem(k) === 'paid');
    const ids = keys.map(k => k.replace('paws_payment_', ''));
    setPaidBookingIds(ids);
  }, [bookings]);

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError('Error al eliminar cuenta. Intenta nuevamente.');
    }
  };
  
  // Find matching walker record
  const currentWalker = walkers.find(w => w.id === user?.id || w.userId === user?.id || w.name === profile?.name);

  // Load walker record data into form
  useEffect(() => {
    if (currentWalker) {
      setFormData({
        name: currentWalker.name,
        location: currentWalker.location,
        price: currentWalker.price,
        tagline: currentWalker.tagline,
        bio: currentWalker.aboutParagraphs.join('\n\n'),
        imageUrl: currentWalker.imageUrl || profile?.avatarUrl || '',
        phone: privateProfile?.phone || '',
        address: privateProfile?.address || '',
        id_number: privateProfile?.id_number || '',
        allowedSizes: currentWalker.allowedSizes || [],
        specialties: currentWalker.specialties || []
      });
    }
  }, [currentWalker, privateProfile, profile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWalker) {
      // 1. Update public walker profile details
      await updateWalkerProfile(currentWalker.id, {
        name: formData.name,
        location: formData.location,
        price: Number(formData.price),
        tagline: formData.tagline,
        aboutParagraphs: formData.bio.split('\n\n').filter(p => p.trim() !== ''),
        imageUrl: formData.imageUrl,
        allowedSizes: formData.allowedSizes,
        specialties: formData.specialties
      });

      // 2. Update private details
      await updatePrivateProfile({
        phone: formData.phone,
        address: formData.address,
        id_number: formData.id_number
      });

      // 3. Update public avatar if changed
      if (formData.imageUrl !== profile?.avatarUrl) {
        await updateProfileAvatar(formData.imageUrl);
      }

      setIsEditing(false);
      setNotifMsg('¡Tu perfil público y privado se ha actualizado con éxito!');
      setTimeout(() => setNotifMsg(''), 3000);
    }
  };

  const handleBookingAction = async (id: string, action: 'confirmed' | 'rejected') => {
    await updateBookingStatus(id, action);
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => {
      const allowedSizes = prev.allowedSizes.includes(size)
        ? prev.allowedSizes.filter(s => s !== size)
        : [...prev.allowedSizes, size];
      return { ...prev, allowedSizes };
    });
  };

  const handleSpecialtyToggle = (spec: string) => {
    setFormData(prev => {
      const specialties = prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec];
      return { ...prev, specialties };
    });
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
      name: client?.name || 'Cliente',
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
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gestiona tus solicitudes de trabajo, tu horario diario y tu información pública/privada.</p>
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
                            <span style={{ fontSize: '0.8rem', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span>{booking.status === 'confirmed' ? 'Reserva Confirmada' : 'Reserva Rechazada'}</span>
                              {booking.status === 'confirmed' && (
                                paidBookingIds.includes(booking.id) ? (
                                  <span style={{ color: '#5a8a29', fontWeight: 600 }}>💵 Pagado</span>
                                ) : (
                                  <span style={{ color: '#9c750b', fontWeight: 600 }}>🕒 Pendiente de Pago</span>
                                )
                              )}
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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {paidBookingIds.includes(booking.id) ? (
                                <span style={{ background: '#dff2cc', color: '#5a8a29', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>💵 Pagado</span>
                              ) : (
                                <span style={{ background: '#faeab1', color: '#9c750b', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>🕒 Pendiente de Pago</span>
                              )}
                              <span style={{ background: '#eafaf1', color: '#2ecc71', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Confirmado</span>
                            </div>
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
              Mi Perfil
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
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--accent-brown)', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Datos Públicos</h4>
                </div>
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
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Biografía</label>
                  <textarea 
                    rows={4}
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', color: '#222', background: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Foto de Perfil</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {PRESET_AVATARS.map(av => (
                      <img 
                        key={av} 
                        src={av} 
                        alt="Preset Avatar"
                        onClick={() => setFormData({...formData, imageUrl: av})}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', border: formData.imageUrl === av ? '2px solid var(--accent-brown)' : '2px solid transparent', objectFit: 'cover' }} 
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="URL de foto..." 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', color: '#222', background: '#fff' }}
                  />
                </div>

                <div>
                  <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--accent-brown)', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Capacidades de Paseo</h4>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Tamaños que Puedes Pasear</label>
                  {['Pequeño', 'Mediano', 'Grande'].map(size => (
                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.allowedSizes.includes(size)} 
                        onChange={() => handleSizeToggle(size)} 
                      />
                      🐶 {size}
                    </label>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: '6px' }}>Tus Especialidades</label>
                  {['Cachorros', 'Adultos Mayores', 'Razas muy activas', 'Administración de medicamentos', 'Comportamiento reactivo'].map(spec => (
                    <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.specialties.includes(spec)} 
                        onChange={() => handleSpecialtyToggle(spec)} 
                      />
                      ✨ {spec}
                    </label>
                  ))}
                </div>

                <div>
                  <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: '#c0392b', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Datos Privados (Solo Admin)</h4>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ej. +591 76543210"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>Dirección Hogar</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Ej. Calle Junin #45"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '4px' }}>DNI / Cédula Identidad</label>
                  <input 
                    type="text" 
                    value={formData.id_number} 
                    onChange={e => setFormData({...formData, id_number: e.target.value})}
                    placeholder="Ej. 10982736"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', color: '#222', background: '#fff' }}
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', margin: 0, maxHeight: '100px', overflowY: 'auto' }}>
                    {currentWalker?.aboutParagraphs[0]}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: '4px' }}>Capacidades de Paseo</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {currentWalker?.allowedSizes && currentWalker.allowedSizes.length > 0 ? (
                      currentWalker.allowedSizes.map(s => (
                        <span key={s} style={{ background: '#e3fafc', color: '#0b7285', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>🐶 {s}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#999', fontStyle: 'italic' }}>Sin tamaños especificados</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {currentWalker?.specialties && currentWalker.specialties.length > 0 ? (
                      currentWalker.specialties.map(s => (
                        <span key={s} style={{ background: '#f3f0ff', color: '#6f2dbd', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>✨ {s}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#999', fontStyle: 'italic' }}>Sin especialidades</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: '#fdfdfd', padding: '0.75rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#c0392b', display: 'block', marginBottom: '4px' }}>🔒 Mis Datos Privados (Solo Admin)</span>
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', color: '#555' }}>
                    <div>📞 <strong>Teléfono:</strong> {privateProfile?.phone || 'N/D'}</div>
                    <div>📍 <strong>Dirección:</strong> {privateProfile?.address || 'N/D'}</div>
                    <div>🪪 <strong>DNI / ID:</strong> {privateProfile?.id_number || 'N/D'}</div>
                  </div>
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
  const { 
    profiles, 
    allBookings, 
    allDogs, 
    walkers, 
    updateUserProfileRole, 
    cancelBooking, 
    getPrivateProfileForAdmin, 
    deleteUserAccount, 
    deleteWalkerProfile, 
    deleteDog 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'walkers' | 'dogs'>('users');
  const [roleChangeMsg, setRoleChangeMsg] = useState('');

  // viewing private profile state
  const [viewingPrivateUser, setViewingPrivateUser] = useState<Profile | null>(null);
  const [privateUserData, setPrivateUserData] = useState<{ phone: string; address: string; id_number: string } | null>(null);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);

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

  const handleViewPrivate = async (userObj: Profile) => {
    setViewingPrivateUser(userObj);
    setIsLoadingPrivate(true);
    const data = await getPrivateProfileForAdmin(userObj.id);
    setPrivateUserData(data || { phone: '', address: '', id_number: '' });
    setIsLoadingPrivate(false);
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
        <button 
          onClick={() => setActiveTab('dogs')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'dogs' ? '3px solid var(--accent-brown)' : '3px solid transparent',
            paddingBottom: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'dogs' ? 'var(--accent-brown)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          🐶 Gestión de Mascotas ({allDogs.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', color: '#333' }}>
        
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
                    <th style={{ padding: '1rem' }}>Cambiar Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
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
                      <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#666', fontSize: '0.8rem' }}>{p.id.substring(0, 15)}...</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: p.role === 'admin' ? '#ffe3e3' : p.role === 'employee' ? '#e3fafc' : '#dff2cc',
                          color: p.role === 'admin' ? '#c92a2a' : p.role === 'employee' ? '#0b7285' : '#5a8a29',
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize'
                        }}>
                          {p.role === 'employee' ? 'Paseador' : p.role === 'admin' ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={p.role} 
                          onChange={(e) => handleRoleChange(p.id, e.target.value as Profile['role'])}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', outline: 'none', background: '#fff', color: '#222' }}
                        >
                          <option value="client">Cliente</option>
                          <option value="employee">Paseador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleViewPrivate(p)}
                          style={{ background: '#eae7de', border: '1px solid #ccc', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: '#333' }}
                        >
                          🪪 Ver Datos
                        </button>
                        <button 
                          onClick={async () => {
                            if (p.role === 'admin') {
                              alert('No es posible eliminar al Administrador.');
                              return;
                            }
                            if (confirm(`¿Estás seguro de eliminar a ${p.name} y toda su información (perros, reservas, datos) permanentemente?`)) {
                              await deleteUserAccount(p.id);
                            }
                          }}
                          style={{ background: '#fdf3f2', border: '1px solid #f5c6cb', color: '#d9534f', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🗑️ Eliminar
                        </button>
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
                                onClick={async () => {
                                  if (confirm(`¿Estás seguro de cancelar esta reserva?`)) {
                                    await cancelBooking(b.id);
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
                              >
                                Cancelar Paseo
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
                    <th style={{ padding: '1rem' }}>Capacidades y Especialidades</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
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
                      <td style={{ padding: '1rem', color: '#8a7322', fontWeight: 500 }}>★ {w.rating.toFixed(1)} ({w.reviewsCount} reviews)</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#555' }}>
                          Tamaños: {w.allowedSizes && w.allowedSizes.length > 0 ? w.allowedSizes.join(', ') : 'No especificados'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                          Esp: {w.specialties && w.specialties.length > 0 ? w.specialties.join(', ') : 'Ninguna'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <a href={`/profile?id=${w.id}`} style={{ color: 'var(--accent-brown)', textDecoration: 'underline', fontWeight: 500, fontSize: '0.85rem' }}>Ver Perfil</a>
                        <button 
                          onClick={async () => {
                            if (confirm(`¿Estás seguro de eliminar el perfil público del paseador ${w.name}?`)) {
                              await deleteWalkerProfile(w.id);
                            }
                          }}
                          style={{ background: '#fdf3f2', border: '1px solid #f5c6cb', color: '#d9534f', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🗑️ Quitar Catálogo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DOGS (MASCOTAS) */}
        {activeTab === 'dogs' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', fontWeight: 600 }}>Registro General de Mascotas</h3>
            {allDogs.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', margin: '2rem 0' }}>No hay mascotas registradas en el sistema.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#666' }}>
                      <th style={{ padding: '1rem' }}>Mascota</th>
                      <th style={{ padding: '1rem' }}>Raza</th>
                      <th style={{ padding: '1rem' }}>Edad</th>
                      <th style={{ padding: '1rem' }}>Tamaño</th>
                      <th style={{ padding: '1rem' }}>Propietario</th>
                      <th style={{ padding: '1rem' }}>Notas de Cuidado</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDogs.map(d => {
                      const owner = profiles.find(p => p.id === d.userId);
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid #f2eee3' }}>
                          <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={d.photoUrl} alt={d.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontWeight: 500 }}>{d.name}</span>
                          </td>
                          <td style={{ padding: '1rem' }}>{d.breed}</td>
                          <td style={{ padding: '1rem' }}>{d.age || 'No especificada'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ background: '#e3fafc', color: '#0b7285', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {d.size || 'Mediano'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {owner ? `${owner.name} (${owner.email})` : `ID: ${d.userId?.substring(0, 8)}...`}
                          </td>
                          <td style={{ padding: '1rem', fontStyle: 'italic', color: '#555', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.notes}>
                            {d.notes || 'Sin notas especiales'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button 
                              onClick={async () => {
                                if (confirm(`¿Estás seguro de eliminar el perro ${d.name} permanentemente?`)) {
                                  await deleteDog(d.id);
                                }
                              }}
                              style={{ background: '#fdf3f2', border: '1px solid #f5c6cb', color: '#d9534f', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              🗑️ Eliminar
                            </button>
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
      </div>

      {/* Admin viewing private user data modal */}
      {viewingPrivateUser && (
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
            maxWidth: '480px', 
            width: '90%', 
            position: 'relative', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
            color: '#333' 
          }}>
            <button 
              onClick={() => { setViewingPrivateUser(null); setPrivateUserData(null); }} 
              style={{ 
                position: 'absolute', 
                top: '1.5rem', right: '1.5rem', 
                background: 'none', border: 'none', 
                fontSize: '1.5rem', cursor: 'pointer', 
                color: '#666', outline: 'none' 
              }}
            >
              ×
            </button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>🔒 Datos Privados de Usuario</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <img src={viewingPrivateUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} alt={viewingPrivateUser.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block' }}>{viewingPrivateUser.name}</strong>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>{viewingPrivateUser.email}</span>
              </div>
            </div>

            {isLoadingPrivate ? (
              <p style={{ color: '#666', fontSize: '0.95rem' }}>Cargando datos privados...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <div>📞 <strong>Teléfono:</strong> {privateUserData?.phone || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificado</span>}</div>
                <div>📍 <strong>Dirección:</strong> {privateUserData?.address || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificada</span>}</div>
                <div>🪪 <strong>DNI / Cédula / ID:</strong> {privateUserData?.id_number || <span style={{color:'#aaa', fontStyle:'italic'}}>No especificado</span>}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#888' }}>
                  🔑 <strong>Supabase ID:</strong> <span style={{fontFamily:'monospace'}}>{viewingPrivateUser.id}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
