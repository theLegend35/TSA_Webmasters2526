import React, { useRef } from 'react';

interface RowProps { title: string; resources: any[]; isFeatured?: boolean; }

const ResourceRow: React.FC<RowProps> = ({ title, resources, isFeatured }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = isFeatured ? 450 : 320;
      rowRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (resources.length === 0) return null;

  return (
    <div className="category-row-wrapper">
      <div className="row-header-flex">
        <h2 className="section-heading">{title}</h2>
        <div className="row-controls">
          <button className="nav-arrow" onClick={() => scroll('left')}>←</button>
          <button className="nav-arrow" onClick={() => scroll('right')}>→</button>
        </div>
      </div>

      <div className="horizontal-row-container" ref={rowRef}>
        {resources.map(res => (
          <div key={res.id} className={`resource-shelf-card ${isFeatured ? 'featured-card' : ''}`}>
            <span className="category-tag">{res.category}</span>
            <h3>{res.name}</h3>
            <p>{res.description?.substring(0, 80)}...</p>
            <a href={res.url} target="_blank" rel="noreferrer" className="learn-more-btn">
              Learn More <span>→</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceRow;