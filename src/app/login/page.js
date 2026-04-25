"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Login() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Use an environment variable or a simple hardcoded code for the kiosk
    const validPasscode = process.env.NEXT_PUBLIC_EVENT_PASSCODE || 'co4kids';
    const volunteerPasscode = process.env.NEXT_PUBLIC_VOLUNTEER_PASSCODE || 'co2kids';

    if (passcode.toLowerCase() === validPasscode.toLowerCase()) {
      Cookies.set('event_auth', 'true', { expires: 1 }); // expires in 1 day
      Cookies.set('user_role', 'guest', { expires: 1 });
      router.push('/');
    } else if (passcode.toLowerCase() === volunteerPasscode.toLowerCase()) {
      Cookies.set('event_auth', 'true', { expires: 1 }); // Still set event_auth so proxy middleware passes them
      Cookies.set('user_role', 'volunteer', { expires: 1 });
      router.push('/');
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px', color: '#0f2046' }}>Welcome</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Please enter the event passcode to access the camera.</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Event Passcode" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '1.2rem',
              borderRadius: '8px', 
              border: '1px solid #ccc',
              marginBottom: '20px',
              textAlign: 'center'
            }} 
          />
          {error && <p style={{ color: 'red', marginTop: '-10px', marginBottom: '20px' }}>{error}</p>}
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1.1rem',
              backgroundColor: '#49c4b7', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Enter Event
          </button>
        </form>
      </div>
    </div>
  );
}
