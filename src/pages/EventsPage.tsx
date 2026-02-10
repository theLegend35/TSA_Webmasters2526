
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface CypressEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  url?: string;
  eventDate: any; 
  displayDate: Date | null;
  timeStr?: string;
}

const CATEGORIES = ["All", "Town Hall", "Workshop", "Volunteering", "Recreational", "Festival"];

const EventsPage: React.FC = () => {
  const { theme } = useAuth();
  const [events, setEvents] = useState<CypressEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CypressEvent | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    const q = query(collection(db, 'events'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateObj: Date | null = null;
        let extractedTime = "";

        if (data.eventDate?.seconds) {
          dateObj = new Date(data.eventDate.seconds * 1000);
        } else if (typeof data.eventDate === 'string') {
          if (data.eventDate.includes('•')) {
            extractedTime = data.eventDate.split('•')[1].trim();
          }
          const parsed = Date.parse(data.eventDate.replace('•', ''));
          dateObj = isNaN(parsed) ? null : new Date(parsed);
        } else if (data.eventDate instanceof Date) {
          dateObj = data.eventDate;
        }

        return {
          id: doc.id,
          ...data,
          displayDate: dateObj,
          timeStr: extractedTime
        } as CypressEvent;
      });

      fetched.sort((a, b) => (a.displayDate?.getTime() || 0) - (b.displayDate?.getTime() || 0));
      setEvents(fetched);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : 'unset';
  }, [selectedEvent]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const filterEvents = (eventList: CypressEvent[]) => {
    return eventList.filter(e => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        e.name?.toLowerCase().includes(searchLower) || 
        e.description?.toLowerCase().includes(searchLower) ||
        e.location?.toLowerCase().includes(searchLower);
      const matchesCategory = activeCategory === "All" || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const activeEvents = events.filter(e => !e.displayDate || e.displayDate >= now);
  const archivedEvents = events.filter(e => e.displayDate && e.displayDate < now);
  const filteredActive = filterEvents(activeEvents);

  const formatDateTime = (event: CypressEvent) => {
    if (!event.displayDate) return event.eventDate;
    
    const datePart = event.displayDate.toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
    const timePart = event.timeStr || (event.displayDate.getHours() !== 0 || event.displayDate.getMinutes() !== 0 
      ? event.displayDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : "");

    return `${datePart}${timePart ? ` • ${timePart}` : ""}`;
  };

  if (loading) return <div className="loading-screen"><span>Loading Community Gatherings...</span></div>;

  return (
    <div className={`events-page-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
      
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-circle" onClick={() => setSelectedEvent(null)}>✕</button>
            
            <div className="event-detail-content">
              <span className="detail-badge">{selectedEvent.category}</span>
              <h2 className="detail-title">{selectedEvent.name}</h2>
              
              <div className="detail-meta-grid">
                <div className="meta-box">
                  <span className="meta-label">When</span>
                  <p className="meta-text">
                    {formatDateTime(selectedEvent)}
                  </p>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Where</span>
                  <p className="meta-text">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="detail-desc-box">
                <span className="meta-label">About this Event</span>
                <p>{selectedEvent.description}</p>
              </div>

              {selectedEvent.url && (
                <a href={selectedEvent.url} target="_blank" rel="noreferrer" className="event-external-btn">
                  Visit Official Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <div className="content-wrapper">
        <header className="events-header">
          <div className="header-titles">
            <h1>Cypress Gatherings</h1>
            <p>Connect with your community.</p>
          </div>
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="event-search-input"
            />
          </div>
        </header>

        <div className="category-filter-container">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="events-grid-section">
          <h3 className="section-title">
            {activeCategory === "All" ? "Upcoming Events" : `${activeCategory} Results`}
          </h3>
          <div className="events-grid">
            {filteredActive.length > 0 ? (
              filteredActive.map(event => (
                <div key={event.id} className="event-card-outer" onClick={() => setSelectedEvent(event)}>
                  <div className="event-card-inner">
                    <span className="card-cat">{event.category}</span>
                    <h4 className="card-name">{event.name}</h4>
                    <div className="card-footer">
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                            {formatDateTime(event)}
                        </span>
                        <span className="dot">•</span>
                        <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">No upcoming events found.</div>
            )}
          </div>
        </section>

        {archivedEvents.length > 0 && !searchTerm && activeCategory === "All" && (
          <section className="events-grid-section archived" style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h3 className="section-title" style={{ color: '#64748b' }}>Past Events</h3>
            <div className="events-grid">
              {archivedEvents.map(event => (
                <div key={event.id} className="event-card-outer past" onClick={() => setSelectedEvent(event)}>
                  <div className="event-card-inner">
                    <span className="card-cat">{event.category}</span>
                    <h4 className="card-name">{event.name}</h4>
                    <div className="card-footer">
                        <span>{event.displayDate?.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .events-page-container {
          --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --border: #e2e8f0; --accent: #3b82f6;
          background: var(--bg); color: var(--text); min-height: 100vh; padding: 40px 0; transition: 0.3s;
        }
        .events-page-container.dark-mode {
          --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --border: #334155;
        }
        .content-wrapper { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .events-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .events-header h1 { font-size: 2.8rem; font-weight: 900; margin: 0; letter-spacing: -1px; }
        .events-header p { margin: 5px 0 0; color: #64748b; font-size: 1.1rem; }
        .event-search-input { padding: 14px 24px; border-radius: 50px; border: 1px solid var(--border); background: var(--card); color: var(--text); width: 320px; outline: none; }
        .category-filter-container { display: flex; gap: 10px; margin-bottom: 40px; overflow-x: auto; padding: 5px 0; }
        .filter-chip { padding: 10px 22px; border-radius: 50px; background: var(--card); border: 1px solid var(--border); color: var(--text); font-weight: 700; cursor: pointer; white-space: nowrap; }
        .filter-chip.active { background: var(--accent); color: white; border-color: var(--accent); }
        .section-title { font-size: 0.85rem; text-transform: uppercase; color: var(--accent); font-weight: 800; margin-bottom: 25px; letter-spacing: 1.5px; }
        .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .event-card-inner { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px; box-shadow: 0 10px 20px rgba(0,0,0,0.03); cursor: pointer; transition: 0.3s; }
        .event-card-inner:hover { transform: translateY(-5px); border-color: var(--accent); }
        .card-cat { color: var(--accent); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .card-name { font-size: 1.4rem; margin: 12px 0; font-weight: 800; }
        .card-footer { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .past { opacity: 0.6; filter: grayscale(0.5); }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px); }
        .modal-content-wrapper { background: var(--card); color: var(--text); width: 92%; max-width: 650px; border-radius: 32px; position: relative; padding: 50px; animation: modalSlide 0.3s ease-out; }
        @keyframes modalSlide { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-close-circle { position: absolute; top: 25px; right: 25px; width: 44px; height: 44px; border-radius: 50%; border: none; background: var(--bg); color: var(--text); cursor: pointer; }
        .detail-badge { background: rgba(59, 130, 246, 0.1); color: var(--accent); padding: 6px 14px; border-radius: 50px; font-weight: 800; }
        .detail-title { font-size: 2.2rem; margin: 20px 0; font-weight: 900; }
        .detail-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .meta-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .event-external-btn { display: block; text-align: center; padding: 18px; background: var(--accent); color: white; border-radius: 16px; text-decoration: none; font-weight: 800; }
        .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--accent); }
      
        .event-time-text { font-weight: 700; color: var(--accent); }
        .card-footer { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; flex-wrap: wrap; }
      `}</style>
    </div>
  );
};

export default EventsPage;