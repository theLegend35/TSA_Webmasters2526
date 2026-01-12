import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import CategorySlider from '../components/CategorySlider'; 
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const EventsPage: React.FC = () => {
  const { theme } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('eventDate', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        
          displayDate: data.eventDate ? new Date(data.eventDate) : null,
        };
      });
      setEvents(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const searchResults = events.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEvents = events.filter(e => e.displayDate && e.displayDate >= now);
  const archived = events.filter(e => !e.displayDate || e.displayDate < now);

  const categories = Array.from(new Set(activeEvents.map(e => e.category)));

  if (loading) return <div className="loading-screen"><span>Loading Events...</span></div>;

  return (
    <div className="page-container-flush">
      <section className="hero-section-override full-width event-hero-fix">
        <div className="hero-content-inner">
          <h1 className="hero-title">Community <br/> Gatherings</h1>
          <p className="hero-subtitle">Find your place in the Cypress community.</p>
          
          <div className="event-search-container">
            <p className="search-label">Can't find an event? Search here:</p>
            <div className="hero-search-wrapper">
                <input 
                  type="text" 
                  placeholder="Search by name, type, or category..." 
                  className="hero-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        {searchTerm ? (
          <section className="main-content-area">
            <h2 className="main-display-heading">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="events-grid">
                {searchResults.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No events found matching "{searchTerm}"</p>
            )}
          </section>
        ) : (
          <section className="main-content-area">
            <h2 className="main-display-heading">Explore Events</h2>
            
            {categories.length > 0 ? (
              categories.map(cat => {
                const categoryItems = activeEvents.filter(e => e.category === cat);
                return (
                  <div key={cat} style={{ marginBottom: '40px' }}>
                    <CategorySlider 
                      title={cat.charAt(0).toUpperCase() + cat.slice(1)} 
                      items={categoryItems} 
                    />
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No upcoming events scheduled.</p>
            )}

            <div className="section-spacer" style={{ margin: '80px 0' }}></div>

            <div className="archived-section-wrapper">
                <h2 className="main-display-heading">Past Events</h2>
                <div className="events-grid archived-preview">
                    {archived.length > 0 ? (
                      archived.slice(0, 6).map(event => (
                        <EventCard key={event.id} event={event} isArchived />
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>No past events found.</p>
                    )}
                </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventsPage;