import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('ch-dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('ch-dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)} className="theme-toggle-btn">
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;