import React, { useEffect, useState } from 'react';
import { fetchBadges, createBadge, deleteBadge, bulkAward } from '../api/badgeApi';

const BadgeAdminPage = ({ me }) => {
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState({ code:'', name:'', icon:'', image:'', description:'' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await fetchBadges();
      setCatalog(data);
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message || 'Load failed');
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await createBadge(form);
      setForm({ code:'', name:'', icon:'', image:'', description:'' });
      load();
      setStatus('Created');
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message || 'Create failed');
    }
  };

  const onDelete = async (code) => {
    if (!confirm('Remove badge ' + code + '?')) return;
    try {
      await deleteBadge(code);
      load();
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message || 'Delete failed');
    }
  };

  const onBulk = async (code, criteria) => {
    if (!confirm(`Award ${code} to ${criteria === 'hasProfile' ? 'users with profiles' : 'all users'}?`)) return;
    setStatus('Processing bulk award...');
    try {
      const res = await bulkAward({ code, criteria });
      setStatus(`Bulk awarded ${res.awarded} users`);
      load();
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message || 'Bulk award failed');
    }
  };

  if (!me || me.role !== 'admin') return <p>Not authorized</p>;

  return (
    <div style={{ padding:24 }}>
      <h2>Badge Admin</h2>
      <p style={{ color:'var(--color-text-muted)' }}>Create or remove badges (admin only). Changes are in-memory for now.</p>
      <form onSubmit={onCreate} style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input placeholder="code (unique)" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} required />
        <input placeholder="name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input placeholder="icon (emoji)" value={form.icon} onChange={e=>setForm({...form, icon:e.target.value})} />
        <input placeholder="image url" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
        <input placeholder="short desc" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <button type="submit">Create</button>
      </form>
      {status && <div style={{ marginBottom:12 }}>{status}</div>}
      <div>
        <h3>Existing badges</h3>
        <div style={{ marginBottom:12 }}>
          <strong>Quick bulk actions:</strong>
          <div style={{ marginTop:8 }}>
            <button onClick={() => onBulk('profile_complete','all')} style={{ marginRight:8 }}>Give Profile badge to ALL</button>
            <button onClick={() => onBulk('profile_complete','hasProfile')}>Give Profile badge to users WITH profile</button>
          </div>
        </div>
        <ul>
          {catalog.map(b => (
            <li key={b.code} style={{ marginBottom:8 }}>
              <strong>{b.code}</strong> — {b.name} {b.icon ? ` ${b.icon}` : ''}
              <button style={{ marginLeft:12 }} onClick={()=>onDelete(b.code)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BadgeAdminPage;
