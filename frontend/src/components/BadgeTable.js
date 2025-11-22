import React, { useEffect, useState } from 'react';
import { fetchBadges } from '../api/badgeApi';

// Generic badge table listing all badges; earned highlighted.
const BadgeTable = () => {
  const [catalog, setCatalog] = useState([]);
  const [earned, setEarned] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('me');
      if (raw) {
        const me = JSON.parse(raw);
        setEarned(me.badges || []);
      }
    } catch {}
    fetchBadges()
      .then(data => { setCatalog(data); setLoading(false); })
      .catch(err => { setError(err?.response?.data?.message || err.message || 'Failed to load badges'); setLoading(false); });
  }, []);

  if (loading) return <p>Loading badges...</p>;
  if (error) return <p style={{color:'red'}}>{error}</p>;

  return (
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr style={{ textAlign:'left', borderBottom:'2px solid var(--color-bg-alt)' }}>
          <th style={{ padding:'8px' }}>Icon</th>
          <th style={{ padding:'8px' }}>Name</th>
          <th style={{ padding:'8px' }}>Description</th>
          <th style={{ padding:'8px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {catalog.map(b => {
          const isEarned = earned.includes(b.code);
          return (
            <tr key={b.code} style={{ background:isEarned ? 'var(--color-surface)' : 'transparent', borderBottom:'1px solid var(--color-bg-alt)' }}>
              <td style={{ padding:'8px' }}>{b.image ? <img src={b.image} alt={b.name} style={{ width:40, height:40 }} /> : b.icon}</td>
              <td style={{ padding:'8px', fontWeight:600 }}>{b.name}</td>
              <td style={{ padding:'8px', fontSize:'0.85rem', color:'var(--color-text-muted)' }}>{b.description}</td>
              <td style={{ padding:'8px' }}>{isEarned ? 'Earned' : 'Locked'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default BadgeTable;
