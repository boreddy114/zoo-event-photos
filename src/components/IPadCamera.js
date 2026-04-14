"use client";
import { useState, useRef, useEffect } from 'react';

export default function IPadCamera({ onPhotoTaken, onClose }) {
  const [stream, setStream] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Camera automatically when facingMode changes or when we clear photoDataUrl
  useEffect(() => {
    let currentStream = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        currentStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // IMPORTANT: Mirror the video explicitly via CSS if it's the front camera so the user isn't confused
          videoRef.current.style.transform = facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    if (!photoDataUrl) {
      startCamera();
    }

    return () => {
      // Auto-cleanup the stream when taking a photo or unmounting!
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, photoDataUrl]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Mirror the final image data if it was the front camera so they don't get a backward photo
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Draw the main video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to target base64 URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoDataUrl(dataUrl);
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    setStatus('');
    setEmail('');
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email || !photoDataUrl) return;

    // Immediately kick off the background job so the user isn't frozen!
    const capturedData = photoDataUrl;
    const capturedEmail = email;

    // Fire and forget upload and email
    (async () => {
      try {
        const uRes = await fetch('/api/upload-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: capturedData })
        });
        
        const uData = await uRes.json();
        if (uData.success) {
          await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: capturedEmail, photoUrl: uData.fileUrl })
          });
        }
      } catch (err) {
        console.error("Background upload/email failed:", err);
      }
    })();

    // Show a blazing fast success and reset the camera for the next person in line
    setStatus('Success! Photo is sending...');
    setIsProcessing(true); // lock the form briefly
    setTimeout(() => {
      handleRetake();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflowY: 'auto'
    }}>
      
      {/* Hidden Canvas for processing captures */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top Header Controls */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: '10px' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: '#333', color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>
          Back to Gallery
        </button>
        {!photoDataUrl && (
          <button 
            type="button"
            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')} 
            style={{ padding: '10px 20px', borderRadius: '8px', background: '#49c4b7', color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '20px', height: '20px' }}>
              <path d="M4 4l-4 4h3v6A2 2 0 005 16h6v-2H5V8h3L4 4zm16 12l-4-4h-3V6a2 2 0 00-2-2H5v2h6v6h-3l4 4z"></path>
            </svg>
            Flip Camera
          </button>
        )}
      </div>

      {!photoDataUrl ? (
        <>
          {/* Removed Overlay Selector per user request */}

          <div style={{ position: 'relative', width: '90%', height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* The Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '24px' }} 
            />
          </div>

          {/* Capture Button */}
          <button 
            onClick={handleCapture}
            style={{
              position: 'absolute', bottom: '40px', width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: 'white', border: '8px solid #ccc', cursor: 'pointer', outline: 'none',boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', background: '#f5f5f5', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '600px', padding: '20px', margin: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
            
            <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
              <img src={photoDataUrl} alt="Captured" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
            </div>

            <h2 style={{ color: '#0f2046', marginBottom: '10px' }}>Looking Great!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enter the family's email address to send them the photo.</p>

            <form onSubmit={handleSubmitEmail}>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="family@example.com"
                style={{ width: '100%', padding: '14px', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px', textAlign: 'center' }}
                disabled={isProcessing}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button type="button" onClick={handleRetake} disabled={isProcessing} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#ccc', color: '#333', fontSize: '1.1rem', cursor: 'pointer' }}>
                  Retake
                </button>
                <button type="submit" disabled={isProcessing || !email} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#49c4b7', color: 'white', fontSize: '1.1rem', cursor: 'pointer', flexGrow: 1 }}>
                  {isProcessing ? 'Sending...' : 'Send Email & Global Gallery'}
                </button>
              </div>
            </form>
            
            {status && <p style={{ marginTop: '20px', fontWeight: 'bold', color: status.includes('Success') ? 'green' : '#333' }}>{status}</p>}

          </div>
        </div>
      )}
    </div>
  );
}
