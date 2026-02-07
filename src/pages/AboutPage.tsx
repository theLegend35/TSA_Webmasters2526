import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AboutPage: React.FC = () => {
  const { theme } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className={`about-page-container ${isDark ? 'dark-mode' : ''}`}>
      
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-glass-card">
            <span className="hero-badge">Serving 77429 & 77433</span>
            <h1>Leading the <span className="text-gradient">Cypress</span> Community</h1>
            <p>A vision for a more connected, resilient, and supported neighborhood.</p>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        
        <section className="mission-intro">
           <h2 className="section-title">Our Mission</h2>
           <div className="mission-flex">
              <div className="mission-main-text">
                <p>
                  CypressHub was founded to solve a critical problem: local resources are often 
                  scattered across social media and outdated physical boards. We built this hub to 
                  centralize food security, health services, and educational support for every 
                  resident in the Cypress area.
                </p>
              </div>
              
              <div className="value-strips-container">
                <div className="value-strip">
                  <div className="strip-icon">🤝</div>
                  <div className="strip-info">
                    <h5>Fully Accessible</h5>
                    <p>Critical info for every neighbor, 24/7.</p>
                  </div>
                </div>
                <div className="value-strip">
                  <div className="strip-icon">📍</div>
                  <div className="strip-info">
                    <h5>Hyper-Local Focus</h5>
                    <p>Strictly verified Cypress resources.</p>
                  </div>
                </div>
                <div className="value-strip">
                  <div className="strip-icon">🛡️</div>
                  <div className="strip-info">
                    <h5>Community Led</h5>
                    <p>Built by locals, for locals.</p>
                  </div>
                </div>
              </div>
           </div>
        </section>

        <section className="leader-message-section">
          <div className="quote-container">
            <span className="quote-mark">“</span>
            <p className="quote-body">
              Our goal for the Cypress Community Hub isn't just to list phone numbers. 
              It's to ensure that every family in our neighborhood feels supported and connected.
            </p>
            <div className="quote-footer">
              <strong>The CypressHub Leadership Team</strong>
              <span>77429 • 77433</span>
            </div>
          </div>
        </section>

        <section className="gallery-section">
          <h2 className="section-title">Community Landmarks</h2>
          <div className="image-grid">
            <div className="landmark-card">
              <img src="https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg" alt="The Boardwalk" />
              <div className="landmark-info"><h5>The Boardwalk</h5></div>
            </div>
            <div className="landmark-card">
              <img src="https://s.hdnux.com/photos/01/23/35/65/21880172/4/1200x0.jpg" alt="Berry Center" />
              <div className="landmark-info"><h5>The Berry Center</h5></div>
            </div>
            <div className="landmark-card">
              <img src="https://s.hdnux.com/photos/01/23/41/37/21895159/4/1200x0.jpg" alt="Lakeland Village" />
              <div className="landmark-info"><h5>Lakeland Village</h5></div>
            </div>
          </div>
        </section>
      </div>

      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <style>{`
        .about-page-container {
          --bg: #ffffff; --text: #1e293b; --text-muted: #64748b; --accent: #3b82f6; --card: #f8fafc; --border: #e2e8f0;
          background: var(--bg); color: var(--text); min-height: 100vh; transition: 0.3s;
        }
        .about-page-container.dark-mode {
          --bg: #0f172a; --text: #f1f5f9; --text-muted: #94a3b8; --card: #1e293b; --border: #334155;
        }

        .content-wrapper { max-width: 1100px; margin: 0 auto; padding: 80px 20px; }

        .about-hero {
          position: relative; height: 500px; display: flex; align-items: center; justify-content: center;
          background-image: url('https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg');
          background-size: cover; background-position: center; overflow: hidden;
        }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15,23,42,0.7), rgba(15,23,42,0.9)); }
        .hero-glass-card {
          position: relative; z-index: 2; text-align: center; color: white; padding: 40px;
          background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          max-width: 800px; margin: 0 20px;
        }
        .text-gradient { background: linear-gradient(90deg, #60a5fa, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .about-hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; margin: 15px 0; letter-spacing: -2px; line-height: 1.1; }
        .about-hero p { font-size: 1.2rem; opacity: 0.9; }

        .mission-flex { display: flex; gap: 60px; align-items: flex-start; margin-top: 30px; margin-bottom: 100px; }
        .mission-main-text { flex: 1.2; font-size: 1.3rem; line-height: 1.7; color: var(--text-muted); }
        .value-strips-container { flex: 1; display: flex; flex-direction: column; gap: 15px; }
        .value-strip {
          display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--card);
          border-radius: 20px; border: 1px solid var(--border); transition: 0.3s;
        }
        .value-strip:hover { border-color: var(--accent); transform: scale(1.02); background: var(--bg); }
        .strip-icon { font-size: 1.5rem; background: var(--bg); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .strip-info h5 { margin: 0; font-size: 1.1rem; font-weight: 700; }
        .strip-info p { margin: 2px 0 0 0; font-size: 0.9rem; color: var(--text-muted); }

        .quote-container { 
          background: var(--card); padding: 80px 40px; border-radius: 40px; text-align: center; 
          position: relative; border: 1px solid var(--border); margin-bottom: 100px;
        }
        .quote-mark { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); font-size: 8rem; color: var(--accent); opacity: 0.1; font-family: serif; }
        .quote-body { font-size: 1.8rem; font-style: italic; line-height: 1.4; margin-bottom: 30px; position: relative; z-index: 1; }

        /* 4. GALLERY */
        .section-title { font-size: 0.85rem; text-transform: uppercase; color: var(--accent); font-weight: 800; margin-bottom: 40px; letter-spacing: 2px; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .landmark-card { background: var(--card); border-radius: 24px; overflow: hidden; border: 1px solid var(--border); transition: 0.3s; }
        .landmark-card:hover { transform: translateY(-10px); }
        .landmark-card img { width: 100%; height: 240px; object-fit: cover; }
        .landmark-info { padding: 2px; text-align: center; }

        .back-to-top { position: fixed; bottom: 30px; right: 30px; opacity: 0; visibility: hidden; transition: 0.3s; background: var(--accent); color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; z-index: 1000; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
        .back-to-top.visible { opacity: 1; visibility: visible; }

        @media (max-width: 900px) {
          .mission-flex { flex-direction: column; }
          .about-hero { height: 400px; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;