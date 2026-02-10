import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutPage.css';

gsap.registerPlugin(ScrollTrigger);

const AboutPage: React.FC = () => {
  const { theme } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // GSAP entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero animations
      tl.fromTo(
        ".abt__hero-glass",
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1 }
      )
        .fromTo(
          ".abt__hero-badge",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.6"
        )
        .fromTo(
          ".abt__hero-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          ".abt__hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5"
        );

      // Mission section
      gsap.fromTo(
        ".abt__mission-text",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".abt__mission",
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Value strips staggered
      gsap.fromTo(
        ".abt__value",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.12,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".abt__values",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // Quote section
      gsap.fromTo(
        ".abt__quote-card",
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          scrollTrigger: {
            trigger: ".abt__quote",
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Gallery landmarks staggered
      gsap.fromTo(
        ".abt__landmark",
        { opacity: 0, y: 60, rotateX: -8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.15,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".abt__gallery-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className={`abt ${isDark ? 'abt--dark' : ''}`}>
      {/* Hero */}
      <section className="abt__hero">
        <div className="abt__hero-bg"></div>
        <div className="abt__hero-overlay"></div>
        <div className="abt__hero-content">
          <div className="abt__hero-glass">
            <span className="abt__hero-badge">Serving 77429 & 77433</span>
            <h1 className="abt__hero-title">
              Leading the <em>Cypress</em> Community
            </h1>
            <p className="abt__hero-sub">
              A vision for a more connected, resilient, and supported neighborhood.
            </p>
          </div>
        </div>
      </section>

      <div className="abt__wrapper">
        {/* Mission Section */}
        <section className="abt__mission">
          <div className="abt__section-header">
            <span className="abt__section-tag">Our Mission</span>
            <div className="abt__section-line"></div>
          </div>

          <div className="abt__mission-grid">
            <p className="abt__mission-text">
              CypressHub was founded to solve a critical problem: local resources are often
              scattered across social media and outdated physical boards. We built this hub to
              centralize food security, health services, and educational support for every
              resident in the Cypress area.
            </p>

            <div className="abt__values">
              <div className="abt__value">
                <div className="abt__value-icon">🤝</div>
                <div className="abt__value-content">
                  <h4>Fully Accessible</h4>
                  <p>Critical info for every neighbor, 24/7.</p>
                </div>
              </div>
              <div className="abt__value">
                <div className="abt__value-icon">📍</div>
                <div className="abt__value-content">
                  <h4>Hyper-Local Focus</h4>
                  <p>Strictly verified Cypress resources.</p>
                </div>
              </div>
              <div className="abt__value">
                <div className="abt__value-icon">🛡️</div>
                <div className="abt__value-content">
                  <h4>Community Led</h4>
                  <p>Built by locals, for locals.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="abt__quote">
          <div className="abt__quote-card">
            <span className="abt__quote-mark">"</span>
            <p className="abt__quote-text">
              Our goal for the Cypress Community Hub isn't just to list phone numbers.
              It's to ensure that every family in our neighborhood feels supported and connected.
            </p>
            <div className="abt__quote-footer">
              <p className="abt__quote-author">The CypressHub Leadership Team</p>
              <span className="abt__quote-role">77429 • 77433</span>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="abt__gallery">
          <div className="abt__section-header">
            <span className="abt__section-tag">Community Landmarks</span>
            <div className="abt__section-line"></div>
          </div>
          <div className="abt__gallery-grid">
            <article className="abt__landmark">
              <img
                className="abt__landmark-img"
                src="https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg"
                alt="The Boardwalk"
              />
              <div className="abt__landmark-info">
                <h5 className="abt__landmark-name">The Boardwalk</h5>
              </div>
            </article>
            <article className="abt__landmark">
              <img
                className="abt__landmark-img"
                src="https://s.hdnux.com/photos/01/23/35/65/21880172/4/1200x0.jpg"
                alt="Berry Center"
              />
              <div className="abt__landmark-info">
                <h5 className="abt__landmark-name">The Berry Center</h5>
              </div>
            </article>
            <article className="abt__landmark">
              <img
                className="abt__landmark-img"
                src="https://s.hdnux.com/photos/01/23/41/37/21895159/4/1200x0.jpg"
                alt="Lakeland Village"
              />
              <div className="abt__landmark-info">
                <h5 className="abt__landmark-name">Lakeland Village</h5>
              </div>
            </article>
          </div>
        </section>
      </div>

      {/* Back to Top */}
      <button
        className={`abt__back-top ${showBackToTop ? 'abt__back-top--visible' : ''}`}
        onClick={scrollToTop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
};

export default AboutPage;
