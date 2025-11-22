import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { awardBadge, fetchBadges } from "../../api/badgeApi";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [badgeCatalog, setBadgeCatalog] = useState([]);
  const [awardState, setAwardState] = useState({}); // userId -> selected code
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(() => setError("Failed to fetch users"))
      .finally(() => setLoading(false));
    fetchBadges()
      .then(setBadgeCatalog)
      .catch(() => {});
  }, []);
  const handleAward = async (userId) => {
    const code = awardState[userId];
    if (!code) return alert('Select a badge first');
    try {
      await awardBadge(userId, code);
      setUsers(us => us.map(u => u._id === userId ? { ...u, badges: [...(u.badges||[]), code] } : u));
      setAwardState(st => ({ ...st, [userId]: '' }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to award badge');
    }
  };

  const handleBan = async (id) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await api.patch(`/api/users/ban/${id}`);
      setUsers(users => users.map(u => u._id === id ? { ...u, banned: true } : u));
    } catch {
      alert("Failed to ban user");
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm("Promote this user to admin?")) return;
    try {
      await api.patch(`/api/users/promote/${id}`);
      setUsers(users => users.map(u => u._id === id ? { ...u, role: "admin" } : u));
    } catch {
      alert("Failed to promote user");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h3>All Users</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} style={{ background: user.banned ? "#ffeaea" : "inherit" }}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.banned ? "Yes" : "No"}</td>
              <td style={{ minWidth: 260 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {!user.banned && <button onClick={() => handleBan(user._id)}>Ban</button>}
                    {user.role !== "admin" && <button onClick={() => handlePromote(user._id)}>Make Admin</button>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <select
                      value={awardState[user._id] || ''}
                      onChange={e => setAwardState(s => ({ ...s, [user._id]: e.target.value }))}
                      style={{ padding:'6px 8px' }}
                    >
                      <option value="">Select badge</option>
                      {badgeCatalog.map(b => <option key={b.code} value={b.code}>{b.icon} {b.name}</option>)}
                    </select>
                    <button onClick={() => handleAward(user._id)}>Award</button>
                  </div>
                  {user.badges && user.badges.length > 0 && (
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', fontSize:'0.85rem' }}>
                      {user.badges.map(code => <span key={code} style={{ background:'var(--color-bg-alt)', padding:'4px 6px', borderRadius:6 }}>{code}</span>)}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
