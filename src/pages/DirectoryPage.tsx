import React, { useState } from 'react';
import { resources } from '../data/resources';

const DirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResources = resources.filter(res =>
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content-wrapper">
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--text-main)' }}>Resource Directory</h1>
        <input 
          type="text" 
          placeholder="Search by name or category (e.g. Food)..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={directoryGrid}>
        {filteredResources.map(res => (
          <div key={res.id} style={resourceCardStyle}>
            <span style={categoryTagStyle}>{res.category}</span>
            <h3 style={{ margin: '15px 0 10px 0', color: 'var(--text-main)' }}>{res.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{res.description}</p>
            <div style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {res.phone}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const searchInputStyle: React.CSSProperties = {
  padding: '12px 20px',
  width: '100%',
  maxWidth: '500px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)',       
  color: 'var(--text-main)',         
  fontSize: '1rem',
  outline: 'none'
};

const directoryGrid: React.CSSProperties = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
  gap: '20px' 
};

const resourceCardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',          
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  border: '1px solid var(--border-color)',
  transition: 'transform 0.2s ease'
};

const categoryTagStyle: React.CSSProperties = { 
  background: 'var(--primary)',   
  color: '#ffffff',                  
  padding: '4px 10px', 
  borderRadius: '20px', 
  fontSize: '0.8rem',
  fontWeight: 'bold'
};

export default DirectoryPage;