import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const { theme } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (passwordRef.current) {
      if (password.length > 0 && password.length < 6) {
        passwordRef.current.setCustomValidity(
          "Password should be at least 6 characters.",
        );
      } else {
        passwordRef.current.setCustomValidity("");
      }
    }
  }, [password]);

  // GSAP entrance animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".lgn__logo",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
      )
        .fromTo(
          ".lgn__tagline",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5",
        )
        .fromTo(
          ".lgn__judge-card",
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          "-=0.4",
        )
        .fromTo(
          ".lgn__form-wrap",
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          "-=0.6",
        );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const autoFillJudge = () => {
    setEmail("judges@tsa.com");
    setPassword("judges!");
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsBusy(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "leader") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.code);
      setIsBusy(false);
    }
  };

  const handleInstantRegister = async (e: React.MouseEvent) => {
    const form = (e.target as HTMLButtonElement).form;
    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }
    setErrorMessage(null);
    setIsBusy(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: "resident",
        createdAt: new Date(),
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      setErrorMessage(err.code);
      setIsBusy(false);
    }
  };

  return (
    <div className={`lgn${isDark ? " lgn--dark" : ""}`} ref={pageRef}>
      <div className="lgn__split">
        {/* Brand Column */}
        <div className="lgn__brand">
          <h1 className="lgn__logo">
            Cypress<em>Hub</em>
          </h1>
          <p className="lgn__tagline">
            The central platform for Cypress residents to access resources,
            report community issues, and stay connected.
          </p>

          <div onClick={autoFillJudge} className="lgn__judge-card">
            <span className="lgn__judge-badge">TSA Judge Access</span>
            <h4 className="lgn__judge-title">Quick Login Tool</h4>
            <p className="lgn__judge-desc">
              Click this card to automatically fill test credentials:
            </p>
            <div className="lgn__creds">
              <div className="lgn__cred-pill">
                User: <strong>judges@tsa.com</strong>
              </div>
              <div className="lgn__cred-pill">
                Pass: <strong>judges!</strong>
              </div>
            </div>
            <p className="lgn__judge-hint">
              Leader login unlocks the Admin Dashboard.
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="lgn__form-col">
          <form onSubmit={handleLogin} className="lgn__form-wrap">
            <h2 className="lgn__form-title">Welcome Back</h2>
            <p className="lgn__form-sub">Please enter your details</p>

            {errorMessage && (
              <div className="lgn__error">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <div className="lgn__field">
              <label className="lgn__label">Email Address</label>
              <div className="lgn__input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="lgn__input"
                  required
                />
              </div>
            </div>

            <div className="lgn__field">
              <label className="lgn__label">Password</label>
              <div className="lgn__input-wrap">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="lgn__input"
                  style={{ paddingRight: "48px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="lgn__toggle-pw"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="lgn__actions">
              <button
                type="submit"
                className="lgn__btn lgn__btn--primary"
                disabled={isBusy}
              >
                {isBusy ? "Signing In..." : "Sign In"}
              </button>
              <div className="lgn__divider">
                <span>or</span>
              </div>
              <button
                type="button"
                className="lgn__btn lgn__btn--secondary"
                onClick={handleInstantRegister}
                disabled={isBusy}
              >
                Create New Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
