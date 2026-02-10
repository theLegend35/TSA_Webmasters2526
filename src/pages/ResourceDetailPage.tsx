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

      {/* Content Grid */}
      <div className="rdp__content">
        {/* Main Column */}
        <main className="rdp__main">
          <section className="rdp__section">
            <h2 className="rdp__section-title">Overview</h2>
            <p className="rdp__description">
              {resource.description || "No description available."}
            </p>
          </section>

          {resource.hours && (
            <section className="rdp__section">
              <h2 className="rdp__section-title">Hours of Operation</h2>
              <p className="rdp__hours">{resource.hours}</p>
            </section>
          )}
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
        </aside>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
