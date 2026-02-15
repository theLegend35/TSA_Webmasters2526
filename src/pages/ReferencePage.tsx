import React, { useRef, useLayoutEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArrowIcon from '../components/shared/ArrowIcon';
import './ReferencePage.css';

gsap.registerPlugin(ScrollTrigger);

const ReferencePage: React.FC = () => {
  const { theme } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const sources = [
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1460317442991-0ec209397118" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1542838132-92c53300491e" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1448630360428-65456885c650" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18" },
    { type: "Stock Image", source: "Unsplash", url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca" },
    { type: "Photography", source: "Towne Lake Texas", url: "https://townelaketexas.com/sites/default/files/gallery/bry6046.jpg" },
    { type: "Photography", source: "HDNUX / Chronicle", url: "https://s.hdnux.com/photos/01/23/35/65/21880172/4/1200x0.jpg" },
    { type: "Photography", source: "HDNUX / Chronicle", url: "https://s.hdnux.com/photos/01/23/41/37/21895159/4/1200x0.jpg" },
  ];

  // GSAP entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero entrance
      tl.fromTo(
        ".ref__hero-tag",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 }
      )
        .fromTo(
          ".ref__hero-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          ".ref__hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5"
        );

      // Sections with ScrollTrigger
      gsap.utils.toArray<HTMLElement>(".ref__section").forEach((section, i) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // PDF cards
      gsap.fromTo(
        ".ref__pdf-card",
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".ref__pdf-grid",
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );

      // Table rows stagger
      gsap.fromTo(
        ".ref__table tbody tr",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.02,
          duration: 0.4,
          scrollTrigger: {
            trigger: ".ref__table",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className={`ref ${isDark ? 'ref--dark' : ''}`}>


      <div className="ref__wrapper">
        {/* Hero */}
        <header className="ref__hero">
          <span className="ref__hero-tag">TSA Compliance</span>
          <h1 className="ref__hero-title">
            Reference & <em>Documentation</em>
          </h1>
          <p className="ref__hero-sub">
            Complete documentation of sources, tools, and copyright compliance for the TSA Webmaster competition.
          </p>
        </header>

        {/* Affirmation Section */}
        <section className="ref__section">
          <div className="ref__section-header">
            <h2 className="ref__section-title">Affirmation Statement</h2>
            <div className="ref__section-line"></div>
          </div>
          <div className="ref__affirmation">
            <span className="ref__affirmation-label">Official Statement</span>
            <p className="ref__affirmation-text">
              The React framework was used to develop this website. We affirm that the theme, CSS, and component structure
              used on this framework were built entirely by the team and no pre-built templates or themes were used.
              All logic for the Directory and Authentication systems was coded by the team using Firebase SDKs.
            </p>
          </div>
        </section>

        {/* PDF Documents Section */}
        <section className="ref__section">
          <div className="ref__section-header">
            <h2 className="ref__section-title">Required Documentation</h2>
            <div className="ref__section-line"></div>
          </div>
          <div className="ref__pdf-grid">
            <div className="ref__pdf-card">
              <h3 className="ref__pdf-label">Project Work Log</h3>
              <iframe
                src="/pdfs/workLog.pdf"
                className="ref__pdf-iframe"
                title="Work Log"
              />
              <a href="/pdfs/workLog.pdf" target="_blank" rel="noreferrer" className="ref__pdf-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open Full PDF
              </a>
            </div>

            <div className="ref__pdf-card">
              <h3 className="ref__pdf-label">Student Copyright Checklist</h3>
              <iframe
                src="/pdfs/copyright.pdf"
                className="ref__pdf-iframe"
                title="Copyright Checklist"
              />
              <a href="/pdfs/copyright.pdf" target="_blank" rel="noreferrer" className="ref__pdf-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open Full PDF
              </a>
            </div>
          </div>
        </section>

        {/* Sources Table Section */}
        <section className="ref__section">
          <div className="ref__section-header">
            <h2 className="ref__section-title">Sources of Information & Assets</h2>
            <div className="ref__section-line"></div>
          </div>
          <div className="ref__table-wrap">
            <table className="ref__table">
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Source</th>
                  <th>URL / Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data / Statistics</td>
                  <td>Cypress Assistance Ministries</td>
                  <td>Resource directory details and mission data.</td>
                </tr>
                <tr>
                  <td>Framework / Backend</td>
                  <td>React / Firebase / Netlify</td>
                  <td>Core application logic, database storage, and cloud deployment.</td>
                </tr>
                <tr>
                  <td>3D Component</td>
                  <td>Three.js Library</td>
                  <td><a href="https://threejs.org/" target="_blank" rel="noreferrer" className="ref__table-link">https://threejs.org/</a> - 3D parking lot visualization</td>
                </tr>
                <tr>
                  <td>Map Integration</td>
                  <td>Google Maps API</td>
                  <td><a href="https://developers.google.com/maps" target="_blank" rel="noreferrer" className="ref__table-link">https://developers.google.com/maps</a> - Event location embedding</td>
                </tr>
                <tr>
                  <td>Component</td>
                  <td>Custom EventMapEmbed</td>
                  <td>Team-developed interactive event map component for location preview.</td>
                </tr>
                <tr>
                  <td>Component</td>
                  <td>Custom ReservationForm</td>
                  <td>Team-developed event reservation form with parking integration.</td>
                </tr>
                {sources.map((item, index) => (
                  <tr key={index}>
                    <td>{item.type}</td>
                    <td>{item.source}</td>
                    <td>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ref__table-link"
                      >
                        {item.url.length > 55 ? `${item.url.substring(0, 55)}...` : item.url}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferencePage;
