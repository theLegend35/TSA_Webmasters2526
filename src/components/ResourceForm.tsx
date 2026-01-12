import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

const ResourceForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [submissionType, setSubmissionType] = useState('resource');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');

  const user = auth.currentUser;

  const categories = submissionType === 'resource' 
    ? ['Food Bank', 'Healthcare', 'Education', 'Financial Aid', 'Housing', 'Other']
    : ['Recreational', 'Volunteering', 'Town Hall', 'Workshop', 'Festival', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; 

    setLoading(true);

    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const targetCollection = submissionType === 'resource' ? "resourceSuggestions" : "eventSuggestions";

    try {
      const baseData = {
        name,
        category,
        url: finalUrl || null,
        description,
        status: 'pending',
        suggestedBy: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      };

      const finalData = submissionType === 'event' 
        ? { ...baseData, eventDate, location } 
        : baseData;

      await addDoc(collection(db, targetCollection), finalData);

      setSubmitted(true);
      setName('');
      setCategory('');
      setUrl('');
      setDescription('');
      setEventDate('');
      setLocation('');
      
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
        <h2 style={{ color: 'var(--text-main)', marginTop: 0 }}>Community Contributions</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Only verified residents can suggest resources or events.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          style={{...buttonStyle, marginTop: '20px', width: 'auto', padding: '12px 30px'}}
        >
          Sign In to Contribute
        </button>
      </div>
    );
  }

  return (
    <div className="form-container" style={containerStyle}>
      <h2 style={{ color: 'var(--text-main)', marginTop: 0 }}>
        Suggest a {submissionType === 'resource' ? 'Resource' : 'Event'}
      </h2>
      
      {submitted ? (
        <div style={successStyle}>
          ✅ Thank you! Your {submissionType} has been sent for review.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={formStyle}>
          
          <div className="type-toggle-group">
             <label style={labelStyle}>I want to suggest a:</label>
             <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button 
                  type="button" 
                  onClick={() => setSubmissionType('resource')}
                  style={submissionType === 'resource' ? activeToggleStyle : inactiveToggleStyle}
                >Resource</button>
                <button 
                  type="button" 
                  onClick={() => setSubmissionType('event')}
                  style={submissionType === 'event' ? activeToggleStyle : inactiveToggleStyle}
                >Event</button>
             </div>
          </div>

          <label style={labelStyle}>{submissionType === 'resource' ? 'Resource Name' : 'Event Title'}</label>
          <input 
            type="text" 
            placeholder={submissionType === 'resource' ? "e.g., Cypress Food Bank" : "e.g., Neighborhood Clean-up"} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            style={inputStyle} 
          />

          {submissionType === 'event' && (
            <>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <label style={labelStyle}>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input 
                    type="text" 
                    placeholder="Where?" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                    style={inputStyle} 
                  />
                </div>
              </div>
            </>
          )}

          <label style={labelStyle}>Category</label>
          <select 
            required 
            style={inputStyle} 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
          </select>

          <label style={labelStyle}>
            {submissionType === 'resource' ? 'Website Link' : 'More Info Link (Optional)'}
          </label>
          <input 
            type="text" 
            placeholder="www.example.com" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyle} 
            required={submissionType === 'resource'} 
          />

          <label style={labelStyle}>Description</label>
          <textarea 
            placeholder={submissionType === 'resource' ? "What services do they provide?" : "Describe the event details..."} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required 
            style={{...inputStyle, height: '100px'}} 
          />

          <button 
            type="submit" 
            style={{...buttonStyle, opacity: loading ? 0.7 : 1}} 
            disabled={loading}
          >
            {loading ? "Submitting..." : `Submit ${submissionType}`}
          </button>
        </form>
      )}
    </div>
  );
};

const containerStyle = { background: 'var(--card-bg)', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginTop: '40px', border: '1px solid var(--border-color)' };
const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '-5px' };
const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem', fontFamily: 'inherit' };
const buttonStyle = { padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '1rem' };
const successStyle = { padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' as const };

const activeToggleStyle = { ...buttonStyle, flex: 1, background: 'var(--primary)' };
const inactiveToggleStyle = { ...buttonStyle, flex: 1, background: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' };

export default ResourceForm;