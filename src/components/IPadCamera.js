"use client";
import { useState, useRef, useEffect } from 'react';

export default function IPadCamera({ mode = 'guest', onPhotoTaken, onClose }) {
  const [stream, setStream] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [zoom, setZoom] = useState(1);

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
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    if (!isReviewing) {
      startCamera();
    }

    return () => {
      // Auto-cleanup the stream when taking a photo or unmounting!
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, isReviewing]);

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

    // Calculate source rect from video depending on zoom level
    const sourceWidth = video.videoWidth / zoom;
    const sourceHeight = video.videoHeight / zoom;
    const sourceX = (video.videoWidth - sourceWidth) / 2;
    const sourceY = (video.videoHeight - sourceHeight) / 2;

    // Draw only the zoomed, centered portion of the video onto the full canvas
    ctx.drawImage(
      video, 
      sourceX, sourceY, sourceWidth, sourceHeight, // source tracking
      0, 0, canvas.width, canvas.height            // destination rect
    );
    
    // Convert to target base64 URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhotos(prev => [...prev, dataUrl]);
  };

  const handleRetakeAll = () => {
    setCapturedPhotos([]);
    setIsReviewing(false);
    setStatus('');
    setEmail('');
    setZoom(1); // Reset zoom
  };

  const removePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    if (capturedPhotos.length === 1) { // if there was only 1 and we are removing it
      setIsReviewing(false);
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email || capturedPhotos.length === 0) return;

    setStatus('Uploading and sending...');
    setIsProcessing(true);

    const capturedData = [...capturedPhotos];
    const capturedEmail = email;

    // Fire and forget upload and email
    (async () => {
      try {
        let uploadedUrls = [];
        for (const data of capturedData) {
          const uRes = await fetch('/api/upload-base64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: data })
          });
          const uData = await uRes.json();
          if (uData.success) {
            uploadedUrls.push(uData.fileUrl);
          }
        }
        
        if (uploadedUrls.length > 0) {
          await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: capturedEmail, photoUrls: uploadedUrls })
          });
        }
      } catch (err) {
        console.error("Background upload/email failed:", err);
      }
    })();

    setStatus('Success! Photos are sending...');
    setTimeout(() => {
      handleRetakeAll();
      setIsProcessing(false);
    }, 2000);
  };

  const handleVolunteerUpload = async () => {
    if (capturedPhotos.length === 0) return;
    setStatus('Uploading to gallery...');
    setIsProcessing(true);

    try {
      for (const data of capturedPhotos) {
        await fetch('/api/upload-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: data })
        });
      }
      setStatus('Success! Photos added to gallery.');
    } catch (err) {
      setStatus('Error during upload.');
    } finally {
      setTimeout(() => {
        handleRetakeAll();
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflowY: 'auto'
    }}>
      
      {/* Hidden Canvas for processing captures */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!isReviewing ? (
        <>
          {/* Top Header Controls */}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', background: '#333', color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>
              Back to Gallery
            </button>
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
          </div>

          <div style={{ position: 'relative', width: '90%', height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '24px' }}>
            {/* The Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain', 
                transform: `scaleX(${facingMode === 'user' ? -zoom : zoom}) scaleY(${zoom})`,
                transition: 'transform 0.1s ease-out'
              }} 
            />
          </div>

          {/* Zoom Slider Controls */}
          <div style={{
            position: 'absolute', bottom: '180px', display: 'flex', alignItems: 'center', gap: '15px', 
            background: 'rgba(0,0,0,0.6)', padding: '12px 25px', borderRadius: '30px', zIndex: 10,
            backdropFilter: 'blur(5px)'
          }}>
            <span style={{color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer'}} onClick={() => setZoom(z => Math.max(1, z - 0.5))}>-</span>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))} 
              style={{ width: '200px', cursor: 'pointer', accentColor: 'var(--color-yellow, #ffd700)' }} 
            />
            <span style={{color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer'}} onClick={() => setZoom(z => Math.min(4, z + 0.5))}>+</span>
          </div>

          {/* Captured Photos Queue Indicator */}
          {capturedPhotos.length > 0 && (
             <div style={{ position: 'absolute', bottom: '110px', display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '90%', padding: '10px' }}>
               {capturedPhotos.map((p, i) => (
                 <div key={i} style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '2px solid white', flexShrink: 0 }}>
                   <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
               ))}
               <button 
                onClick={() => setIsReviewing(true)}
                style={{ height: '50px', padding: '0 20px', borderRadius: '8px', background: '#49c4b7', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                 Proceed ({capturedPhotos.length}) &rarr;
               </button>
             </div>
          )}

          {/* Capture Button */}
          <button 
            onClick={handleCapture}
            style={{
              position: 'absolute', bottom: '20px', width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: 'white', border: '8px solid #ccc', cursor: 'pointer', outline: 'none',boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          />
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', background: '#f5f5f5', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '800px', padding: '20px', margin: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
            
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px' }}>
              {capturedPhotos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '200px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={p} alt={`Captured ${i}`} style={{ width: '100%', display: 'block' }} />
                  <button 
                    onClick={() => removePhoto(i)} 
                    style={{ position: 'absolute', top: 10, right: 10, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {mode === 'volunteer' ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#0f2046', marginBottom: '10px' }}>Volunteer Mode</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Upload directly to the global event gallery without email.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="button" onClick={() => setIsReviewing(false)} disabled={isProcessing} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#ccc', color: '#333', fontSize: '1.1rem', cursor: 'pointer' }}>
                    Take More
                  </button>
                  <button type="button" onClick={handleVolunteerUpload} disabled={isProcessing} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#49c4b7', color: 'white', fontSize: '1.1rem', cursor: 'pointer', flexGrow: 1 }}>
                    {isProcessing ? 'Uploading...' : `Upload ${capturedPhotos.length} to Gallery`}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ color: '#0f2046', marginBottom: '10px' }}>Looking Great!</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Enter the family's email address to send them these {capturedPhotos.length} {capturedPhotos.length === 1 ? 'photo' : 'photos'}.</p>

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
                    <button type="button" onClick={() => setIsReviewing(false)} disabled={isProcessing} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#ccc', color: '#333', fontSize: '1.1rem', cursor: 'pointer' }}>
                      Take More
                    </button>
                    <button type="submit" disabled={isProcessing || !email} style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#49c4b7', color: 'white', fontSize: '1.1rem', cursor: 'pointer', flexGrow: 1 }}>
                      {isProcessing ? 'Sending...' : `Send Email & Group Gallery`}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {status && <p style={{ marginTop: '20px', fontWeight: 'bold', color: status.includes('Success') ? 'green' : '#333' }}>{status}</p>}

          </div>
        </div>
      )}
    </div>
  );
}
