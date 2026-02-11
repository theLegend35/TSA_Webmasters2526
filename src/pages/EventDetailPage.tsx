import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import EventMapEmbed from "../components/EventMapEmbed";
import ParkingLot3D from "../components/ParkingLot3D";
import ReservationForm from "../components/ReservationForm";
import "../components/EventExperience.css";

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, theme } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "events", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvent({ id: docSnap.id, ...data });
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;

    const starDocId = `${user.uid}_${id}`;
    const unsub = onSnapshot(doc(db, "starred", starDocId), (docSnapshot) => {
      setIsStarred(docSnapshot.exists());
    });

    return () => unsub();
  }, [user, id]);

  const toggleStar = async () => {
    if (!user || !id || !event) return;
    const starDocId = `${user.uid}_${id}`;

    try {
      if (isStarred) {
        await deleteDoc(doc(db, "starred", starDocId));
      } else {
        await setDoc(doc(db, "starred", starDocId), {
          userId: user.uid,
          resourceId: id,
          name: event.name,
          category: event.category,
          location: event.location || event.place || "Online/TBD",
          type: "event",
          starredAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Star toggle error:", err);
      alert("Failed to update star status. Please check permissions.");
    }
  };

  if (loading)
    return (
      <div
        className="loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <span style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
          Loading Event Details...
        </span>
      </div>
    );

  if (!event)
    return (
      <div
        className="error-screen"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h2 style={{ color: "#ef4444" }}>Event not found.</h2>
        <Link
          to="/events"
          style={{ color: "var(--primary)", textDecoration: "none" }}
        >
          Return to Events List
        </Link>
      </div>
    );

  const displayDate = event.eventDate
    ? new Date(event.eventDate).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : event.date?.toDate?.().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) ||
      event.recurringDay ||
      "Date TBD";

  return (
    <div
      className={`detail-page-root ${theme === "dark" ? "dark-mode" : ""}`}
      style={{ padding: "20px 0" }}
    >
      <div
        className="detail-max-width"
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <Link
            to="/events"
            className="back-link-modern"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: "600",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ← Back to Events
          </Link>

          {user && (
            <button
              onClick={toggleStar}
              style={{
                background: isStarred ? "#facc15" : "transparent",
                border: "2px solid #facc15",
                color: isStarred ? "#000" : "#facc15",
                padding: "8px 20px",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                boxShadow: isStarred
                  ? "0 4px 12px rgba(250, 204, 21, 0.3)"
                  : "none",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {isStarred ? "★" : "☆"}
              </span>
              {isStarred ? "Starred" : "Star Event"}
            </button>
          )}
        </div>

        <header
          className="detail-hero"
          style={{
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="hero-image-container"
            style={{ height: "400px", width: "100%", position: "relative" }}
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                className="hero-placeholder"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "5rem",
                  fontWeight: "800",
                }}
              >
                {event.name.charAt(0)}
              </div>
            )}

            <div
              className="hero-overlay"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "40px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                color: "white",
              }}
            >
              <span
                className="hero-badge"
                style={{
                  background: "var(--primary)",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {event.category}
              </span>
              <h1
                style={{
                  margin: "15px 0 0 0",
                  fontSize: "2.5rem",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {event.name}
              </h1>
            </div>
          </div>
        </header>

        <main
          className="detail-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "40px",
          }}
        >
          <section className="detail-main-content">
            <div
              className="content-card"
              style={{
                background: "var(--card-bg)",
                padding: "30px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                minHeight: "200px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "var(--text-main)",
                  borderBottom: "2px solid var(--border-color)",
                  paddingBottom: "10px",
                }}
              >
                About This Event
              </h2>
              <p
                style={{
                  lineHeight: "1.8",
                  color: "var(--text-main)",
                  fontSize: "1.1rem",
                  whiteSpace: "pre-line",
                }}
              >
                {event.description ||
                  "No description provided for this event. Please contact the organizer for more details."}
              </p>
            </div>

            <div className="evx-experience" style={{ marginTop: "28px" }}>
              <div className="evx-grid">
                <section className="evx-card">
                  <h3 className="evx-card-title">Map & Arrival</h3>
                  <p className="evx-card-sub">
                    Navigate straight to the event entrance.
                  </p>
                  <EventMapEmbed location={event.location || event.place} />
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
                  eventId={event.id}
                  eventName={event.name}
                  selectedSpot={selectedSpot}
                />
              </section>
            </div>
          </section>

          <aside className="detail-sidebar">
            <div
              className="contact-card-modern"
              style={{
                background: "var(--card-bg)",
                padding: "30px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                position: "sticky",
                top: "20px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "25px",
                  fontSize: "1.3rem",
                }}
              >
                Event Logistics
              </h3>

              <div
                className="info-row"
                style={{ display: "flex", gap: "15px", marginBottom: "20px" }}
              >
                <span className="info-icon" style={{ fontSize: "1.5rem" }}>
                  🗓️
                </span>
                <div className="info-text">
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Date & Time
                  </label>
                  <p
                    style={{
                      margin: "5px 0",
                      fontWeight: "600",
                      color: "var(--text-main)",
                    }}
                  >
                    {displayDate}
                  </p>
                </div>
              </div>

              <div
                className="info-row"
                style={{ display: "flex", gap: "15px", marginBottom: "20px" }}
              >
                <span className="info-icon" style={{ fontSize: "1.5rem" }}>
                  📍
                </span>
                <div className="info-text">
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Location
                  </label>
                  <p
                    style={{
                      margin: "5px 0",
                      fontWeight: "600",
                      color: "var(--text-main)",
                    }}
                  >
                    {event.location || event.place || "Location TBD"}
                  </p>
                </div>
              </div>

              {event.url && (
                <div
                  className="info-row"
                  style={{ display: "flex", gap: "15px", marginBottom: "25px" }}
                >
                  <span className="info-icon" style={{ fontSize: "1.5rem" }}>
                    🔗
                  </span>
                  <div className="info-text">
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      Official Link
                    </label>
                    <p style={{ margin: "5px 0" }}>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "var(--primary)",
                          fontWeight: "700",
                          textDecoration: "none",
                        }}
                      >
                        Visit Website →
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  className="action-btn site"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "15px",
                    background: "var(--primary)",
                    color: "white",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "800",
                    fontSize: "1rem",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 4px 15px rgba(var(--primary-rgb), 0.3)",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  Register Now
                </a>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default EventDetailPage;
