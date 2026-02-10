import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ResourceForm from '../components/ResourceForm';
import ResourceRow from '../components/ResourceRow';
import Hero from '../components/Hero';
import ResourceDetailPage from './ResourceDetailPage';

const HomePage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); 

  const [allResources, setAllResources] = useState<any[]>([]);
  const [starredResources, setStarredResources] = useState<any[]>([]); 
  const [liveEvents, setLiveEvents] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const now = new Date();

      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateObj: Date | null = null;
        let timing = "";

        if (typeof data.eventDate === 'string') {
           timing = data.eventDate.split('•')[1]?.trim() || "";
           const cleanStr = data.eventDate.replace('•', '');
           const parsed = Date.parse(cleanStr);
           if (!isNaN(parsed)) dateObj = new Date(parsed);
        } else if (data.eventDate?.seconds) {
           dateObj = new Date(data.eventDate.seconds * 1000);
        }

        return { 
            id: doc.id, 
            ...data, 
            rawDate: dateObj,
            timeStr: timing,
            monthStr: dateObj?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() || "JAN",
            dayStr: dateObj?.getDate().toString() || "01"
        };
      });

      const closestEvents = fetched
        .filter((e: any) => e.rawDate && e.rawDate >= now)
        .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime())
        .slice(0, 5);

      setLiveEvents(closestEvents);
    });

    const fetchHomeData = async () => {
      try {
        const resSnap = await getDocs(collection(db, 'resources'));
        setAllResources(resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const starSnap = await getDocs(query(collection(db, 'starred'), limit(12)));
        setStarredResources(starSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeEvents(); 
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const featuredDisplay = starredResources.length > 0 ? starredResources : allResources.slice(0, 6);

  if (loading) return <div style={{padding: '100px', textAlign: 'center', background: isDarkMode ? '#0f172a' : '#fff', color: isDarkMode ? '#fff' : '#000'}}>Loading Hub...</div>;

  return (
    <div className={`homepage-main ${isDarkMode ? 'dark-mode' : ''}`}>
      {selectedResourceId && (
        <div className="modal-overlay" onClick={() => setSelectedResourceId(null)}>
          <div className="modal-content-wrapper" style={{background: isDarkMode ? '#1e293b' : '#fff'}} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-circle" onClick={() => setSelectedResourceId(null)}>✕</button>
            <ResourceDetailPage modalId={selectedResourceId} />
          </div>
        </div>
      )}

      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <Hero onSuggestClick={scrollToForm} />

      <div className="content-wrapper">
        <div className="home-grid-layout">
          <section className="main-content-area">
            <div className="featured-top-section">
              <h2 className="main-display-heading">Community Favorites</h2>
              <ResourceRow title="Starred Resources" resources={featuredDisplay} onResourceClick={setSelectedResourceId} />
            </div>
          </section>

          <aside className="sidebar-container">
            <div className="sidebar-header">
              <h3 className="sidebar-heading">Upcoming Events</h3>
              <Link to="/events" className="view-all-link">See All →</Link>
            </div>

            <div className="events-stack">
              {liveEvents.map(event => (
                <div key={event.id} className="event-row-card">
                  <div className="event-date-box">
                    <span className="event-month">{event.monthStr}</span>
                    <span className="event-day">{event.dayStr}</span>
                  </div>
                  <div className="event-info">
                    <div className="event-name-bold">{event.name}</div>
                    <div className="event-meta-row">
                      {event.timeStr && <span className="event-time-text"> {event.timeStr}</span>}
                      <span className="event-location-text"> {event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="categories-full-width-container">
          <div className="section-spacer"></div>
          <h2 className="main-display-heading">Explore by Category</h2>
          <ResourceRow title="Food & Nutrition" resources={allResources.filter(r => r.category === "Food")} onResourceClick={setSelectedResourceId} />
          <ResourceRow title="Health & Wellness" resources={allResources.filter(r => r.category === "Health")} onResourceClick={setSelectedResourceId} />
          
          <div ref={formRef} className="resource-form-wrapper">
            <ResourceForm />
          </div>
        </div>
      </div>

      <style>{`
        .homepage-main {
          --date-bg: #eff6ff;
          --date-txt: #3b82f6;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .homepage-main.dark-mode {
          --bg: #0f172a;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --card: #1e293b;
          --border: #334155;
          --date-bg: rgba(59, 130, 246, 0.15);
          --date-txt: #60a5fa;
        }

        .content-wrapper { width: 100%; max-width: 1550px; margin: 0 auto; padding: 0 40px; box-sizing: border-box; }
        
        /* GRID & SIDEBAR - UNCHANGED SIZE */
        .home-grid-layout { display: grid; grid-template-columns: 1fr 450px; gap: 60px; align-items: start; width: 100%; }
        .sidebar-container { width: 450px; min-width: 450px; }
        
        .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .sidebar-heading { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--text); }
        .view-all-link { font-size: 1rem; color: #3b82f6; text-decoration: none; font-weight: 700; }

        .event-row-card { display: flex; align-items: center; gap: 20px; background: var(--card); padding: 20px; border-radius: 20px; border: 1px solid var(--border); margin-bottom: 16px; transition: all 0.3s ease; }
        .event-row-card:hover { transform: translateX(-5px); border-color: #3b82f6; }
        
        .event-date-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--date-bg); color: var(--date-txt); min-width: 75px; height: 75px; border-radius: 16px; flex-shrink: 0; }
        .event-month { font-size: 0.85rem; font-weight: 800; }
        .event-day { font-size: 1.6rem; font-weight: 900; letter-spacing: -1px; }
        
        .event-name-bold { font-weight: 700; font-size: 1.15rem; color: var(--text); margin-bottom: 6px; }
        .event-meta-row { display: flex; flex-direction: column; gap: 4px; }
        .event-time-text, .event-location-text { font-size: 0.9rem; color: var(--muted); }

        .resource-form-wrapper { max-width: 1000px; margin: 60px auto; }
        .section-spacer { margin: 30px 0; }

        .back-to-top { position: fixed; bottom: 30px; right: 30px; opacity: 0; visibility: hidden; transition: 0.3s; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 50%; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer;}
        .back-to-top.visible { opacity: 1; visibility: visible; }
        
        @media (max-width: 1024px) { 
           .home-grid-layout { grid-template-columns: 1fr; } 
           .sidebar-container { width: 100%; min-width: 100%; } 
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
        .modal-content-wrapper { width: 90%; max-width: 1200px; height: 90vh; border-radius: 24px; overflow-y: auto; position: relative; }
        .modal-close-circle { position: absolute; top: 20px; right: 25px; z-index: 10000; width: 35px; height: 35px; border-radius: 50%; border: none; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
};

export default HomePage;