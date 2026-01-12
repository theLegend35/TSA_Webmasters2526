import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useAuth();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'resources', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResource({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return <div className="loading-screen"><span>Loading...</span></div>;
  if (!resource) return <div className="error-screen">Resource not found.</div>;

  return (
    <div className={`detail-page-root ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="detail-max-width">
        <Link to="/" className="back-link-modern">← Back to Home</Link>
        
        <header className="detail-hero">
          <div className="hero-image-container">
            {resource.imageUrl ? (
              <img src={resource.imageUrl} alt={resource.name} />
            ) : (
              <div className="hero-placeholder">Cypress Hub</div>
            )}
            <div className="hero-overlay">
              <span className="hero-badge">{resource.category}</span>
              <h1>{resource.name}</h1>
            </div>
          </div>
        </header>

        <main className="detail-grid">
          <section className="detail-main-content">
            <div className="content-card">
              <h2>About</h2>
              <p>{resource.description}</p>
            </div>
          </section>

          <aside className="detail-sidebar">
            <div className="contact-card-modern">
              <h3>Contact Info</h3>
              
              {resource.phone && (
                <div className="info-row">
                  <div className="info-icon">📞</div>
                  <div className="info-text">
                    <label>Phone</label>
                    <p>{resource.phone}</p>
                  </div>
                </div>
              )}

              {resource.link && (
                <div className="info-row">
                  <div className="info-icon">🌐</div>
                  <div className="info-text">
                    <label>Website</label>
                    <a href={resource.link} target="_blank" rel="noreferrer" className="action-btn site">
                      Visit Official Site
                    </a>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default ResourceDetailPage;