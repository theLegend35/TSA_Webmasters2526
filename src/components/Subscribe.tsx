import React, { useState } from 'react';

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setStatus('success');
    setEmail("");
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div style={subBox}>
      <h4 style={{color: 'var(--text-main)', margin: '0 0 5px 0'}}>Cypress Weekly Updates</h4>
      <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>
        Get local resources and events sent to your inbox.
      </p>
      
      {status === 'success' ? (
        <div style={{color: '#10b981', fontWeight: 'bold', marginTop: '10px'}}>✓ You're on the list!</div>
      ) : (
        <form onSubmit={handleSubscribe} style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
          <input 
            type="email" 
            placeholder="your@email.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={subInput}
          />
          <button type="submit" style={subBtn}>Join</button>
        </form>
      )}
    </div>
  );
};

const subBox: React.CSSProperties = { 
  padding: '20px', 
  background: 'var(--bg-color)',
  borderRadius: '12px', 
  marginTop: '20px',
  border: '1px solid var(--border-color)'
};

const subInput: React.CSSProperties = { 
  flex: 1, 
  padding: '8px', 
  borderRadius: '4px', 
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)',      
  color: 'var(--text-main)',          
  fontSize: '0.9rem'
};

const subBtn: React.CSSProperties = { 
  background: 'var(--primary)', 
  color: 'white', 
  border: 'none', 
  padding: '8px 15px', 
  borderRadius: '4px', 
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Subscribe;