import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./LeaderDashboard.css";

gsap.registerPlugin(ScrollTrigger);

// Fake demo data for suggestions
const DEMO_RESOURCE_SUGGESTIONS = [
  {
    id: "demo-res-1",
    name: "Cypress Community Food Bank",
    location: "12345 Cypress Ave, Cypress, TX",
    category: "Food",
    createdAt: { toDate: () => new Date("2026-02-08") },
  },
  {
    id: "demo-res-2",
    name: "Harris County Health Clinic",
    location: "5678 Main St, Cypress, TX",
    category: "Health",
    createdAt: { toDate: () => new Date("2026-02-07") },
  },
  {
    id: "demo-res-3",
    name: "Lone Star College Tutoring Center",
    location: "9101 College Dr, Cypress, TX",
    category: "Education",
    createdAt: { toDate: () => new Date("2026-02-06") },
  },
];

const DEMO_EVENT_SUGGESTIONS = [
  {
    id: "demo-evt-1",
    name: "Spring Community Clean-Up",
    location: "Cypress Creek Park",
    category: "Volunteering",
    eventDate: "2026-03-15",
  },
  {
    id: "demo-evt-2",
    name: "Youth Basketball Tournament",
    location: "Cypress Recreation Center",
    category: "Recreational",
    eventDate: "2026-03-22",
  },
  {
    id: "demo-evt-3",
    name: "Town Hall Meeting: Infrastructure",
    location: "City Hall, Room 200",
    category: "Town Hall",
    eventDate: "2026-02-28",
  },
];

const LeaderDashboard: React.FC = () => {
  const { user, theme } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [resSuggestions, setResSuggestions] = useState<any[]>(
    DEMO_RESOURCE_SUGGESTIONS,
  );
  const [eventSuggestions, setEventSuggestions] = useState<any[]>(
    DEMO_EVENT_SUGGESTIONS,
  );
  const [liveResources, setLiveResources] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [starredResources, setStarredResources] = useState<any[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"resources" | "events">(
    "resources",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    eventDate: "",
    description: "",
    url: "",
    phone: "",
    imageUrl: "",
  });

  const resourceCats = [
    "Food",
    "Health",
    "Education",
    "Financial Aid",
    "Housing",
    "Other",
  ];
  const eventCats = [
    "Recreational",
    "Volunteering",
    "Town Hall",
    "Workshop",
    "Festival",
    "Other",
  ];

  const isDark = theme === "dark";

  // Scroll handler for back-to-top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // GSAP entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero animations
      tl.fromTo(
        ".lds__hero-badge",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
      )
        .fromTo(
          ".lds__hero-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4",
        )
        .fromTo(
          ".lds__hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5",
        );

      // Stats cards staggered
      gsap.fromTo(
        ".lds__stat",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".lds__stats",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Sections
      gsap.fromTo(
        ".lds__section",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".lds__section",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      // Tabs section
      gsap.fromTo(
        ".lds__tabs",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".lds__tabs",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "leader") return;

    const unsubResSub = onSnapshot(
      query(
        collection(db, "resourceSuggestions"),
        where("status", "==", "pending"),
      ),
      (s) => {
        const firebaseData = s.docs.map((d) => ({ ...d.data(), id: d.id }));
        // Merge with demo data
        setResSuggestions([...DEMO_RESOURCE_SUGGESTIONS, ...firebaseData]);
      },
    );
    const unsubEvSub = onSnapshot(
      query(
        collection(db, "eventSuggestions"),
        where("status", "==", "pending"),
      ),
      (s) => {
        const firebaseData = s.docs.map((d) => ({ ...d.data(), id: d.id }));
        // Merge with demo data
        setEventSuggestions([...DEMO_EVENT_SUGGESTIONS, ...firebaseData]);
      },
    );

    const unsubResLive = onSnapshot(collection(db, "resources"), (s) =>
      setLiveResources(s.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
    );
    const unsubEvLive = onSnapshot(collection(db, "events"), (s) => {
      setLiveEvents(s.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    });

    const unsubStarred = onSnapshot(
      query(collection(db, "starred"), where("userId", "==", user.uid)),
      (s) => {
        const docs = s.docs.map((d) => ({ ...d.data(), id: d.id }));
        setStarredResources(docs);
        setStarredIds(docs.map((d: any) => d.resourceId));
      },
    );

    const unsubUsers = onSnapshot(collection(db, "users"), (s) =>
      setTotalUsers(s.size),
    );

    return () => {
      unsubResLive();
      unsubEvLive();
      unsubResSub();
      unsubEvSub();
      unsubUsers();
      unsubStarred();
    };
  }, [user]);

  const toggleStar = async (resource: any) => {
    if (!user) return;
    const starDocId = `${user.uid}_${resource.id}`;
    const isCurrentlyStarred = starredIds.includes(resource.id);

    try {
      if (isCurrentlyStarred) {
        await deleteDoc(doc(db, "starred", starDocId));
      } else {
        await setDoc(doc(db, "starred", starDocId), {
          ...resource,
          userId: user.uid,
          resourceId: resource.id,
          starredAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Star Error:", err);
    }
  };

  const handleApprove = async (item: any, type: "resource" | "event") => {
    try {
      const liveColl = type === "resource" ? "resources" : "events";
      const suggestColl =
        type === "resource" ? "resourceSuggestions" : "eventSuggestions";
      const {
        id: suggestionId,
        createdAt: _oldCreatedAt,
        ...dataToSave
      } = item;

      // Check if this is demo data (IDs starting with "demo-")
      const isDemo = suggestionId.startsWith("demo-");

      await addDoc(collection(db, liveColl), {
        ...dataToSave,
        status: "approved",
        approvedBy: user?.email,
        createdAt: serverTimestamp(),
      });

      if (isDemo) {
        // Remove from local state for demo items
        if (type === "resource") {
          setResSuggestions((prev) =>
            prev.filter((r) => r.id !== suggestionId),
          );
        } else {
          setEventSuggestions((prev) =>
            prev.filter((e) => e.id !== suggestionId),
          );
        }
      } else {
        await updateDoc(doc(db, suggestColl, suggestionId), {
          status: "approved",
        });
      }
    } catch (err) {
      alert("Error approving.");
    }
  };

  const handleDelete = async (id: string, collName: string, name: string) => {
    if (
      window.confirm(`Are you sure you want to PERMANENTLY delete "${name}"?`)
    ) {
      // Check if this is demo data
      if (id.startsWith("demo-")) {
        if (collName === "resourceSuggestions") {
          setResSuggestions((prev) => prev.filter((r) => r.id !== id));
        } else if (collName === "eventSuggestions") {
          setEventSuggestions((prev) => prev.filter((e) => e.id !== id));
        }
        return;
      }

      try {
        await deleteDoc(doc(db, collName, id));
      } catch (err) {
        alert("Error deleting.");
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const coll = activeTab;
    let finalUrl = formData.url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl))
      finalUrl = `https://${finalUrl}`;

    try {
      await addDoc(collection(db, coll), {
        ...formData,
        url: finalUrl || null,
        status: "approved",
        createdAt: serverTimestamp(),
        approvedBy: user?.email,
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        category: "",
        location: "",
        eventDate: "",
        description: "",
        url: "",
        phone: "",
        imageUrl: "",
      });
    } catch (err) {
      alert("Error adding item.");
    }
  };

  const filteredData = (
    activeTab === "resources" ? liveResources : liveEvents
  ).filter(
    (i) =>
      i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user || user.role !== "leader") return <Navigate to="/" />;

  return (
    <div className={`lds${isDark ? " lds--dark" : ""}`} ref={pageRef}>
      {/* Hero Header */}
      <header className="lds__hero">
        <div className="lds__wrapper">
          <div className="lds__hero-content">
            <span className="lds__hero-badge">Admin Panel</span>
            <h1 className="lds__hero-title">
              Leader <em>Dashboard</em>
            </h1>
            <p className="lds__hero-sub">
              Manage resources, approve suggestions, and keep the community
              thriving.
            </p>
          </div>
        </div>
      </header>

      <main className="lds__wrapper">
        {/* Stats Grid */}
        <div className="lds__stats">
          <div className="lds__stat">
            <div className="lds__stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="lds__stat-value">
              {resSuggestions.length + eventSuggestions.length}
            </div>
            <div className="lds__stat-label">Pending</div>
          </div>
          <div className="lds__stat">
            <div className="lds__stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="lds__stat-value">{liveResources.length}</div>
            <div className="lds__stat-label">Resources</div>
          </div>
          <div className="lds__stat">
            <div className="lds__stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="lds__stat-value">{liveEvents.length}</div>
            <div className="lds__stat-label">Events</div>
          </div>
          <div className="lds__stat">
            <div className="lds__stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="lds__stat-value">
              {totalUsers > 0 ? totalUsers - 1 : 0}
            </div>
            <div className="lds__stat-label">Residents</div>
          </div>
        </div>

        {/* Pending Approval Section */}
        <section className="lds__section">
          <div className="lds__section-header">
            <h2 className="lds__section-title">
              <span className="lds__section-title-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              Pending Approval
            </h2>
            <span className="lds__section-badge">
              {resSuggestions.length + eventSuggestions.length} awaiting
            </span>
          </div>

          <div className="lds__subsection">
            <h3 className="lds__subsection-title">
              Resource Suggestions
              <span className="lds__subsection-count">
                {resSuggestions.length}
              </span>
            </h3>
            <Table
              data={resSuggestions}
              loading={loading}
              type="resource"
              isSuggestion
              onApprove={handleApprove}
              onDelete={(id: string, name: string) =>
                handleDelete(id, "resourceSuggestions", name)
              }
            />
          </div>

          <div className="lds__subsection">
            <h3 className="lds__subsection-title">
              Event Suggestions
              <span className="lds__subsection-count">
                {eventSuggestions.length}
              </span>
            </h3>
            <Table
              data={eventSuggestions}
              loading={loading}
              type="event"
              isSuggestion
              onApprove={handleApprove}
              onDelete={(id: string, name: string) =>
                handleDelete(id, "eventSuggestions", name)
              }
            />
          </div>
        </section>

        {/* Starred Resources Section */}
        {starredResources.length > 0 && (
          <section className="lds__starred">
            <div className="lds__section-header">
              <h2 className="lds__section-title">
                <span className="lds__section-title-icon lds__section-title-icon--star">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                Starred Resources
              </h2>
              <span
                className="lds__section-badge"
                style={{
                  background: "rgba(234, 179, 8, 0.15)",
                  color: "#ca8a04",
                }}
              >
                Featured on Homepage
              </span>
            </div>
            <Table
              data={starredResources.map((s) => ({ ...s, id: s.resourceId }))}
              loading={false}
              type="resource"
              onStar={toggleStar}
              starredIds={starredIds}
              onDelete={(id: string, name: string) =>
                handleDelete(`${user.uid}_${id}`, "starred", name)
              }
            />
          </section>
        )}

        {/* Tabs Section */}
        <section className="lds__tabs">
          <div className="lds__tabs-header">
            <div className="lds__tabs-nav">
              <button
                onClick={() => {
                  setActiveTab("resources");
                  setSearchTerm("");
                }}
                className={`lds__tab${activeTab === "resources" ? " lds__tab--active" : ""}`}
              >
                Live Resources
              </button>
              <button
                onClick={() => {
                  setActiveTab("events");
                  setSearchTerm("");
                }}
                className={`lds__tab${activeTab === "events" ? " lds__tab--active" : ""}`}
              >
                Live Events
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="lds__add-btn"
            >
              <span className="lds__add-btn-icon">+</span>
              Add {activeTab === "resources" ? "Resource" : "Event"}
            </button>
          </div>

          <div className="lds__search">
            <input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lds__search-input"
            />
          </div>

          <Table
            data={filteredData}
            loading={loading}
            type={activeTab === "resources" ? "resource" : "event"}
            onDelete={(id: string, name: string) =>
              handleDelete(id, activeTab, name)
            }
            onStar={toggleStar}
            starredIds={starredIds}
          />
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="lds__modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="lds__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="lds__modal-title">
              Add {activeTab === "resources" ? "Resource" : "Event"}
            </h2>
            <form onSubmit={handleManualSubmit} className="lds__form">
              <div className="lds__form-group">
                <label className="lds__form-label">Name</label>
                <input
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="lds__form-input"
                  required
                />
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="lds__form-select"
                  required
                >
                  <option value="">Select Category</option>
                  {(activeTab === "resources" ? resourceCats : eventCats).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Location</label>
                <input
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="lds__form-input"
                  required
                />
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Phone Number</label>
                <input
                  placeholder="(optional)"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="lds__form-input"
                />
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Image URL</label>
                <input
                  placeholder="Unsplash link preferred"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="lds__form-input"
                />
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Website URL</label>
                <input
                  placeholder="(optional)"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="lds__form-input"
                />
              </div>
              <div className="lds__form-group">
                <label className="lds__form-label">Description</label>
                <textarea
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="lds__form-textarea"
                  required
                />
              </div>
              <div className="lds__form-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="lds__form-btn lds__form-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lds__form-btn lds__form-btn--submit"
                >
                  Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="lds__back-top"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

/* ─── Table Component ───────────────────────────────────────── */
const Table = ({
  data,
  loading,
  type,
  onApprove,
  onDelete,
  isSuggestion,
  onStar,
  starredIds,
}: any) => (
  <div className="lds__table-wrap">
    <table className="lds__table">
      <thead className="lds__table-head">
        <tr>
          <th className="lds__table-th">
            {type === "event" ? "Date" : "Added"}
          </th>
          <th className="lds__table-th">Information</th>
          <th className="lds__table-th">Category</th>
          <th className="lds__table-th">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={4} className="lds__table-empty">
              Loading...
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={4} className="lds__table-empty">
              No items found
            </td>
          </tr>
        ) : (
          data.map((item: any) => (
            <tr key={item.id} className="lds__table-row">
              <td className="lds__table-td">
                {type === "event"
                  ? item.eventDate || "N/A"
                  : item.createdAt?.toDate?.().toLocaleDateString() || "Today"}
              </td>
              <td className="lds__table-td">
                <div className="lds__item-info">
                  {type === "resource" && !isSuggestion && onStar && (
                    <button
                      onClick={() => onStar(item)}
                      className={`lds__star-btn${starredIds?.includes(item.id) ? " lds__star-btn--active" : ""}`}
                    >
                      {starredIds?.includes(item.id) ? "★" : "☆"}
                    </button>
                  )}
                  <div>
                    <div className="lds__item-name">{item.name}</div>
                    <div className="lds__item-location">📍 {item.location}</div>
                  </div>
                </div>
              </td>
              <td className="lds__table-td">
                <span className="lds__category-badge">{item.category}</span>
              </td>
              <td className="lds__table-td">
                <div className="lds__actions">
                  {isSuggestion ? (
                    <>
                      <button
                        onClick={() => onApprove(item, type)}
                        className="lds__action-btn lds__action-btn--approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onDelete(item.id, item.name)}
                        className="lds__action-btn lds__action-btn--reject"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onDelete(item.id, item.name)}
                      className="lds__action-btn lds__action-btn--remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default LeaderDashboard;
