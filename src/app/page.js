"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import PhotoGallery from '@/components/PhotoGallery';
import IPadCamera from '@/components/IPadCamera';

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState('guest');

  useEffect(() => {
    setUserRole(Cookies.get('user_role') || 'guest');
  }, []);

  const handlePhotoTaken = () => {
    setShowCamera(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main>
      <header className="header">
        <div className="header-logo">
          <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: 'white' }}>CO</span>
            <span style={{ color: 'var(--color-yellow)' }}>4</span>
            <span style={{ color: 'white' }}>Kids</span>
          </h1>
          <span style={{ color: 'white', marginLeft: '10px', opacity: 0.8, fontSize: '1.2rem', alignSelf: 'flex-end', paddingBottom: '4px' }}>Event Photos</span>
        </div>
      </header>

      {/* Hero section */}
      {!showCamera && (
        <div className="container">
          <div className="hero-split" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="hero-pane-left" style={{ flex: 1 }}>
              <h2>Capture the Magic</h2>
              <p>Welcome to our exclusive event! Follow the link or click below to take a picture of your family in front of our magical frames.</p>
              
              <button 
                onClick={() => setShowCamera(true)}
                style={{
                  marginTop: '1.5rem',
                  padding: '16px 32px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  backgroundColor: 'var(--color-yellow)',
                  color: 'var(--color-navy)',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                📸 Open Camera Kiosk
              </button>
            </div>
            <div className="hero-pane-right" style={{ flex: 1 }}>
              <h2>Together We Build Strong Families</h2>
              <p>Relive the magic of our zoo event. Find your children's moments and share them instantly!</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!showCamera && (
        <div className="container" style={{ paddingTop: '0' }}>
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-teal)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Event Gallery
            </h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
              Browse the latest captures. Every smile brings us closer together!
            </p>
            <PhotoGallery refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}

      {/* Interactive Camera Component */}
      {showCamera && (
        <IPadCamera 
          mode={userRole}
          onClose={() => setShowCamera(false)} 
          onPhotoTaken={handlePhotoTaken} 
        />
      )}

      {/* Footer */}
      {!showCamera && (
        <footer style={{ backgroundColor: 'var(--color-navy)', color: 'white', padding: '3rem 2rem', textAlign: 'center', marginTop: '4rem' }}>
          <p>© {new Date().getFullYear()} CO4Kids. Building stronger families together.</p>
          <p style={{ fontSize: '1rem', color: 'var(--color-teal)', marginTop: '1rem', fontWeight: 'bold' }}>Developed by Bo</p>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>Donated for the Zoo Event.</p>
        </footer>
      )}
    </main>
  );
}
