import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onSuggestClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSuggestClick }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80",
      title: "Welcome to Cypress",
      subtitle: "A thriving community deserves a connected hub. Learn about our mission to connect every resident.",
      cta: "Our Mission",
      link: "/about", 
      isScroll: false 
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80",
      title: "Find Local Resources",
      subtitle: "From financial aid to housing support, access the help you need in one centralized directory.",
      cta: "Browse Directory",
      link: "/directory",
      isScroll: false
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80",
      title: "Discover Local Events",
      subtitle: "Never miss a town hall, festival, or community gathering again.",
      cta: "View Calendar",
      link: "/events",
      isScroll: false
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80",
      title: "Stronger Together",
      subtitle: "Join a growing network of neighbors helping neighbors.",
      cta: "Join the Community",
      link: "/login",
      isScroll: false
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1600&q=80",
      title: "Help Your Neighbors",
      subtitle: "Know of a local resource we missed? Contribute to the hub by suggesting a new service.",
      cta: "Suggest a Resource",
      link: "#", 
      isScroll: true 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleCtaClick = (slide: any) => {
    if (slide.isScroll && onSuggestClick) {
      onSuggestClick();
    } else {
      navigate(slide.link);
    }
  };

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    <div style={{ ...heroContainer, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("${slides[current].image}")` }}>
      <button onClick={prevSlide} style={arrowBtnLeft}>&#10094;</button>

      <div style={overlay}>
        <h1 style={title}>{slides[current].title}</h1>
        <p style={subtitle}>{slides[current].subtitle}</p>
        <div style={buttonGroup}>
          <button onClick={() => handleCtaClick(slides[current])} style={primaryBtn}>
            {slides[current].cta}
          </button>
        </div>
      </div>

      <button onClick={nextSlide} style={arrowBtnRight}>&#10095;</button>

      <div style={dotsContainer}>
        {slides.map((_, index) => (
          <span 
            key={index} 
            onClick={() => setCurrent(index)}
            style={{ 
              ...dot, 
              opacity: index === current ? 1 : 0.5, 
              transform: index === current ? 'scale(1.2)' : 'scale(1)',
              background: 'white'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const heroContainer: React.CSSProperties = { height: '80vh', width: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'background-image 1s ease-in-out', marginBottom: '40px' };
const overlay = { textAlign: 'center' as const, color: 'white', padding: '0 20px', zIndex: 2, maxWidth: '900px' };
const title = { fontSize: '4rem', fontWeight: '800', marginBottom: '15px', textShadow: '0 4px 6px rgba(0,0,0,0.3)' };
const subtitle = { fontSize: '1.5rem', maxWidth: '700px', margin: '0 auto 30px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', lineHeight: '1.6' };
const buttonGroup = { display: 'flex', gap: '15px', justifyContent: 'center' };
const primaryBtn = { padding: '15px 35px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' as const };
const arrowBtn = { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', padding: '10px 15px', borderRadius: '50%', zIndex: 10 };
const arrowBtnLeft = { ...arrowBtn, left: '20px' };
const arrowBtnRight = { ...arrowBtn, right: '20px' };
const dotsContainer = { position: 'absolute' as const, bottom: '20px', display: 'flex', gap: '10px', zIndex: 10 };
const dot = { width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s ease' };

export default Hero;