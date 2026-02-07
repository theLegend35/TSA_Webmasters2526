import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface DetailProps { 
  modalId?: string; 
  onClose?: () => void; 
}

const ResourceDetailPage: React.FC<DetailProps> = ({ modalId, onClose }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const isModal = !!modalId;
  const activeId = modalId || urlId;

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!activeId) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'resources', activeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setResource({ id: docSnap.id, ...data });

          const starRef = doc(db, 'starred', activeId);
          const starSnap = await getDoc(starRef);
          if (starSnap.exists() || data.starred || data.isStarred) {
            setIsStarred(true);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchResource();
  }, [activeId]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/resource/${activeId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: resource?.name, url: shareUrl });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  if (!resource) return <div style={{ padding: '100px', textAlign: 'center' }}>Resource not found.</div>;

  const displayAddress = resource.address || resource.location;
  const rawLink = resource.link || resource.url || resource.website;
  const displayLink = rawLink ? (rawLink.startsWith('http') ? rawLink : `https://${rawLink}`) : null;

  return (
    <div style={{ background: '#fff', color: '#1a1a1a', minHeight: '100vh', position: 'relative', borderRadius: isModal ? '24px' : '0', overflow: 'hidden' }}>
      

      {/* 1. Hero */}
      <header style={heroStyle}>
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt="" style={heroImgStyle} />
        ) : (
          <div style={heroPlaceholderStyle}>🏢</div>
        )}
        <div style={heroOverlayStyle}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span style={badgeStyle}>{resource.category || 'General'}</span>
            {isStarred && <span style={starBadgeStyle}>⭐ COMMUNITY STAR</span>}
          </div>
          <h1 style={titleStyle}>{resource.name}</h1>
          {displayAddress && <p style={addressSubStyle}>📍 {displayAddress}</p>}
        </div>
      </header>

      <div style={contentGridStyle}>
        <section>
          <div style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Overview</h2>
            <p style={descriptionStyle}>{resource.description}</p>
          </div>

          {resource.hours && (
            <div style={sectionCardStyle}>
              <h2 style={sectionTitleStyle}>Operation Hours</h2>
              <p style={{ whiteSpace: 'pre-line', color: '#444', fontSize: '1rem', lineHeight: '1.6' }}>{resource.hours}</p>
            </div>
          )}
        </section>

        <aside>
          <div style={sidebarCardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Contact Info</h3>
            
            <div style={contactRowStyle}>
              <span style={iconCircleStyle}>📞</span>
              <div>
                <small style={labelStyle}>Phone</small>
                <p style={valStyle}>{resource.phone || 'Not Available'}</p>
              </div>
            </div>

            {displayLink && (
              <a href={displayLink} target="_blank" rel="noopener noreferrer" style={primaryBtnStyle}>
                Visit Website 🌐
              </a>
            )}
            
            {resource.phone && (
              <a href={`tel:${resource.phone}`} style={secondaryBtnStyle}>
                Call Now
              </a>
            )}

            <button onClick={handleShare} style={shareBtnStyle}>
              {copied ? "✅ Copied!" : "🔗 Share Resource"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};


const floatingBackStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 10,
  textDecoration: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: '#2563eb',
  padding: '10px 18px',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center'
};

const heroStyle: React.CSSProperties = { height: '380px', position: 'relative', overflow: 'hidden' };
const heroImgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const heroPlaceholderStyle: React.CSSProperties = { width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' };
const heroOverlayStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', color: 'white' };

const badgeStyle: React.CSSProperties = { background: '#2563eb', padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' };
const starBadgeStyle: React.CSSProperties = { background: '#f59e0b', padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.3)' };

const titleStyle: React.CSSProperties = { fontSize: '2.8rem', margin: '0 0 10px 0', fontWeight: '800', lineHeight: '1.1' };
const addressSubStyle: React.CSSProperties = { fontSize: '1.1rem', opacity: 0.95, fontWeight: '500' };

const contentGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '50px', padding: '50px 40px' };
const sectionCardStyle: React.CSSProperties = { marginBottom: '40px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.3rem', fontWeight: '700', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', color: '#1e293b' };
const descriptionStyle: React.CSSProperties = { lineHeight: '1.8', color: '#475569', fontSize: '1.1rem' };

const sidebarCardStyle: React.CSSProperties = { background: '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'sticky', top: '20px' };
const contactRowStyle: React.CSSProperties = { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' };
const iconCircleStyle: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', fontSize: '1.2rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' };
const valStyle: React.CSSProperties = { fontSize: '1.05rem', margin: 0, fontWeight: '600', color: '#1e293b' };

const primaryBtnStyle: React.CSSProperties = { display: 'block', textAlign: 'center', background: '#2563eb', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '14px', transition: 'transform 0.2s' };
const secondaryBtnStyle: React.CSSProperties = { display: 'block', textAlign: 'center', background: '#fff', color: '#2563eb', border: '2px solid #2563eb', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '14px' };
const shareBtnStyle: React.CSSProperties = { width: '100%', background: '#f1f5f9', color: '#475569', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' };
const reportBtnStyle: React.CSSProperties = { width: '100%', background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' };

export default ResourceDetailPage;