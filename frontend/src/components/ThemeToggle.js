import React from 'react';

const ThemeToggle = ({ theme, setTheme }) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        marginLeft: 12,
        background: 'var(--color-accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 22,
        padding: '8px 18px',
        fontSize: '0.95rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 28px rgba(12,18,40,0.12)',
        transition: 'transform 220ms cubic-bezier(.2,.9,.2,1), box-shadow 220ms',
        transform: 'translateZ(0)'
      }}
    >
      <span style={{ transform: theme === 'dark' ? 'translateY(-1px)' : 'translateY(0)', display:'inline-block' }}>{theme === 'dark' ? '🌞' : '🌜'}</span>
      <span style={{ fontWeight: 700 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;
