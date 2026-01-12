import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import ResourceForm from '../components/ResourceForm';
import Subscribe from '../components/Subscribe';
import CategorySlider from '../components/CategorySlider';

const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [foodResources, setFoodResources] = useState<any[]>([]);
  const [healthResources, setHealthResources] = useState<any[]>([]);
  const [volunteerResources, setVolunteerResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesRef = collection(db, 'resources');

        const qFeatured = query(resourcesRef, where("featured", "==", true), limit(6));
        const featuredSnap = await getDocs(qFeatured);
        setFeatured(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const categoriesToFetch = [
          { name: "Food & Nutrition", setter: setFoodResources },
          { name: "Health & Wellness", setter: setHealthResources },
          { name: "Volunteer Opportunities", setter: setVolunteerResources }
        ];

        for (const cat of categoriesToFetch) {
          const q = query(resourcesRef, where("category", "==", cat.name), limit(6));
          const snap = await getDocs(q);
          cat.setter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        setLoading(false);
      } catch (error) {
        console.error("Firebase Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const cypressEvents = [
    { id: 1, name: "Cypress Farmers Market", date: "Every Sunday", loc: "The Boardwalk at Towne Lake" },
    { id: 2, name: "Cy-Fair ISD Board Meeting", date: "Jan 12, 2026", loc: "ISC Building" },
    { id: 3, name: "Community Cleanup Day", date: "Feb 05, 2026", loc: "Telge Park" }
  ];


  return (
    <div className="homepage-main">
      <section className="hero-section-override full-width">
        <div className="hero-content-inner">
          <h1 className="hero-title">Cypress <br/> Resource Hub</h1>
          <p className="hero-subtitle">
            Providing the residents of Cypress, Texas with a centralized platform for support, events, and community growth.
          </p>
          <div className="hero-cta-group">
            <Link to="/directory" className="cta-btn-large">Browse Resource Directory</Link>
          </div>
          
          <div 
            className="scroll-indicator" 
            onClick={() => window.scrollTo({top: window.innerHeight * 0.9, behavior: 'smooth'})}
          >
            <span>↓</span>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        <div className="home-grid-layout farther-sidebar">
          
          <section className="main-content-area">
            <div className="featured-top-section">
              <h2 className="main-display-heading">Featured Spotlights</h2>
              <CategorySlider title="Top Recommendations" items={featured} isFeatured={true} />
            </div>

            <div className="section-spacer" style={{ margin: '60px 0' }}></div>

            <h2 className="main-display-heading">Explore by Category</h2>
            
            <CategorySlider title="Food & Nutrition" items={foodResources} />
            <CategorySlider title="Health & Wellness" items={healthResources} />
            <CategorySlider title="Volunteer Opportunities" items={volunteerResources} />
            
            <div className="resource-form-wrapper">
              <ResourceForm />
            </div>
          </section>

          <aside className="sidebar-container">
            <h3 className="sidebar-heading">Local Events</h3>
            <div className="events-stack">
              {cypressEvents.map(event => (
                <div key={event.id} className="event-mini-card">
                  <div className="event-date-pill">{event.date}</div>
                  <div className="event-name-bold">{event.name}</div>
                  <div className="event-location-text">{event.loc}</div>
                </div>
              ))}
            </div>
            <Subscribe />
            <div className="weather-widget-box">
              <span className="weather-icon">⛅</span>
              <h4>Cypress Weather</h4>
              <div className="weather-temp">68°F</div>
              <p>Partly Cloudy</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomePage;