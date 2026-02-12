import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

interface HeroProps {
  onSuggestClick?: () => void;
}

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80",
    tag: "Welcome",
    title: "Welcome to\nCypress",
    subtitle:
      "A thriving community deserves a connected hub. Discover resources, events, and neighbors who care.",
    cta: "Our Mission",
    link: "/about",
    isScroll: false,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80",
    tag: "Directory",
    title: "Find Local\nResources",
    subtitle:
      "From financial aid to housing support — access the help you need in one centralized, elegant directory.",
    cta: "Browse Directory",
    link: "/directory",
    isScroll: false,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
    tag: "Events",
    title: "Discover\nLocal Events",
    subtitle:
      "Never miss a town hall, festival, or community gathering again. Stay connected.",
    cta: "View Calendar",
    link: "/events",
    isScroll: false,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80",
    tag: "Community",
    title: "Stronger\nTogether",
    subtitle:
      "Join a growing network of neighbors helping neighbors. Community is power.",
    cta: "Join the Community",
    link: "/login",
    isScroll: false,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1920&q=80",
    tag: "Contribute",
    title: "Help Your\nNeighbors",
    subtitle:
      "Know a local resource we missed? Suggest a new service and grow the hub.",
    cta: "Suggest a Resource",
    link: "#",
    isScroll: true,
  },
];

const Hero: React.FC<HeroProps> = ({ onSuggestClick }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const isAnimating = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const INTERVAL = 8000;

  /* ── Animate the slide counter ── */
  const animateCounter = useCallback((index: number) => {
    const el = counterRef.current;
    if (!el) return;
    gsap.to(el, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        el.textContent = String(index + 1).padStart(2, "0");
        gsap.fromTo(
          el,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        );
      },
    });
  }, []);

  /* ── GSAP slide transition ── */
  const animateSlide = useCallback(
    (nextIndex: number, prevIndex: number) => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      /* Background crossfade with enhanced parallax Ken Burns */
      const prevBg = bgRefs.current[prevIndex];
      const nextBg = bgRefs.current[nextIndex];

      if (prevBg) {
        tl.to(
          prevBg,
          { opacity: 0, scale: 1.15, duration: 1.6, ease: "power2.inOut" },
          0,
        );
      }
      if (nextBg) {
        gsap.set(nextBg, { scale: 1.2, opacity: 0 });
        tl.to(
          nextBg,
          { opacity: 1, scale: 1, duration: 1.6, ease: "power2.inOut" },
          0,
        );
      }

      /* Content exit — stagger children out */
      const inner = contentRef.current;
      if (inner) {
        /* Swap content at midpoint */
        tl.call(
          () => {
            setCurrent(nextIndex);
            animateCounter(nextIndex);
          },
          [],
          0.55,
        );
      }

      /* Pulse active dot with enhanced animation */
      const dots = dotsRef.current?.querySelectorAll(".hero__dot");
      if (dots) {
        gsap.to(dots, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          opacity: 0.6,
        });
        if (dots[nextIndex]) {
          gsap.fromTo(
            dots[nextIndex],
            { scale: 1.4, opacity: 0.8 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.7,
              ease: "elastic.out(1.2, 0.6)",
            },
          );
        }
      }
    },
    [animateCounter],
  );

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating.current || index === current) return;
      isAnimating.current = true;
      setProgress(0);
      animateSlide(index, current);
    },
    [current, animateSlide],
  );

  const next = useCallback(
    () => goTo(current === slides.length - 1 ? 0 : current + 1),
    [current, goTo],
  );

  const prev = useCallback(
    () => goTo(current === 0 ? slides.length - 1 : current - 1),
    [current, goTo],
  );

  /* ── Initial cinematic entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const inner = contentRef.current;
      if (!inner) return;

      const masterTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /* 1. Background zoom-in reveal with tilt */
      const firstBg = bgRefs.current[0];
      if (firstBg) {
        masterTl.fromTo(
          firstBg,
          { opacity: 0, scale: 1.3 },
          { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" },
          0,
        );
      }

      /* 2. Vignette fade — enhanced */
      masterTl.fromTo(
        ".hero__vignette",
        { opacity: 0 },
        { opacity: 1, duration: 1.8 },
        0.2,
      );

      /* 3. Content group entrance with stagger */
      masterTl.fromTo(
        ".hero__tag",
        { opacity: 0, y: 20, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.2)",
        },
        1.2,
      );

      masterTl.fromTo(
        ".hero__title-line",
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power4.out",
        },
        1.3,
      );

      masterTl.fromTo(
        ".hero__sub",
        { opacity: 0, y: 20, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4",
      );

      masterTl.fromTo(
        ".hero__cta",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(1.3)",
        },
        "-=0.5",
      );

      /* 7. UI chrome — enhanced animations */
      masterTl.fromTo(
        ".hero__arrow",
        { opacity: 0, scale: 0.5, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(2.2)",
        },
        1.6,
      );

      masterTl.fromTo(
        ".hero__dots",
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" },
        1.7,
      );

      masterTl.fromTo(
        ".hero__counter",
        { opacity: 0, y: 20, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" },
        1.8,
      );

      masterTl.fromTo(
        ".hero__scroll",
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        1.9,
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ── Auto-advance with progress bar ── */
  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 100 / (INTERVAL / 50);
      });
    }, 50);
    return () => clearInterval(tick);
  }, [next]);

  /* ── Arrow hover magnetic effect ── */
  const handleArrowEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.2,
      duration: 0.4,
      ease: "back.out(1.6)",
    });
  };
  const handleArrowLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1.2, 0.5)",
    });
  };

  const handleCta = (slide: (typeof slides)[0]) => {
    if (slide.isScroll && onSuggestClick) onSuggestClick();
    else navigate(slide.link);
  };

  const slide = slides[current];

  return (
    <section className="hero" aria-label="Hero carousel" ref={heroRef}>
      {/* Background layers — GSAP-driven crossfade */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => {
            bgRefs.current[i] = el;
          }}
          className="hero__bg"
          style={{
            backgroundImage: `url("${s.image}")`,
            opacity: i === 0 ? 1 : 0,
          }}
          aria-hidden={i !== current}
        />
      ))}
      <div className="hero__vignette" />

      {/* Content */}
      <div className="hero__inner" ref={contentRef}>
        <span className="hero__tag">{slide.tag}</span>
        <h1 className="hero__title">
          {slide.title.split("\n").map((line, i) => (
            <span key={i} className="hero__title-line">
              {line}
            </span>
          ))}
        </h1>
        <p className="hero__sub">{slide.subtitle}</p>
        <div className="hero__ctas">
          <button
            className="hero__cta hero__cta--fill"
            onClick={() => handleCta(slide)}
          >
            {slide.cta}
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
          </button>
          <button
            className="hero__cta hero__cta--outline"
            onClick={() => navigate("/directory")}
          >
            Explore Directory
          </button>
        </div>
      </div>

      {/* Slide counter */}
      <div className="hero__counter">
        <span className="hero__counter-current" ref={counterRef}>
          01
        </span>
        <span className="hero__counter-sep">/</span>
        <span className="hero__counter-total">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="hero__arrow hero__arrow--l"
        aria-label="Previous slide"
        onMouseEnter={handleArrowEnter}
        onMouseLeave={handleArrowLeave}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={next}
        className="hero__arrow hero__arrow--r"
        aria-label="Next slide"
        onMouseEnter={handleArrowEnter}
        onMouseLeave={handleArrowLeave}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      {/* Progress dots */}
      <nav className="hero__dots" aria-label="Slide navigation" ref={dotsRef}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`hero__dot ${i === current ? "hero__dot--on" : ""}`}
            aria-label={`Go to slide ${i + 1}`}
          >
            {i === current && (
              <span
                className="hero__dot-bar"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </nav>
    </section>
  );
};

export default Hero;
