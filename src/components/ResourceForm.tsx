import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const categoryImages: Record<string, string> = {
  food: "https://images.unsplash.com/photo-1488459711635-de84fe344715?auto=format&fit=crop&w=800",
  health: "https://images.unsplash.com/photo-1505751172107-1d96073e1368?auto=format&fit=crop&w=800",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800",
  housing: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800",
  jobs: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800",
  legal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800",
  "financial aid": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800",
  community: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800",

  recreational: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800",
  volunteering: "https://images.unsplash.com/photo-1559027615-cd9670e804b0?auto=format&fit=crop&w=800",
  "town hall": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800",
  workshop: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800",
  festival: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800",
  
  other: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800"
};

const ResourceForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [submissionType, setSubmissionType] = useState('resource');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [url, setUrl] = useState(''); 
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');

  const user = auth.currentUser;

  const categories = submissionType === 'resource' 
    ? ['Food', 'Health', 'Education', 'Housing', 'Jobs', 'Legal', 'Financial Aid', 'Community', 'Other']
    : ['Recreational', 'Volunteering', 'Town Hall', 'Workshop', 'Festival', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; 

    setLoading(true);

    const formatUrl = (link: string) => {
      let trimmed = link.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    };

    const targetCollection = submissionType === 'resource' ? "resourceSuggestions" : "eventSuggestions";

    try {
      let finalImage = imageUrl.trim();
      
      if (!finalImage) {
        const catKey = category.toLowerCase();
        finalImage = categoryImages[catKey] || categoryImages['other'];
      } else {
        finalImage = formatUrl(finalImage);
      }

      const baseData = {
        name,
        category,
        description,
        imageUrl: finalImage,
        url: formatUrl(url) || null,
        status: 'pending',
        suggestedBy: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        type: submissionType
      };

      let finalData = submissionType === 'event' 
        ? { ...baseData, eventDate, location } 
        : { ...baseData, address: address || null, phone: phone || null };

      await addDoc(collection(db, targetCollection), finalData);

      setSubmitted(true);
      
      setName(''); setCategory(''); setUrl(''); setImageUrl('');
      setDescription(''); setEventDate(''); setLocation('');
      setAddress(''); setPhone('');
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="form-container" style={{...containerStyle, textAlign: 'center'}}>
        <h2 style={{ color: 'var(--text-main)' }}>🤝 Community Contributions</h2>
        <p style={{ color: 'var(--text-muted)' }}>Only verified residents can suggest resources or events.</p>
        <button onClick={() => navigate('/login')} style={{...buttonStyle, marginTop: '20px'}}>
          🔑 Sign In to Contribute
        </button>
      </div>
    );
  }

  return (
    <div className="form-container" style={containerStyle}>
      <h2 style={{ color: 'var(--text-main)', marginTop: 0 }}>
        {submissionType === 'resource' ? 'Suggest a Resource' : 'Suggest an Event'}
      </h2>
      
      {submitted ? (
        <div style={successStyle}>
          🚀 Success! Your {submissionType} is pending review. Thank you for helping the community!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={formStyle}>
          
          <div className="type-toggle-group">
             <label style={labelStyle}>I want to suggest a:</label>
             <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button type="button" onClick={() => setSubmissionType('resource')}
                  style={submissionType === 'resource' ? activeToggleStyle : inactiveToggleStyle}
                >Resource</button>
                <button type="button" onClick={() => setSubmissionType('event')}
                  style={submissionType === 'event' ? activeToggleStyle : inactiveToggleStyle}
                >Event</button>
             </div>
          </div>

          <label style={labelStyle}>{submissionType === 'resource' ? 'Resource Name' : 'Event Title'}</label>
          <input type="text" placeholder="Enter name..." value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Image URL (Optional)</label>
          <input 
            type="text" 
            placeholder="Leave blank to use a default category image" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            style={inputStyle} 
          />

          {submissionType === 'event' && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label style={labelStyle}>Date & Time</label>
                <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input type="text" placeholder="Where?" value={location} onChange={(e) => setLocation(e.target.value)} required style={inputStyle} />
              </div>
            </div>
          )}

          <label style={labelStyle}>Category</label>
          <select required style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {submissionType === 'resource' && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                 <label style={labelStyle}>Address (Optional)</label>
                 <input type="text" placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
              </div>
              <div>
                 <label style={labelStyle}>Phone (Optional)</label>
                 <input type="tel" placeholder="555-0123" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          <label style={labelStyle}>{submissionType === 'resource' ? 'Website Link' : 'Registration Link'}</label>
          <input type="text" placeholder="www.link.com" value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Description</label>
          <textarea placeholder="Tell us more about this..." value={description} onChange={(e) => setDescription(e.target.value)} required style={{...inputStyle, height: '100px'}} />

          <button type="submit" style={{...buttonStyle, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? "Submitting..." : `Submit ${submissionType}`}
          </button>
        </form>
      )}
    </div>
  );
};

const containerStyle = { background: 'var(--card-bg)', padding: '40px', borderRadius: '15px', border: '1px solid var(--border-color)', marginTop: '40px' };
const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '-5px' };
const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold' as const, cursor: 'pointer', transition: 'opacity 0.2s' };
const successStyle = { padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' as const };
const activeToggleStyle = { ...buttonStyle, flex: 1, background: 'var(--primary)' };
const inactiveToggleStyle = { ...buttonStyle, flex: 1, background: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' };

export default ResourceForm;