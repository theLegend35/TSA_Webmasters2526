import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./EventsPage.css";
import EventMapEmbed from "../components/EventMapEmbed";
import ParkingLot3D from "../components/ParkingLot3D";
import ReservationForm from "../components/ReservationForm";

gsap.registerPlugin(ScrollTrigger);

interface CypressEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  url?: string;
  eventDate: any;
  displayDate: Date | null;
  timeStr?: string;
}

const CATEGORIES = [
  "All",
  "Town Hall",
  "Workshop",
  "Volunteering",
  "Recreational",
  "Festival",
];

const EventsPage: React.FC = () => {
  const { theme } = useAuth();
  const [events, setEvents] = useState<CypressEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CypressEvent | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isDark = theme === "dark";

  // GSAP entrance animations
  useLayoutEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero entrance
      tl.fromTo(
        ".ev__hero-tag",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
      )
        .fromTo(
          ".ev__hero-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5",
        )
        .fromTo(
          ".ev__hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5",
        );

      // Search bar
      tl.fromTo(
        searchRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        "-=0.3",
      );

      // Filter chips stagger
      tl.fromTo(
        ".ev__filter",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4 },
        "-=0.3",
      );

      // Section header
      tl.fromTo(
        ".ev__section-header",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5 },
        "-=0.2",
      );

      // Cards with ScrollTrigger
      gsap.fromTo(
        ".ev__card",
        { opacity: 0, y: 60, rotateX: -8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, [loading, activeCategory, searchTerm]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);

    const q = query(collection(db, "events"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        let dateObj: Date | null = null;
        let extractedTime = "";

        if (data.eventDate?.seconds) {
          dateObj = new Date(data.eventDate.seconds * 1000);
        } else if (typeof data.eventDate === "string") {
          if (data.eventDate.includes("•")) {
            extractedTime = data.eventDate.split("•")[1].trim();
          }
          const parsed = Date.parse(data.eventDate.replace("•", ""));
          dateObj = isNaN(parsed) ? null : new Date(parsed);
        } else if (data.eventDate instanceof Date) {
          dateObj = data.eventDate;
        }

        return {
          id: doc.id,
          ...data,
          displayDate: dateObj,
          timeStr: extractedTime,
        } as CypressEvent;
      });

      fetched.sort(
        (a, b) =>
          (a.displayDate?.getTime() || 0) - (b.displayDate?.getTime() || 0),
      );
      setEvents(fetched);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "unset";
  }, [selectedEvent]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const filterEvents = (eventList: CypressEvent[]) => {
    return eventList.filter((e) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        e.name?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.location?.toLowerCase().includes(searchLower);
      const matchesCategory =
        activeCategory === "All" || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const activeEvents = events.filter(
    (e) => !e.displayDate || e.displayDate >= now,
  );
  const archivedEvents = events.filter(
    (e) => e.displayDate && e.displayDate < now,
  );
  const filteredActive = filterEvents(activeEvents);

  const formatDateTime = (event: CypressEvent) => {
    if (!event.displayDate) return event.eventDate;

    const datePart = event.displayDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timePart =
      event.timeStr ||
      (event.displayDate.getHours() !== 0 ||
      event.displayDate.getMinutes() !== 0
        ? event.displayDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "");

    return `${datePart}${timePart ? ` • ${timePart}` : ""}`;
  };

  if (loading) {
    return (
      <div className={`ev ${isDark ? "ev--dark" : ""}`}>
        <div className="ev__loading">
          <div className="ev__spinner"></div>
          <span className="ev__loading-text">Loading Events</span>
        </div>
      </div>
    );
  }

  const closeModal = () => {
    setSelectedEvent(null);
    setSelectedSpot(null);
  };

  return (
    <div ref={pageRef} className={`ev ${isDark ? "ev--dark" : ""}`}>
      {/* Modal */}
      <div
        className={`ev__modal-overlay ${selectedEvent ? "ev__modal-overlay--open" : ""}`}
        onClick={closeModal}
      >
        {selectedEvent && (
          <div
            className="ev__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ev__modal-close" onClick={closeModal}>
              ✕
            </button>

            <span className="ev__detail-badge">{selectedEvent.category}</span>
            <h2 className="ev__detail-title">{selectedEvent.name}</h2>

            <div className="ev__detail-grid">
              <div className="ev__detail-box">
                <div className="ev__detail-label">When</div>
                <p className="ev__detail-value">
                  {formatDateTime(selectedEvent)}
                </p>
              </div>
              <div className="ev__detail-box">
                <div className="ev__detail-label">Where</div>
                <p className="ev__detail-value">{selectedEvent.location}</p>
              </div>
            </div>

            <div className="ev__detail-desc">
              <p>{selectedEvent.description}</p>
            </div>

            <div className="evx-experience">
              <div className="evx-grid">
                <section className="evx-card">
                  <h3 className="evx-card-title">Map & Arrival</h3>
                  <p className="evx-card-sub">
                    Navigate straight to the event entrance.
                  </p>
                  <EventMapEmbed location={selectedEvent.location} />
                </section>

                <section className="evx-card">
                  <h3 className="evx-card-title">Parking Lot (3D)</h3>
                  <p className="evx-card-sub">
                    Tap a green or gold spot to reserve.
                  </p>
                  <ParkingLot3D
                    selectedSpot={selectedSpot}
                    onSelectSpot={setSelectedSpot}
                  />
                  <div className="evx-legend">
                    <span>
                      <span className="evx-dot evx-dot--open" /> Open
                    </span>
                    <span>
                      <span className="evx-dot evx-dot--reserved" /> Reserved
                    </span>
                    <span>
                      <span className="evx-dot evx-dot--premium" /> Premium
                    </span>
                  </div>
                </section>
              </div>

              <section className="evx-card">
                <h3 className="evx-card-title">Reservation</h3>
                <p className="evx-card-sub">
                  Secure your place and parking in one step.
                </p>
                <ReservationForm
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.name}
                  selectedSpot={selectedSpot}
                />
              </section>
            </div>

            {selectedEvent.url && (
              <a
                href={selectedEvent.url}
                target="_blank"
                rel="noreferrer"
                className="ev__detail-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Visit Official Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Back to Top */}
      <button
        className={`ev__back-top ${showBackToTop ? "ev__back-top--visible" : ""}`}
        onClick={scrollToTop}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

      <div className="ev__wrapper">
        {/* Hero */}
        <header ref={heroRef} className="ev__hero">
          <span className="ev__hero-tag">Community Hub</span>
          <h1 className="ev__hero-title">
            Cypress <em>Gatherings</em>
          </h1>
          <p className="ev__hero-sub">
            Connect with your neighbors at local events, workshops, and
            community celebrations.
          </p>
        </header>

        {/* Search */}
        <div ref={searchRef} className="ev__search">
          <svg
            className="ev__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="ev__search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div ref={filtersRef} className="ev__filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`ev__filter ${activeCategory === cat ? "ev__filter--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="ev__section-header">
          <h2 className="ev__section-title">
            {activeCategory === "All" ? "Upcoming Events" : `${activeCategory}`}
          </h2>
          <div className="ev__section-line"></div>
        </div>

        {/* Events Grid */}
        <div ref={gridRef} className="ev__grid">
          {filteredActive.length > 0 ? (
            filteredActive.map((event) => (
              <article
                key={event.id}
                className="ev__card"
                onClick={() => setSelectedEvent(event)}
              >
                <span className="ev__card-category">{event.category}</span>
                <h3 className="ev__card-title">{event.name}</h3>
                <div className="ev__card-meta">
                  <span className="ev__card-date">
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
                    {formatDateTime(event)}
                  </span>
                  <span className="ev__card-dot"></span>
                  <span className="ev__card-location">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {event.location}
                  </span>
                </div>
                <div className="ev__card-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </article>
            ))
          ) : (
            <div className="ev__empty">
              <svg
                className="ev__empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3 className="ev__empty-title">No events found</h3>
              <p className="ev__empty-text">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Past Events */}
        {archivedEvents.length > 0 &&
          !searchTerm &&
          activeCategory === "All" && (
            <section className="ev__past-section">
              <div className="ev__section-header">
                <h2 className="ev__section-title">Past Events</h2>
                <div className="ev__section-line"></div>
              </div>
              <div className="ev__grid">
                {archivedEvents.map((event) => (
                  <article
                    key={event.id}
                    className="ev__card ev__card--past"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <span className="ev__card-category">{event.category}</span>
                    <h3 className="ev__card-title">{event.name}</h3>
                    <div className="ev__card-meta">
                      <span className="ev__card-date">
                        {event.displayDate?.toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
};

export default EventsPage;
