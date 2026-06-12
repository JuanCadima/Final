'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAppContext } from '../../hooks/AppContext';

function WalkersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const { walkers, isLoading } = useAppContext();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div style={{textAlign: 'center', padding: '4rem 0', color: '#666'}}>
        <p>Cargando paseadores premium...</p>
      </div>
    );
  }

  const filteredWalkers = walkers.filter(walker => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      walker.name.toLowerCase().includes(query) ||
      walker.location.toLowerCase().includes(query) ||
      walker.tags.some(tag => tag.toLowerCase().includes(query)) ||
      walker.tagline.toLowerCase().includes(query)
    );
  });

  return (
    <main className="container" style={{paddingTop: '3rem', paddingBottom: '3rem', minHeight: '80vh'}}>
      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)'}}>Encuentra tu Paseador Ideal</h1>
        <p style={{color: '#666', fontSize: '1.1rem'}}>Descubre paseadores premium en tu área, cuidadosamente verificados para tu tranquilidad.</p>
      </div>
      
      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
        <input 
          type="text" 
          placeholder="Busca por ubicación, nombre o etiquetas (ej. Cachorro, Activo)..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', background: '#fff', color: '#222'}}
        />
        {searchQuery && (
          <button 
            className="btn btn-secondary" 
            onClick={() => setSearchQuery('')}
            style={{borderRadius: '8px'}}
          >
            Limpiar
          </button>
        )}
      </div>

      {filteredWalkers.length === 0 ? (
        <div style={{textAlign: 'center', padding: '4rem 0', color: '#666'}}>
          <span style={{fontSize: '3rem', display: 'block', marginBottom: '1rem'}}>🔍</span>
          <h3>No se encontraron paseadores que coincidan con "{searchQuery}"</h3>
          <p>Intenta buscar otra ubicación o especialidad de raza.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem'}}>
          {filteredWalkers.map(walker => (
            <div key={walker.id} style={{border: '1px solid #eaeaea', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <div style={{height: '200px', width: '100%', overflow: 'hidden', position: 'relative'}}>
                  <img src={walker.imageUrl} alt={walker.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  <div style={{position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                    {walker.tags.map(tag => (
                      <span key={tag} style={{background: 'rgba(255,255,255,0.95)', padding: '4px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{padding: '1.5rem 1.5rem 0.5rem 1.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                    <h3 style={{margin: 0, fontSize: '1.25rem'}}>{walker.name}</h3>
                    <div style={{fontWeight: 600, color: '#222'}}>${walker.price}<span style={{fontSize: '0.8rem', color: '#666', fontWeight: 400}}>/paseo</span></div>
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem'}}>
                    {walker.location} • <span style={{color: '#8a7322'}}>★ {walker.rating.toFixed(1)}</span> ({walker.reviewsCount})
                  </div>
                  <p style={{fontSize: '0.9rem', color: '#444', marginBottom: '1.5rem', lineHeight: 1.5}}>
                    {walker.tagline}
                  </p>
                </div>
              </div>
              <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
                <a href={`/profile?id=${walker.id}`} className="btn btn-secondary" style={{width: '100%', textAlign: 'center', display: 'block'}}>Ver Perfil</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function WalkersPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="container" style={{paddingTop: '3rem', minHeight: '80vh', textAlign: 'center'}}>
          <p>Cargando paseadores...</p>
        </div>
      }>
        <WalkersContent />
      </Suspense>
      <Footer />
    </>
  );
}
