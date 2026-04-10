"use client";
import { useState, useRef } from 'react';

export default function UploadForm({ onUploadSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '', emailPreview: '' });
  
  const fileInputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ type: '', message: '', emailPreview: '' });
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEmail('');
    setStatus({ type: '', message: '', emailPreview: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !email) return;

    setIsProcessing(true);
    setStatus({ type: '', message: 'Uploading photo... 📸', emailPreview: '' });

    try {
      // 1. Upload Photo
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error("Failed to upload photo");
      }

      // 2. Send Email
      setStatus({ type: '', message: 'Sending to parents... ✉️', emailPreview: '' });
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, photoUrl: uploadData.fileUrl })
      });
      
      const emailData = await emailRes.json();
      
      if (emailData.success) {
        setStatus({ 
          type: 'success', 
          message: 'Success! Photo saved and sent. 🎉',
          emailPreview: emailData.previewUrl 
        });
        if (onUploadSuccess) onUploadSuccess();
      } else {
        throw new Error("Failed to send email");
      }
      
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.', emailPreview: '' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="upload-container animate-fade-in">
      <h3 style={{ color: "var(--color-navy)", fontSize: "1.5rem", marginBottom: "1rem" }}>
        Instant Photo Share
      </h3>
      <p style={{ color: "var(--color-text-light)", marginBottom: "2rem" }}>
        Take a picture, enter the parent's email, and send it immediately!
      </p>

      {!selectedFile ? (
        <form 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop} 
          onSubmit={(e) => e.preventDefault()}
        >
          <div 
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onClick={() => fileInputRef.current.click()}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p style={{ fontWeight: "600", fontSize: "1.1rem" }}>
              Take Photo / Browse
            </p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            capture="environment" // Suggests taking a picture on mobile!
            onChange={handleChange}
            style={{ display: "none" }}
          />
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ textAlign: "left" }}>
          
          <div style={{ position: "relative", marginBottom: "1.5rem", borderRadius: "12px", overflow: "hidden" }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ width: "100%", height: "300px", objectFit: "cover", display: "block" }} 
            />
            <button 
              type="button" 
              onClick={cancelSelection}
              disabled={isProcessing}
              style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "1.2rem" }}
            >
              &times;
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="parent-email">Parent's Email Address</label>
            <input 
              type="email" 
              id="parent-email"
              className="form-input" 
              placeholder="parent@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          {status.message && (
             <div className="mb-4 text-center">
                <strong style={{ color: status.type === 'error' ? 'var(--color-coral)' : 'var(--color-teal)' }}>
                  {status.message}
                </strong>
             </div>
          )}

          {status.emailPreview && (
            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              <strong>Demo Mode Active:</strong><br />
              <a href={status.emailPreview} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'underline' }}>
                Click here to preview the sent email
              </a>
            </div>
          )}

          {!status.emailPreview ? (
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isProcessing || !email}
            >
              {isProcessing ? "Processing..." : "Upload & Send Photo"}
            </button>
          ) : (
             <button 
                type="button" 
                className="btn btn-secondary btn-block"
                onClick={cancelSelection}
              >
                Take Another Photo
              </button>
          )}

        </form>
      )}
    </div>
  );
}
