import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SliderProps { 
  title: string; 
  items: any[]; 
  isFeatured?: boolean; 
}

const CategorySlider: React.FC<SliderProps> = ({ title, items, isFeatured }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -450 : 450;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className={`category-row-container ${isFeatured ? 'featured-row' : ''}`}>
      <div className="section-header-flex">
        {title && <h3 className="category-title-large">{title}</h3>}
        <div className="slider-controls">
          <button className="slider-arrow" onClick={() => scroll('left')}>‹</button>
          <button className="slider-arrow" onClick={() => scroll('right')}>›</button>
        </div>
      </div>

      <div className="resources-slider-container" ref={scrollRef}>
        {items.map((res, i) => (
          <div 
            key={res.id || i} 
            className={`resource-card clickable-card ${isFeatured ? 'large-featured-card' : ''}`}
            onClick={() => navigate(`/resource/${res.id}`)}
          >
            <div className="card-image-placeholder">
               {res.imageUrl ? (
                 <img src={res.imageUrl} alt={res.name} className="card-main-img" />
               ) : (
                 <div className="image-icon-fallback">{isFeatured ? '⭐' : 'Hub'}</div>
               )}
               <span className="category-tag-alt">{res.category}</span>
            </div>

            <div className="card-details">
              <h3>{res.name}</h3>
              <p>{res.description?.substring(0, isFeatured ? 120 : 75)}...</p>
              
              <div className="card-contact-actions">
                {res.link && (
                  <a 
                    href={res.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="learn-more-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website <span>→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;