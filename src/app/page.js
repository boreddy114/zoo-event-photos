"use client";
import { useState } from 'react';
import UploadForm from '@/components/UploadForm';
import PhotoGallery from '@/components/PhotoGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('gallery');
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
          <span style={{ color: 'white', marginLeft: '10px', opacity: 0.8, fontSize: '1.2rem', alignSelf: 'flex-end', paddingBottom: '4px' }}>Events</span>
        </div>
        <nav className="header-nav">
          <span 
            className={`nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Parents
          </span>
          <span 
            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Photographer
          </span>
        </nav>
      </header>

      {/* Hero section */}
      {(activeTab === 'gallery' || activeTab === 'upload') && (
        <div className="container">
          <div className="hero-split">
            <div className="hero-pane-left">
              <h2>Family Fun Moments</h2>
              <p>Relive the magic of our zoo event. Find your children's moments and share them instantly!</p>
              {activeTab === 'upload' && (
                <button className="btn btn-secondary" onClick={() => setActiveTab('gallery')}>
                  View Gallery Instead
                </button>
              )}
            </div>
            <div className="hero-pane-right">
              <h2>Create Awareness</h2>
              <p>Together, helping end child abuse and neglect in Colorado by building strong families.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container" style={{ paddingTop: '0' }}>
        {activeTab === 'upload' && (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        )}
        
        {activeTab === 'gallery' && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-teal)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Event Gallery
            </h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
              Click on any photo to have it sent directly to your email inbox!
            </p>
            <PhotoGallery refreshTrigger={refreshTrigger} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-navy)', color: 'white', padding: '3rem 2rem', textAlign: 'center', marginTop: '4rem' }}>
        <p>© {new Date().getFullYear()} CO4Kids. Building stronger families together.</p>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>This app is a demonstration created for the Zoo Event.</p>
      </footer>
    </main>
  );
}
