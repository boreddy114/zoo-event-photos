"use client";
import { useState, useEffect } from 'react';
import EmailModal from './EmailModal';

export default function PhotoGallery({ refreshTrigger }) {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos');
        const data = await res.json();
        if (data.success) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error("Failed to fetch photos", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [refreshTrigger]);

  if (isLoading) {
    return <div className="text-center mt-4">Loading magical memories... ✨</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="text-center mt-4 p-4" style={{ background: '#fff', borderRadius: '12px', color: 'var(--color-text-light)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-navy)' }}>No photos yet!</h3>
        <p>Photographers, start uploading to fill the gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid animate-fade-in">
        {photos.map((photo, i) => (
          <div 
            key={i} 
            className="gallery-item"
            onClick={() => setSelectedPhoto(photo.url)}
          >
            <img 
              src={photo.url} 
              alt="Zoo event moment" 
              loading="lazy" 
              onError={() => setPhotos(current => current.filter(p => p.url !== photo.url))}
            />
            <div className="gallery-overlay">
              <span>
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '20px', height: '20px' }}><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                Send to Email
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <EmailModal 
          photoUrl={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </>
  );
}
