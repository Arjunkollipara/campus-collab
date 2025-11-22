import React, { useEffect, useState } from "react";
import "./BadgeSelectionPage.css";
import { fetchBadges, updateSelectedBadges } from "../api/badgeApi";

const BadgeSelectionPage = () => {
  const [catalog, setCatalog] = useState([]); // all badges
  const [earned, setEarned] = useState([]); // codes user earned (from me fetch outside - placeholder)
  const [selected, setSelected] = useState([]); // codes user selected
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBadges().then(data => {
      setCatalog(data);
      try { localStorage.setItem('badgeCatalog', JSON.stringify(data)); } catch {}
    }).catch(err => {
      const msg = err?.response?.data?.message || err.message || 'Failed to load badges';
      setStatus(msg);
    });
    // Placeholder: in a full app you'd inject user data (me) via props/context
    const meRaw = localStorage.getItem('me');
    if (meRaw) {
      try {
        const me = JSON.parse(meRaw);
        setEarned(me.badges || []);
        setSelected(me.selectedBadges || []);
      } catch {}
    }
  }, []);

  const toggleSelect = (code) => {
    if (!earned.includes(code)) return; // cannot select not earned
    setSelected(sel => sel.includes(code) ? sel.filter(c => c !== code) : [...sel, code]);
  };

  const handleKey = (e, code, isEarned) => {
    if (!isEarned) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelect(code);
    }
  };

  const handleSave = async () => {
    setSaving(true); setStatus('');
    try {
      const { selectedBadges } = await updateSelectedBadges(selected);
      setSelected(selectedBadges);
      setStatus('Saved successfully');
      // Update cached me
      const meRaw = localStorage.getItem('me');
      if (meRaw) {
        try {
          const me = JSON.parse(meRaw);
          me.selectedBadges = selectedBadges;
          localStorage.setItem('me', JSON.stringify(me));
        } catch {}
      }
    } catch (err) {
      setStatus(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-full">
      <div className="page-inner">
        <div className="badge-selection-container hero-content stagger">
          <h2 className="hero-title">Select Badges to Display</h2>
          <p className="hero-subtitle" style={{marginTop:4}}>Click earned badges to toggle visibility on your profile.</p>
          <div className="badge-list" aria-live="polite">
            {catalog.map(b => {
              const isEarned = earned.includes(b.code);
              const isSelected = selected.includes(b.code);
              return (
                <div
                  key={b.code}
                  className={`badge-card${isSelected ? ' selected' : ''}`}
                  style={!isEarned ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                  onClick={() => toggleSelect(b.code)}
                  onKeyDown={(e) => handleKey(e, b.code, isEarned)}
                  role="button"
                  tabIndex={isEarned ? 0 : -1}
                  aria-pressed={isSelected}
                  title={!isEarned ? 'Not earned yet' : b.description}
                >
                  {b.image ? (
                    <img src={b.image} alt={b.name} className="badge-img" />
                  ) : (
                    <span className="badge-icon">{b.icon}</span>
                  )}
                  <span className="badge-name">{b.name}</span>
                </div>
              );
            })}
          </div>
          <div className="badge-feedback">
            {status || (selected.length === 0 ? 'No badges selected.' : `Selected: ${selected.length}`)}
          </div>
          <button disabled={saving} style={{marginTop:24}} onClick={handleSave}>{saving ? 'Saving...' : 'Save Selection'}</button>
        </div>
      </div>
    </div>
  );
};

export default BadgeSelectionPage;
