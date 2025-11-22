import React, { useEffect, useState } from 'react';
import { fetchBadges } from '../api/badgeApi';
import './BadgeCatalogPage.css';

// Shows all badges, indicates which are earned. No selection here.
const BadgeCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [earned, setEarned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user earned badges from cached me
    try {
      const raw = localStorage.getItem('me');
      if (raw) {
        const me = JSON.parse(raw);
        setEarned(me.badges || []);
      }
    } catch {}

    fetchBadges()
      .then(data => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.message || err.message || 'Failed to load badges');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-full"><div className="page-inner"><div className="badge-catalog-container hero-content">Loading badge catalog...</div></div></div>;
  if (error) return <div className="page-full"><div className="page-inner"><div className="badge-catalog-container hero-content" style={{color:'var(--color-danger,#c00)'}}>{error}</div></div></div>;

  return (
    <div className="page-full">
      <div className="page-inner">
        <div className="badge-catalog-container hero-content stagger">
          <h2 className="hero-title">Badge Catalog</h2>
          <p className="badge-catalog-sub">All badges, earned ones highlighted. Lock icon means not yet earned.</p>
          <div className="badge-catalog-grid" aria-live="polite">
            {catalog.map(b => {
              const isEarned = earned.includes(b.code);
              return (
                <div key={b.code} className={`catalog-card${isEarned ? ' earned' : ''}`}> 
                  {b.image ? (
                    <img src={b.image} alt={b.name} className="catalog-img" />
                  ) : (
                    <span className="catalog-icon">{b.icon}</span>
                  )}
                  <div className="catalog-info">
                    <div className="catalog-title-row">
                      <span className="catalog-name">{b.name}</span>
                      {!isEarned && <span className="catalog-lock" title="Locked">🔒</span>}
                    </div>
                    <p className="catalog-desc">{b.description}</p>
                    <div className="catalog-status">{isEarned ? 'Earned' : 'Locked'}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:32}}>
            <a href="/badges" className="catalog-link-select">Go to Badge Selection →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCatalogPage;
