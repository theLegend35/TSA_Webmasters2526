import React from 'react';
import { useNavigate } from 'react-router-dom';

const PitchSlide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={heroContainer}>
      <div style={overlay}>
        <h1 style={title}>Welcome to Cypress, Texas</h1>
        <p style={subtitle}>
          A thriving community deserves a connected hub. 
          Discover local resources, support services, and events in one place.
        </p>
        <div style={buttonGroup}>
          <button onClick={() => navigate('/directory')} style={primaryBtn}>
            Explore Resources
          </button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})} style={secondaryBtn}>
            Learn Our Mission
          </button>
        </div>
      </div>
    </div>
  );
};

const heroContainer: React.CSSProperties = {
  height: '80vh',
  width: '100%',
  backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '15px',
  overflow: 'hidden',
  marginBottom: '40px'
};

const overlay = { textAlign: 'center' as const, color: 'white', padding: '0 20px' };
const title = { fontSize: '4rem', fontWeight: '800', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' };
const subtitle = { fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto 30px' };
const buttonGroup = { display: 'flex', gap: '15px', justifyContent: 'center' };
const primaryBtn = { padding: '15px 30px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' };
const secondaryBtn = { padding: '15px 30px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', backdropFilter: 'blur(5px)' };

export default PitchSlide;