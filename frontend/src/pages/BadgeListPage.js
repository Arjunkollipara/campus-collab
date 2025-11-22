import React from 'react';
import BadgeTable from '../components/BadgeTable';

const BadgeListPage = () => {
  return (
    <div style={{ padding:32 }}>
      <h2>All Badges</h2>
      <p style={{ color:'var(--color-text-muted)', marginBottom:16 }}>Browse every badge. Earned ones are highlighted.</p>
      <BadgeTable />
      <div style={{ marginTop:24 }}>
        <a href="/badges" style={{ textDecoration:'none', padding:'10px 16px', background:'var(--color-accent)', color:'#fff', borderRadius:8 }}>Go to Selection →</a>
      </div>
    </div>
  );
};

export default BadgeListPage;
