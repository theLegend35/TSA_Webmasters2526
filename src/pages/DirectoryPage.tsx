import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthContext";
import ResourceDetailPage from "./ResourceDetailPage";
import "./DirectoryPage.css";

gsap.registerPlugin(ScrollTrigger);

interface Resource {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  phone?: string;
  url?: string;
  starred?: boolean;
}

const DirectoryPage: React.FC = () => {
  const { theme } = useAuth();
  const isDark = theme === "dark";

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = [
    "All",
    "Food",
    "Health",
    "Education",
    "Financial Aid",
    "Jobs",
    "Housing",
    "Legal",
    "Community",
  ];

  // Fetch resources
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);

    const fetchResources = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "resources"));
        const resData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        const sorted = resData.sort(
          (a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0),
        );
        setResources(sorted);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching directory:", error);
        setLoading(false);
      }
    };

    fetchResources();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedResourceId ? "hidden" : "unset";
  }, [selectedResourceId]);

  // GSAP entrance animations
  useLayoutEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Hero entrance
      tl.from(".dir__hero-tag", {
        y: 30,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          ".dir__hero-title",
          {
            y: 60,
            opacity: 0,
            clipPath: "inset(100% 0 0 0)",
            duration: 1,
          },
          "-=0.5",
        )
        .from(
          ".dir__hero-sub",
          {
            y: 40,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.8,
          },
          "-=0.6",
        )
        .from(
          ".dir__search",
          {
            y: 30,
            opacity: 0,
            scale: 0.95,
            duration: 0.7,
            ease: "back.out(1.4)",
          },
          "-=0.4",
        )
        .from(
          ".dir__filter",
          {
            y: 20,
            opacity: 0,
            stagger: 0.04,
            duration: 0.5,
          },
          "-=0.4",
        )
        .from(
          ".dir__stats",
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3",
        );

      // Card scroll animations
      gsap.utils.toArray<HTMLElement>(".dir__card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          y: 60,
          opacity: 0,
          rotateX: 8,
          scale: 0.92,
          duration: 0.8,
          delay: (i % 3) * 0.08,
          ease: "power3.out",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  // Modal animation
  useEffect(() => {
    if (selectedResourceId) {
      setModalOpen(true);
    } else {
      const timeout = setTimeout(() => setModalOpen(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [selectedResourceId]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Arrow magnetic hover effect
  const handleArrowEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const arrow = e.currentTarget;
    gsap.to(arrow, {
      scale: 1.15,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const handleArrowLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    const arrow = e.currentTarget;
    gsap.to(arrow, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
    arrow.classList.remove("dir__card-arrow--clicked");
  };

  const handleArrowMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const arrow = e.currentTarget;
    const rect = arrow.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.3;
    const deltaY = (e.clientY - centerY) * 0.3;

    gsap.to(arrow, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleArrowClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    resourceId: string,
  ) => {
    e.stopPropagation();
    const arrow = e.currentTarget;

    // Add ripple class
    arrow.classList.add("dir__card-arrow--clicked");

    // Animate click
    gsap
      .timeline()
      .to(arrow, {
        scale: 0.85,
        duration: 0.1,
        ease: "power2.in",
      })
      .to(arrow, {
        scale: 1.2,
        duration: 0.3,
        ease: "back.out(2)",
      })
      .to(arrow, {
        scale: 1,
        duration: 0.2,
      });

    // Delay modal open slightly for animation effect
    setTimeout(() => {
      setSelectedResourceId(resourceId);
    }, 200);
  };

  const filtered = resources
    .filter(
      (res) => selectedCategory === "All" || res.category === selectedCategory,
    )
    .filter(
      (res) =>
        res.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const totalResources = resources.length;
  const featuredCount = resources.filter((r) => r.starred).length;

  if (loading) {
    return (
      <div className="dir">
        <div className="dir__loading">
          <div className="dir__spinner" />
          <span className="dir__loading-text">Loading Resources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`dir${isDark ? " dir--dark" : ""}`} ref={pageRef}>
      {/* Modal */}
      {modalOpen && (
        <div
          className={`dir__modal-overlay ${selectedResourceId ? "dir__modal-overlay--open" : ""}`}
          onClick={() => setSelectedResourceId(null)}
        >
          <div
            className="dir__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dir__modal-close"
              onClick={() => setSelectedResourceId(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="dir__modal-scroll">
              {selectedResourceId && (
                <ResourceDetailPage modalId={selectedResourceId} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to Top */}
      <button
        className={`dir__back-top ${showBackToTop ? "dir__back-top--visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
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

      <div className="dir__wrapper">
        {/* Hero Section */}
        <header className="dir__hero" ref={heroRef}>
          <span className="dir__hero-tag">Discover Local Resources</span>
          <h1 className="dir__hero-title">
            Resource <em>Directory</em>
          </h1>
          <p className="dir__hero-sub">
            Explore our curated collection of community resources designed to
            support Cypress residents with essential services and opportunities.
          </p>

          {/* Search */}
          <div className="dir__search">
            <svg
              className="dir__search-icon"
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
              className="dir__search-input"
              placeholder={`Search ${selectedCategory === "All" ? "all resources" : selectedCategory.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Filters */}
        <div className="dir__filters" ref={filtersRef}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`dir__filter ${selectedCategory === cat ? "dir__filter--active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="dir__stats">
          <div className="dir__stat">
            <span className="dir__stat-num">{totalResources}</span>
            <span className="dir__stat-label">Total Resources</span>
          </div>
          <div className="dir__stat">
            <span className="dir__stat-num">{featuredCount}</span>
            <span className="dir__stat-label">Featured</span>
          </div>
          <div className="dir__stat">
            <span className="dir__stat-num">{categories.length - 1}</span>
            <span className="dir__stat-label">Categories</span>
          </div>
        </div>

        {/* Results Bar */}
        <div className="dir__results-bar">
          <span className="dir__results-count">
            Showing <strong>{filtered.length}</strong> of {totalResources}{" "}
            resources
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </span>
        </div>

        {/* Grid */}
        <div className="dir__grid" ref={gridRef}>
          {filtered.length === 0 ? (
            <div className="dir__empty">
              <svg
                className="dir__empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="8" x2="14" y2="14" />
                <line x1="14" y1="8" x2="8" y2="14" />
              </svg>
              <h3 className="dir__empty-title">No resources found</h3>
              <p className="dir__empty-text">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filtered.map((res) => (
              <article
                key={res.id}
                className="dir__card"
                onClick={() => setSelectedResourceId(res.id)}
              >
                <div className="dir__card-media">
                  <img
                    className="dir__card-img"
                    src={
                      res.imageUrl ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
                    }
                    alt={res.name}
                    loading="lazy"
                  />
                  {res.starred && (
                    <span className="dir__card-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Featured
                    </span>
                  )}
                </div>
                <div className="dir__card-body">
                  <span className="dir__card-category">{res.category}</span>
                  <h3 className="dir__card-title">{res.name}</h3>
                  <p className="dir__card-contact">
                    {res.url ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="dir__card-link">
                          {res.url.replace(/^https?:\/\//, "")}
                        </span>
                      </>
                    ) : res.phone ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{res.phone}</span>
                      </>
                    ) : (
                      <span style={{ opacity: 0.6 }}>View Details</span>
                    )}
                  </p>
                </div>
                <span
                  className="dir__card-arrow"
                  onMouseEnter={handleArrowEnter}
                  onMouseLeave={handleArrowLeave}
                  onMouseMove={handleArrowMove}
                  onClick={(e) => handleArrowClick(e, res.id)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;
