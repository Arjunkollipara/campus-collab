import React, { useEffect, useState } from 'react';
import { getProjects } from '../api/projectApi';
import { Link, useNavigate } from 'react-router-dom';

const TeamCollab = ({ me }) => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProjects();
        if (!mounted) return;
        setProjects(res.data || []);
      } catch (err) {
        console.error('TeamCollab fetch projects', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page-full">
      <div className="page-inner">
        <h2>Team Collaboration</h2>
        <p>Central hub for chat, discussions, files, and activity — future features will appear here.</p>

        <section style={{ marginTop: 20 }}>
          <h3>Your Projects</h3>
          {projects.length === 0 ? (
            <p>No projects yet. Create a project to start collaborating.</p>
          ) : (
            <ul>
              {projects.map(p => (
                <li key={p._id} style={{ marginBottom: 10 }}>
                  <strong>{p.title}</strong> — {p.description}
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => navigate(`/projects/${p._id}`)} style={{ marginRight: 8 }}>Open Room</button>
                    <Link to={`/projects/${p._id}`}>Open Room (link)</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ marginTop: 28 }}>
          <h3>Planned Features</h3>
          <ul>
            <li>Persistent Issues / Discussions (threaded)</li>
            <li>Project Files & Versioning (uploads)</li>
            <li>Activity Feed & Notifications</li>
            <li>Inline code reviews & snippet viewer</li>
          </ul>
          <p style={{ opacity: 0.85 }}>We will progressively enable these. For now, open a project room to use chat and see project details.</p>
        </section>
      </div>
    </div>
  );
};

export default TeamCollab;
