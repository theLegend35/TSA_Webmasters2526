import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <section style={aboutHero}>
        <h1 style={{ color: 'white' }}>Leading the Cypress Community</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, color: 'white' }}>
          A vision for a more connected and supported Cypress, Texas.
        </p>
      </section>

      <div style={container}>
        <section style={missionSection}>
          <h2 style={sectionTitle}>Our Mission</h2>
          <p style={{ color: 'var(--text-main)' }}>
            CypressHub was founded to solve a critical problem: local resources are often 
            scattered across social media and outdated physical boards. As community leaders, 
            we built this hub to centralize food security, health services, and educational 
            support for every resident in the 77429 and 77433 zip codes.
          </p>
        </section>

        <section style={statementContainer}>
          <div style={textSide}>
            <h2 style={{ color: 'var(--primary)', marginTop: 0 }}>Leader's Message</h2>
            <p style={quoteText}>
              "Our goal for the Cypress Community Hub isn't just to list phone numbers. 
              It's to ensure that every family in our neighborhood feels supported and connected. 
              We believe that a stronger Cypress starts with accessible information."
            </p>
            <p style={{ fontWeight: 'bold', marginTop: '20px', color: 'var(--text-main)' }}>
              — The CypressHub Leadership Team
            </p>
          </div>
          <div style={imageSide}>
            <div style={photoPlaceholder}>
              <span>Leader Portrait / Team Photo</span>
            </div>
          </div>
        </section>

        <section style={gallerySection}>
          <h2 style={sectionTitle}>Community Landmarks</h2>
          <div style={imageGrid}>
            
            <div style={cardStyle}>
              <img 
                src="https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg" 
                alt="The Boardwalk at Towne Lake" 
                style={imgStyle} 
              />
              <div style={labelStyle}>The Boardwalk at Towne Lake</div>
            </div>

            <div style={cardStyle}>
              <img 
                src="https://s.hdnux.com/photos/01/23/35/65/21880172/4/1200x0.jpg" 
                alt="Berry Center" 
                style={imgStyle} 
              />
              <div style={labelStyle}>The Berry Center</div>
            </div>

            <div style={cardStyle}>
              <img 
                src="https://s.hdnux.com/photos/01/23/41/37/21895159/4/1200x0.jpg" 
                alt="Lakeland Village Center" 
                style={imgStyle} 
              />
              <div style={labelStyle}>Lakeland Village Center</div>
            </div>

          </div>
          <p style={caption}>*All images represent the local Cypress area we serve.*</p>
        </section>
      </div>
    </div>
  );
};


const aboutHero: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  padding: '80px 20px',
  textAlign: 'center',
  borderRadius: '12px',
  marginBottom: '40px'
};

const container = { 
  maxWidth: '900px', 
  margin: '0 auto', 
  padding: '0 20px' 
};

const sectionTitle: React.CSSProperties = {
  fontSize: '2rem',
  color: 'var(--text-main)',
  borderBottom: '3px solid var(--primary)',
  display: 'inline-block',
  marginBottom: '20px'
};

const missionSection = { 
  marginBottom: '60px', 
  lineHeight: '1.8', 
  fontSize: '1.15rem'
};

const statementContainer: React.CSSProperties = {
  display: 'flex',
  gap: '40px',
  alignItems: 'center',
  padding: '40px',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '15px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  marginBottom: '60px',
  border: '1px solid var(--border-color)',
  flexWrap: 'wrap' as const
};

const textSide = { flex: '2', minWidth: '300px' };
const imageSide = { flex: '1', minWidth: '250px' };

const quoteText: React.CSSProperties = { 
  fontStyle: 'italic', 
  fontSize: '1.2rem', 
  color: 'var(--text-muted)',
  borderLeft: '4px solid var(--primary)',
  paddingLeft: '20px',
  margin: '20px 0'
};

const photoPlaceholder: React.CSSProperties = { 
  height: '250px', 
  backgroundColor: 'var(--bg-color)',
  borderRadius: '10px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  padding: '20px',
  border: '1px solid var(--border-color)'
};

const gallerySection = { marginBottom: '60px' };
const imageGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' };

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  border: '1px solid var(--border-color)'
};

const imgStyle = { width: '100%', height: '180px', objectFit: 'cover' as const, display: 'block' };

const labelStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'center' as const,
  fontWeight: '600',
  fontSize: '0.9rem',
  color: 'var(--text-main)',
  backgroundColor: 'var(--bg-color)'
};

const caption = { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '15px', fontStyle: 'italic' };

export default AboutPage;