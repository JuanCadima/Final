'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../hooks/AppContext';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, signup, isMockMode, toggleMockMode, mockLogin } = useAppContext();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'employee'>('client');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (isRegister) {
      if (!name || !email || !password) {
        setErrorMsg('Por favor completa todos los campos.');
        setIsSubmitting(false);
        return;
      }
      const { error, data } = await signup(email, password, name, role);
      if (error) {
        setErrorMsg(error.message || 'Error al registrarse. Por favor intenta de nuevo.');
      } else {
        setSuccessMsg(
          isMockMode
            ? '¡Registro exitoso! Iniciando sesión...'
            : '¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta (o inicia sesión si la confirmación no es requerida).'
        );
        setTimeout(() => {
          if (isMockMode) router.push('/dashboard');
          else setIsRegister(false);
        }, 2500);
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Por favor completa todos los campos.');
        setIsSubmitting(false);
        return;
      }
      const { error } = await login(email, password);
      if (error) {
        setErrorMsg(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      } else {
        setSuccessMsg('¡Sesión iniciada con éxito! Redirigiendo...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    }
    setIsSubmitting(false);
  };

  const handleQuickDemo = (demoRole: 'admin' | 'client' | 'employee') => {
    mockLogin(demoRole);
    setSuccessMsg(`Iniciando sesión de demostración como ${demoRole === 'admin' ? 'Administrador' : demoRole === 'employee' ? 'Paseador' : 'Cliente'}...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <main style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, #fdf8f4 0%, #f5f2e8 90%)',
        overflow: 'hidden'
      }}>
        {/* Background blobs for premium depth */}
        <div style={{
          position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px',
          background: 'rgba(165, 70, 5, 0.04)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px',
          background: 'rgba(75, 110, 45, 0.05)', borderRadius: '50%', filter: 'blur(90px)', zIndex: 0
        }}></div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e0d3',
          boxShadow: '0 25px 50px -12px rgba(165, 70, 5, 0.06), 0 0 2px 0 rgba(0,0,0,0.05)',
          borderRadius: '32px',
          padding: '3rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'var(--accent-brown)', display: 'block', marginBottom: '0.5rem'
            }}>
              {isMockMode ? 'Modo Demostración Activo' : 'Portal de Acceso'}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', margin: 0, fontWeight: 700 }}>
              {isRegister ? 'Crear una Cuenta' : 'Te damos la Bienvenida'}
            </h1>
            <p style={{ color: '#777', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {isRegister ? 'Únete a la red más exclusiva de cuidado de mascotas' : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>



          {/* Notifications */}
          {errorMsg && (
            <div style={{
              background: '#fdf3f2', borderLeft: '4px solid #d9534f', color: '#c9302c',
              padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem',
              lineHeight: '1.4'
            }}>
              <strong>⚠️ Error:</strong> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{
              background: '#f4faf0', borderLeft: '4px solid #5cb85c', color: '#3c763d',
              padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem',
              lineHeight: '1.4'
            }}>
              <strong>✨ Éxito:</strong> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegister && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #ddd',
                    fontSize: '0.95rem', outline: 'none', background: '#fff', color: '#222'
                  }}
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Correo Electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #ddd',
                  fontSize: '0.95rem', outline: 'none', background: '#fff', color: '#222'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #ddd',
                  fontSize: '0.95rem', outline: 'none', background: '#fff', color: '#222'
                }}
                required
              />
            </div>

            {/* Role selection for registration */}
            {isRegister && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Tipo de Cuenta</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    onClick={() => setRole('client')}
                    style={{
                      border: `2px solid ${role === 'client' ? 'var(--accent-brown)' : '#eee'}`,
                      background: role === 'client' ? '#fdf5ef' : '#fff',
                      padding: '0.75rem', borderRadius: '14px', cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🦮</span>
                    <strong style={{ fontSize: '0.85rem', color: '#222' }}>Cliente</strong>
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>Quiero paseos</span>
                  </div>
                  <div
                    onClick={() => setRole('employee')}
                    style={{
                      border: `2px solid ${role === 'employee' ? 'var(--accent-brown)' : '#eee'}`,
                      background: role === 'employee' ? '#fdf5ef' : '#fff',
                      padding: '0.75rem', borderRadius: '14px', cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🏃🐾</span>
                    <strong style={{ fontSize: '0.85rem', color: '#222' }}>Paseador</strong>
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>Quiero trabajar</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%', padding: '1rem', borderRadius: '50px', fontSize: '1.05rem',
                marginTop: '0.5rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Toggle login/register */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#666' }}>
              {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            </span>{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-brown)',
                fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0
              }}
            >
              {isRegister ? 'Inicia Sesión aquí' : 'Regístrate aquí'}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', margin: '2rem 0 1.25rem',
            fontSize: '0.75rem', color: '#8c7355', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600
          }}>
            <div style={{ flex: 1, height: '1px', background: '#eae5d8' }}></div>
            <span style={{ padding: '0 12px' }}>Acceso Rápido Demo</span>
            <div style={{ flex: 1, height: '1px', background: '#eae5d8' }}></div>
          </div>

          {/* Quick login grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handleQuickDemo('client')}
              style={{
                background: '#fcfaf5', border: '1px solid #e5e0d3', borderRadius: '16px',
                padding: '0.75rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', textAlign: 'center', outline: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fdf5ef';
                e.currentTarget.style.borderColor = 'var(--accent-brown)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fcfaf5';
                e.currentTarget.style.borderColor = '#e5e0d3';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ background: '#dff2cc', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🦮</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#111', display: 'block', fontWeight: 700 }}>Cliente</strong>
                <span style={{ fontSize: '0.6rem', color: '#777' }}>Ver panel</span>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('employee')}
              style={{
                background: '#fcfaf5', border: '1px solid #e5e0d3', borderRadius: '16px',
                padding: '0.75rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', textAlign: 'center', outline: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fdf5ef';
                e.currentTarget.style.borderColor = 'var(--accent-brown)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fcfaf5';
                e.currentTarget.style.borderColor = '#e5e0d3';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ background: '#e3fafc', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏃</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#111', display: 'block', fontWeight: 700 }}>Paseador</strong>
                <span style={{ fontSize: '0.6rem', color: '#777' }}>Ver horario</span>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              style={{
                background: '#fcfaf5', border: '1px solid #e5e0d3', borderRadius: '16px',
                padding: '0.75rem 0.5rem', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', textAlign: 'center', outline: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fdf5ef';
                e.currentTarget.style.borderColor = 'var(--accent-brown)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fcfaf5';
                e.currentTarget.style.borderColor = '#e5e0d3';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ background: '#ffe3e3', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚙️</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#111', display: 'block', fontWeight: 700 }}>Admin</strong>
                <span style={{ fontSize: '0.6rem', color: '#777' }}>Gestionar</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
