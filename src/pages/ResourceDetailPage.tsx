import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { gsap } from "gsap";
import "./ResourceDetailPage.css";

interface DetailProps {
  modalId?: string;
  onClose?: () => void;
}

const ResourceDetailPage: React.FC<DetailProps> = ({ modalId, onClose }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const activeId = modalId || urlId;

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResource = async () => {
      if (!activeId) return;
      setLoading(true);
      try {
        const docRef = doc(db, "resources", activeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setResource({ id: docSnap.id, ...data });

          const starRef = doc(db, "starred", activeId);
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

  // GSAP entrance animations
  useLayoutEffect(() => {
    if (loading || !resource) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Staggered entrance
      tl.from(".rdp__hero-img, .rdp__hero-placeholder", {
        scale: 1.1,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          ".rdp__badge",
          {
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.5,
          },
          "-=0.4",
        )
        .from(
          ".rdp__title",
          {
            y: 40,
            opacity: 0,
            clipPath: "inset(100% 0 0 0)",
            duration: 0.7,
          },
          "-=0.3",
        )
        .from(
          ".rdp__location",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.4",
        )
        .from(
          ".rdp__section",
          {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
          },
          "-=0.3",
        )
        .from(
          ".rdp__contact-card",
          {
            x: 40,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.5",
        )
        .from(
          ".rdp__btn",
          {
            y: 20,
            opacity: 0,
            stagger: 0.08,
            duration: 0.4,
            ease: "back.out(1.4)",
          },
          "-=0.3",
        );
    }, pageRef);

    return () => ctx.revert();
  }, [loading, resource]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/resource/${activeId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: resource?.name, url: shareUrl });
      } catch (err) {
        console.log(err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="rdp">
        <div className="rdp__loading">
          <div className="rdp__spinner" />
          <span className="rdp__loading-text">Loading Resource...</span>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="rdp">
        <div className="rdp__not-found">
          <svg
            className="rdp__not-found-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="rdp__not-found-title">Resource Not Found</h2>
          <p className="rdp__not-found-text">
            The resource you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const displayAddress = resource.address || resource.location;
  const rawLink = resource.link || resource.url || resource.website;
  const displayLink = rawLink
    ? rawLink.startsWith("http")
      ? rawLink
      : `https://${rawLink}`
    : null;

  return (
    <div className="rdp" ref={pageRef}>
      {/* Hero */}
      <header className="rdp__hero">
        {resource.imageUrl ? (
          <img
            className="rdp__hero-img"
            src={resource.imageUrl}
            alt={resource.name}
          />
        ) : (
          <div className="rdp__hero-placeholder">🏢</div>
        )}
        <div className="rdp__hero-overlay">
          <div className="rdp__hero-badges">
            <span className="rdp__badge">{resource.category || "General"}</span>
            {isStarred && (
              <span className="rdp__badge rdp__badge--star">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Community Star
              </span>
            )}
            <span className="rdp__badge rdp__badge--verified">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified
            </span>
          </div>
          <h1 className="rdp__title">{resource.name}</h1>
          {displayAddress && (
            <p className="rdp__location">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {displayAddress}
            </p>
          )}
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="rdp__stats-bar">
        <div className="rdp__stat">
          <span className="rdp__stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <span className="rdp__stat-label">Cost</span>
          <span className="rdp__stat-value">{resource.cost || "Free"}</span>
        </div>
        <div className="rdp__stat">
          <span className="rdp__stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <span className="rdp__stat-label">Availability</span>
          <span className="rdp__stat-value">
            {resource.availability || "Open Now"}
          </span>
        </div>
        <div className="rdp__stat">
          <span className="rdp__stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span className="rdp__stat-label">Serves</span>
          <span className="rdp__stat-value">
            {resource.serves || "All Ages"}
          </span>
        </div>
        <div className="rdp__stat">
          <span className="rdp__stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span className="rdp__stat-label">Since</span>
          <span className="rdp__stat-value">
            {resource.established || "2020"}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="rdp__content">
        {/* Main Column */}
        <main className="rdp__main">
          <section className="rdp__section">
            <h2 className="rdp__section-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Overview
            </h2>
            <p className="rdp__description">
              {resource.description || "No description available."}
            </p>
          </section>

          {/* Services Offered */}
          <section className="rdp__section">
            <h2 className="rdp__section-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Services & Features
            </h2>
            <div className="rdp__services">
              {(
                resource.services || [
                  "General Assistance",
                  "Resource Referrals",
                  "Community Support",
                  "Information Services",
                ]
              ).map((service: string, i: number) => (
                <span key={i} className="rdp__service-tag">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {service}
                </span>
              ))}
            </div>
          </section>

          {resource.hours && (
            <section className="rdp__section">
              <h2 className="rdp__section-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Hours of Operation
              </h2>
              <div className="rdp__hours-grid">
                <div className="rdp__hours-row">
                  <span className="rdp__hours-day">Mon - Fri</span>
                  <span className="rdp__hours-time">
                    {resource.hours || "9:00 AM - 5:00 PM"}
                  </span>
                </div>
                <div className="rdp__hours-row">
                  <span className="rdp__hours-day">Saturday</span>
                  <span className="rdp__hours-time">
                    {resource.satHours || "10:00 AM - 2:00 PM"}
                  </span>
                </div>
                <div className="rdp__hours-row">
                  <span className="rdp__hours-day">Sunday</span>
                  <span className="rdp__hours-time">
                    {resource.sunHours || "Closed"}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Accessibility */}
          <section className="rdp__section rdp__section--highlight">
            <h2 className="rdp__section-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Accessibility & Amenities
            </h2>
            <div className="rdp__amenities">
              <div className="rdp__amenity">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
                </svg>
                Wheelchair Accessible
              </div>
              <div className="rdp__amenity">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
                Free Parking
              </div>
              <div className="rdp__amenity">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                Multi-language Support
              </div>
              <div className="rdp__amenity">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
                Safe Space Certified
              </div>
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="rdp__sidebar">
          <div className="rdp__contact-card">
            <h3 className="rdp__contact-title">Contact Information</h3>

            <div className="rdp__contact-row">
              <div className="rdp__contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="rdp__contact-label">Phone</p>
                <p className="rdp__contact-value">
                  {resource.phone || "Not Available"}
                </p>
              </div>
            </div>

            <div className="rdp__contact-row">
              <div className="rdp__contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="rdp__contact-label">Email</p>
                <p className="rdp__contact-value">
                  {resource.email || "contact@cypresshub.org"}
                </p>
              </div>
            </div>

            <div className="rdp__contact-row">
              <div className="rdp__contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="rdp__contact-label">Address</p>
                <p className="rdp__contact-value">
                  {displayAddress || "Cypress, TX"}
                </p>
              </div>
            </div>

            <div className="rdp__actions">
              {displayLink && (
                <a
                  href={displayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rdp__btn rdp__btn--primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Visit Website
                </a>
              )}

              {resource.phone && (
                <a
                  href={`tel:${resource.phone}`}
                  className="rdp__btn rdp__btn--secondary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call Now
                </a>
              )}

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(displayAddress || resource.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rdp__btn rdp__btn--outline"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Get Directions
              </a>

              <button
                onClick={handleShare}
                className={`rdp__btn ${copied ? "rdp__btn--success" : "rdp__btn--ghost"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {copied ? "Link Copied!" : "Share Resource"}
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="rdp__trust-card">
            <h3 className="rdp__trust-title">Trusted by Community</h3>
            <div className="rdp__trust-stats">
              <div className="rdp__trust-stat">
                <span className="rdp__trust-num">500+</span>
                <span className="rdp__trust-label">People Helped</span>
              </div>
              <div className="rdp__trust-stat">
                <span className="rdp__trust-num">4.8</span>
                <span className="rdp__trust-label">Rating</span>
              </div>
            </div>
            <p className="rdp__trust-note">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              Verified by CypressHub community team
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
