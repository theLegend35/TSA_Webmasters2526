import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Ensure this path is correct based on your folder structure
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: any | null;
  loading: boolean;        // THIS WAS MISSING
  logout: () => void;      // THIS WAS MISSING
  theme: string;           // THIS WAS MISSING
  toggleTheme: () => void; // THIS WAS MISSING
  lang: string;            // THIS WAS MISSING
  toggleLang: () => void;  // THIS WAS MISSING
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');
-
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({ 
          uid: firebaseUser.uid, 
          email: firebaseUser.email, 
          role: userDoc.data().role 
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'es' : 'en'));

  return (
    <AuthContext.Provider value={{ user, loading, logout, theme, toggleTheme, lang, toggleLang }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};