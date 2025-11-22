import React from 'react';

const ThemeToggle = ({ theme, setTheme }) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      style={{
        position: 'relative',
        marginLeft: 12,
        background: 'var(--color-accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 20,
        padding: '6px 16px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        transition: 'background var(--transition-fast), transform var(--transition-fast)'
      }}
    >
      {theme === 'dark' ? '🌞 Light Mode' : '🌜 Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
