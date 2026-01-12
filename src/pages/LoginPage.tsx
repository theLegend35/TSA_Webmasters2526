import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (passwordRef.current) {
      if (password.length > 0 && password.length < 6) {
        passwordRef.current.setCustomValidity("Password should be at least 6 characters.");
      } else {
        passwordRef.current.setCustomValidity("");
      }
    }
  }, [password]);

  const autoFillJudge = () => {
    setEmail('judges@tsa.com');
    setPassword('judges!');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsBusy(true); 
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'leader') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: 'resident',
        createdAt: new Date()
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.code);
      setIsBusy(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-layout">
        <div className="auth-info-brand">
          <h1 className="auth-logo">Cypress<span>Hub</span></h1>
          <p className="auth-tagline">
            The central platform for Cypress residents to access resources, 
            report community issues, and stay connected.
          </p>
          
          <div onClick={autoFillJudge} className="judge-quick-access">
            <div className="judge-badge">TSA JUDGE ACCESS</div>
            <h4>Quick Login Tool</h4>
            <p>Click this card to automatically fill test credentials:</p>
            <div className="creds-pill-container">
              <div className="creds-pill">User: <strong>judges@tsa.com</strong></div>
              <div className="creds-pill">Pass: <strong>judges!</strong></div>
            </div>
            <p className="judge-hint">Leader login unlocks the Admin Dashboard.</p>
          </div>
        </div>

        <div className="auth-form-column">
          <form onSubmit={handleLogin} className="auth-card-modern">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Please enter your details</p>
            {errorMessage && <div className="auth-error-pill">⚠️ {errorMessage}</div>}
            
            <div className="input-field">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com"
                required 
              />
            </div>
            
            <div className="input-field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={toggleButtonStyle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="auth-button-stack">
              <button type="submit" className="btn-primary-action" disabled={isBusy}>
                {isBusy ? "Signing In..." : "Sign In"}
              </button>
              <div className="auth-divider"><span>or</span></div>
              <button type="button" className="btn-secondary-action" onClick={handleInstantRegister} disabled={isBusy}>
                Create New Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const toggleButtonStyle: React.CSSProperties = {
  position: 'absolute', 
  right: '12px', 
  top: '50%', 
  transform: 'translateY(-50%)',
  background: 'none', 
  border: 'none', 
  cursor: 'pointer',
  color: 'var(--text-muted)',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center'
};

export default LoginPage;