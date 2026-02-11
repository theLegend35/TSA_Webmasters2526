import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ResourceForm from "../components/ResourceForm";
import ResourceRow from "../components/ResourceRow";
import Hero from "../components/Hero";
import ResourceDetailPage from "./ResourceDetailPage";
import Subscribe from "../components/Subscribe";
import { useAuth } from "../context/AuthContext";
import "../HomePage.css";

gsap.registerPlugin(ScrollTrigger);

/* ── icons ── */
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ChevronUp = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const HomePage: React.FC = () => {
  const { theme } = useAuth();
  const isDark = theme === "dark";

  const [allResources, setAllResources] = useState<any[]>([]);
  const [starredResources, setStarredResources] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );

  const formRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth" });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedResourceId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedResourceId]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);

    const unsubscribeEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        const now = new Date();
        const fetched = snapshot.docs.map((doc) => {
          const data = doc.data();
          let dateObj: Date | null = null;
          let timing = "";
          if (typeof data.eventDate === "string") {
            timing = data.eventDate.split("•")[1]?.trim() || "";
            const cleanStr = data.eventDate.replace("•", "");
            const parsed = Date.parse(cleanStr);
            if (!isNaN(parsed)) dateObj = new Date(parsed);
          } else if (data.eventDate?.seconds) {
            dateObj = new Date(data.eventDate.seconds * 1000);
          }
          return {
            id: doc.id,
            ...data,
            rawDate: dateObj,
            timeStr: timing,
            monthStr:
              dateObj
                ?.toLocaleDateString("en-US", { month: "short" })
                .toUpperCase() || "JAN",
            dayStr: dateObj?.getDate().toString() || "01",
          };
        });
        setLiveEvents(
          fetched
            .filter((e: any) => e.rawDate && e.rawDate >= now)
            .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime())
            .slice(0, 5),
        );
      },
    );

    const fetchHomeData = async () => {
      try {
        const resSnap = await getDocs(collection(db, "resources"));
        setAllResources(
          resSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        const starSnap = await getDocs(
          query(collection(db, "starred"), limit(12)),
        );
        setStarredResources(
          starSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } catch (_) {
        /* noop */
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribeEvents();
    };
  }, []);

  /* ═══════════════════════════════════
     GSAP ScrollTrigger animations
     ═══════════════════════════════════ */
  useLayoutEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      /* ── Helper: create a scroll-triggered timeline ── */
      const stl = (trigger: string, start = "top 82%") =>
        gsap.timeline({
          scrollTrigger: {
            trigger,
            start,
            toggleActions: "play none none none",
          },
        });

      /* ────────────────────────────────────
         SECTION 1 — Value Proposition
         ──────────────────────────────────── */
      const valueTl = stl(".hp-value", "top 80%");

      valueTl
        .fromTo(
          ".hp-value__copy .hp-label",
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
        )
        .fromTo(
          ".hp-value__copy .hp-h2",
          { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            duration: 0.9,
            ease: "power4.out",
          },
          "-=0.3",
        )
        .fromTo(
          ".hp-value__copy .hp-body",
          { opacity: 0, y: 30, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.5",
        )
        .fromTo(
          ".hp-value__btns",
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.4)",
          },
          "-=0.3",
        );

      /* Stats cards — stagger from right with elastic spring */
      const statTl = stl(".hp-value__stats", "top 85%");
      statTl.fromTo(
        ".hp-stat",
        { opacity: 0, x: 80, rotateY: 15, filter: "blur(6px)" },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.15,
          ease: "power4.out",
        },
      );

      /* ────────────────────────────────────
         SECTION 2 — Feature Pillars
         ──────────────────────────────────── */
      const pillarTl = stl(".hp-pillars", "top 78%");

      pillarTl
        .fromTo(
          ".hp-pillars .hp-label",
          { opacity: 0, y: 20, letterSpacing: "0.5em" },
          {
            opacity: 1,
            y: 0,
            letterSpacing: "0.28em",
            duration: 0.6,
            ease: "power3.out",
          },
        )
        .fromTo(
          ".hp-pillars .hp-h2",
          { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.3",
        );

      /* Pillar cards — scale up from below with rotation */
      const pillarCardTl = stl(".hp-pillars__grid", "top 82%");
      pillarCardTl.fromTo(
        ".hp-pillar",
        { opacity: 0, y: 80, scale: 0.88, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power4.out",
        },
      );

      /* ────────────────────────────────────
         SECTION 3 — Content Grid
         ──────────────────────────────────── */
      /* Main headings — clip-path reveal */
      const mainTl = stl(".hp-main", "top 80%");
      mainTl.fromTo(
        ".hp-main .hp-h2",
        { opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.7,
          stagger: 0.25,
          ease: "power3.out",
        },
      );

      /* Resource rows — smooth slide up */
      gsap.fromTo(
        ".hp-main .category-row-container",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hp-main", start: "top 72%" },
        },
      );

      /* Sidebar cards — slide from right with glass blur */
      const sideTl = stl(".hp-side", "top 80%");
      sideTl.fromTo(
        ".hp-side__card",
        { opacity: 0, x: 60, filter: "blur(6px)", scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: "power4.out",
        },
      );

      /* Individual event items */
      gsap.fromTo(
        ".hp-ev",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hp-events", start: "top 88%" },
        },
      );

      /* ────────────────────────────────────
         SECTION 4 — CTA Band
         ──────────────────────────────────── */
      const ctaTl = stl(".hp-cta-band", "top 85%");
      ctaTl
        .fromTo(
          ".hp-cta-band .hp-h2",
          { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            duration: 0.8,
            ease: "power4.out",
          },
        )
        .fromTo(
          ".hp-cta-band .hp-body",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          ".hp-cta-band .hp-btn",
          { opacity: 0, scale: 0.85, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.6)",
          },
          "-=0.3",
        );

      /* ────────────────────────────────────
         SECTION 5 — Form
         ──────────────────────────────────── */
      const formTl = stl(".hp-form-section", "top 80%");
      formTl.fromTo(
        ".hp-form-wrap",
        { opacity: 0, y: 60, scale: 0.96, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power4.out",
        },
      );

      /* ────────────────────────────────────
         Parallax effects (scrub-linked)
         ──────────────────────────────────── */
      /* Gentle parallax on pillar section heading */
      gsap.to(".hp-pillars .hp-h2", {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hp-pillars",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      /* CTA band subtle parallax */
      gsap.to(".hp-cta-band__inner", {
        y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hp-cta-band",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, hpRef);

    return () => ctx.revert();
  }, [loading]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const featuredDisplay =
    starredResources.length > 0 ? starredResources : allResources.slice(0, 6);

  if (loading) {
    return (
      <div className={`hp ${isDark ? "hp--dark" : ""}`}>
        <div className="hp-loader">
          <div className="hp-loader__ring" />
          <span>Loading CypressHub&hellip;</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hp ${isDark ? "hp--dark" : ""}`} ref={hpRef}>
      {/* ── Modal ── */}
      {selectedResourceId && (
        <div className="hp-modal" onClick={() => setSelectedResourceId(null)}>
          <div className="hp-modal__body" onClick={(e) => e.stopPropagation()}>
            <button
              className="hp-modal__close"
              onClick={() => setSelectedResourceId(null)}
            >
              &#10005;
            </button>
            <ResourceDetailPage modalId={selectedResourceId} />
          </div>
        </div>
      )}

      {/* ── Back-to-top ── */}
      <button
        className={`hp-top ${showBackToTop ? "hp-top--show" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp />
      </button>

      {/* ── Hero ── */}
      <Hero onSuggestClick={scrollToForm} />

      {/* ══════════  SECTION 1 — Value Prop  ══════════ */}
      <section className="hp-value">
        <div className="hp-wrap">
          <div className="hp-value__grid">
            <div className="hp-value__copy">
              <span className="hp-label">Cypress Community Hub</span>
              <h2 className="hp-h2">
                A premium gateway
                <br />
                to the services that keep
                <br />
                Cypress strong.
              </h2>
              <p className="hp-body">
                CypressHub brings resources, events, and support into one
                elegant, easy-to-navigate destination — designed with the polish
                you'd expect from the best platforms on the web.
              </p>
              <div className="hp-value__btns">
                <Link to="/directory" className="hp-btn hp-btn--dark">
                  Explore Directory <ArrowIcon />
                </Link>
                <Link to="/about" className="hp-btn hp-btn--ghost">
                  Our Mission
                </Link>
              </div>
            </div>

            <div className="hp-value__stats">
              {[
                { big: "24 / 7", small: "Always-on access to every resource" },
                {
                  big: "Verified",
                  small: "Every listing reviewed by community leaders",
                },
                {
                  big: "Local",
                  small: "Built by Cypress residents, for Cypress residents",
                },
              ].map((s) => (
                <div key={s.big} className="hp-stat">
                  <span className="hp-stat__big">{s.big}</span>
                  <span className="hp-stat__small">{s.small}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════  SECTION 2 — Feature pillars  ══════════ */}
      <section className="hp-pillars">
        <div className="hp-wrap">
          <span className="hp-label">Why CypressHub</span>
          <h2 className="hp-h2 hp-h2--center">
            Three pillars of a connected community
          </h2>

          <div className="hp-pillars__grid">
            {[
              {
                num: "01",
                title: "Concierge-grade directory",
                text: "Every resource is presented with clarity, quick actions, and the polish of a premium client portal.",
              },
              {
                num: "02",
                title: "Events with intent",
                text: "An editorial event calendar that surfaces what matters most, week after week.",
              },
              {
                num: "03",
                title: "Trusted contributions",
                text: "Community suggestions flow through verified members, keeping the hub accurate and alive.",
              },
            ].map((p) => (
              <article key={p.num} className="hp-pillar">
                <span className="hp-pillar__num">{p.num}</span>
                <h3 className="hp-pillar__title">{p.title}</h3>
                <p className="hp-pillar__text">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════  SECTION 3 — Content grid  ══════════ */}
      <section className="hp-content">
        <div className="hp-wrap">
          <div className="hp-content__grid">
            {/* Main: Resource rows */}
            <div className="hp-main">
              <h2 className="hp-h2">Community Favorites</h2>
              <ResourceRow
                title="Starred Resources"
                resources={featuredDisplay}
                onResourceClick={setSelectedResourceId}
              />

              <div className="hp-spacer" />
              <h2 className="hp-h2">Explore by Category</h2>
              <ResourceRow
                title="Food & Nutrition"
                resources={allResources.filter((r) => r.category === "Food")}
                onResourceClick={setSelectedResourceId}
              />
              <ResourceRow
                title="Health & Wellness"
                resources={allResources.filter((r) => r.category === "Health")}
                onResourceClick={setSelectedResourceId}
              />
            </div>

            {/* Sidebar */}
            <aside className="hp-side">
              <div className="hp-side__card">
                <div className="hp-side__header">
                  <h3>Upcoming Events</h3>
                  <Link to="/events" className="hp-side__link">
                    See All <ArrowIcon />
                  </Link>
                </div>
                <div className="hp-events">
                  {liveEvents.map((ev) => (
                    <Link to={`/event/${ev.id}`} key={ev.id} className="hp-ev">
                      <div className="hp-ev__date">
                        <span className="hp-ev__month">{ev.monthStr}</span>
                        <span className="hp-ev__day">{ev.dayStr}</span>
                      </div>
                      <div className="hp-ev__info">
                        <span className="hp-ev__name">{ev.name}</span>
                        {ev.timeStr && (
                          <span className="hp-ev__meta">{ev.timeStr}</span>
                        )}
                        <span className="hp-ev__meta">{ev.location}</span>
                      </div>
                    </Link>
                  ))}
                  {liveEvents.length === 0 && (
                    <p className="hp-ev__empty">No upcoming events yet.</p>
                  )}
                </div>
              </div>

              <div className="hp-side__card hp-side__subscribe">
                <Subscribe />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════════  SECTION 4 — CTA band  ══════════ */}
      <section className="hp-cta-band">
        <div className="hp-wrap hp-cta-band__inner">
          <div>
            <h2 className="hp-h2 hp-h2--white">
              Know a resource we're missing?
            </h2>
            <p className="hp-body hp-body--white">
              Help grow the hub. Suggest a new service or event below.
            </p>
          </div>
          <button className="hp-btn hp-btn--gold" onClick={scrollToForm}>
            Suggest a Resource <ArrowIcon />
          </button>
        </div>
      </section>

      {/* ══════════  SECTION 5 — Form  ══════════ */}
      <section className="hp-form-section">
        <div className="hp-wrap">
          <div ref={formRef} className="hp-form-wrap">
            <ResourceForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
