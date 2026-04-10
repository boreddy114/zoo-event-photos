"use client";
import { useState } from 'react';

export default function EmailModal({ photoUrl, onClose }) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '', previewUrl: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setStatus({ type: '', message: '', previewUrl: '' });

    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, photoUrl })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: 'Hooray! The photo is flying to your inbox! 🚀',
          previewUrl: data.previewUrl
        });
      } else {
        setStatus({ type: 'error', message: 'Oops! Something went wrong. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Share the Fun!</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-image-container">
            <img src={photoUrl} alt="Your amazing moment" className="modal-image" />
          </div>

          {status.type === 'success' ? (
            <div className="text-center animate-fade-in">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h4 className="text-teal mb-4">{status.message}</h4>
              {status.previewUrl && (
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <strong>Demo Mode Active:</strong><br />
                  <a href={status.previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'underline' }}>
                    Click here to preview the sent email
                  </a>
                </div>
              )}
              <button 
                className="btn btn-primary btn-block mt-4"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="form-group">
                <label htmlFor="email">Where should we send this special moment?</label>
                <input 
                  type="email" 
                  id="email"
                  className="form-input" 
                  placeholder="parent@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {status.type === 'error' && (
                <div className="text-coral mb-4" style={{ fontWeight: '600' }}>
                  {status.message}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-secondary btn-block"
                disabled={isSending || !email}
              >
                {isSending ? "Sending magic... ✨" : "Send to Email"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
