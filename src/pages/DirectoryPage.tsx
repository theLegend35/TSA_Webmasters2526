import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import ResourceDetailPage from './ResourceDetailPage';

interface Resource {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  phone?: string;
  url?: string;
  starred?: boolean;
}

const DirectoryPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const categories = ["All", "Food", "Health", "Education", "Financial Aid", "Jobs", "Housing", "Legal", "Community"];

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    const fetchResources = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'resources'));
        const resData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Resource[];

        const sorted = resData.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
        setResources(sorted);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching directory:", error);
        setLoading(false);
      }
    };

    fetchResources();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedResourceId ? 'hidden' : 'unset';
  }, [selectedResourceId]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const filtered = resources
    .filter(res => (selectedCategory === "All" || res.category === selectedCategory))
    .filter(res =>
      res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading Directory...</div>;

  return (
    <div className="directory-page-main">
      
      {selectedResourceId && (
        <div 
          className="modal-overlay" 
          style={modalOverlayStyle}
          onClick={() => setSelectedResourceId(null)}
        >
          <div 
            className="modal-content-wrapper styled-scroll" 
            style={modalContentStyle}
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="modal-close-circle" 
              onClick={() => setSelectedResourceId(null)}
              style={closeCircleStyle}
            >
              ✕
            </button>
            <ResourceDetailPage modalId={selectedResourceId} />
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
        <header className="directory-header">
          <h1 className="main-display-heading">Resource Directory</h1>
          
          <div className="filter-bar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-container">
            <input 
              type="text" 
              placeholder={`Search in ${selectedCategory}...`}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="directory-search-input"
            />
          </div>
        </header>

        <div className="directory-grid">
          {filtered.map(res => (
            <div 
              key={res.id} 
              className="resource-card-modern" 
              onClick={() => setSelectedResourceId(res.id)}
            >
              <div className="image-container-modern">
                <img 
                  src={res.imageUrl || 'https://via.placeholder.com/400x250/2a2d3e/ffffff?text=Cypress+Hub'} 
                  alt={res.name}
                />
                {res.starred && (
                  <div className="featured-badge">
                    <span>★</span> FEATURED
                  </div>
                )}
              </div>
              
              <div className="card-body-modern">
                <span className="category-tag-modern">{res.category}</span>
                <h3 className="card-title-modern">{res.name}</h3>
                
                <p className="card-contact-modern">
                  {res.url ? (
                    <span className="contact-link">{res.url.replace(/^https?:\/\//, '')}</span>
                  ) : res.phone ? (
                    <span>{res.phone}</span>
                  ) : (
                    <span style={{opacity: 0.6}}>View Details</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .directory-page-main { width: 100%; }

        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #3b82f6;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
        }
        .back-to-top:hover {
          transform: translateY(-5px);
          background: #2563eb;
        }

        .directory-header { text-align: center; padding: 40px 0; }
        .filter-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 25px; }
        .category-pill {
          padding: 10px 20px; border-radius: 50px; border: 1px solid rgba(128,128,128,0.2);
          background: transparent; color: inherit; cursor: pointer; font-weight: 600;
        }
        .category-pill.active { background: #3b82f6; border-color: #3b82f6; color: white; }

        .directory-search-input {
          width: 100%; max-width: 600px; padding: 15px 25px; border-radius: 15px;
          border: 1px solid rgba(128,128,128,0.2); background: rgba(128,128,128,0.05);
          color: inherit; font-size: 1rem;
        }

        .directory-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px; padding-bottom: 100px;
        }

        .resource-card-modern {
          border-radius: 20px; overflow: hidden; border: 1px solid rgba(128,128,128,0.1);
          background: rgba(128,128,128,0.03); cursor: pointer; transition: 0.3s;
        }
        .resource-card-modern:hover { transform: translateY(-5px); border-color: #3b82f6; }

        .image-container-modern { height: 180px; position: relative; }
        .image-container-modern img { width: 100%; height: 100%; object-fit: cover; }

        .featured-badge {
          position: absolute; top: 12px; left: 12px; background: #3b82f6;
          color: white; padding: 5px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800;
        }

        .card-body-modern { padding: 20px; }
        .category-tag-modern { color: #3b82f6; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .card-title-modern { margin: 8px 0; font-size: 1.2rem; font-weight: 700; }
        .card-contact-modern { 
          font-size: 0.9rem; 
          color: #64748b; 
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .contact-link { color: #3b82f6; font-weight: 500; }
      `}</style>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(8px)',
  padding: '20px'
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '1200px',
  height: '90vh',
  borderRadius: '24px',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  backgroundColor: '#fff',
  zIndex: 10001
};

const closeCircleStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  right: '25px',
  zIndex: 10002,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#f1f5f9',
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
};

export default DirectoryPage;