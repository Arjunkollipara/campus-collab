import React, { useEffect, useState } from 'react';
import { getProjects, joinProject, toggleProject, approveMember, removeMember } from '../api/projectApi';
import { useNavigate } from 'react-router-dom';


const ProjectList = ({ currentUserId, searchTitle = "", searchOwner = "", searchSkills = "", searchTrigger = 0, showRecommended = false, userSkills = [] }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data);
  };

  useEffect(() => { fetchProjects(); }, []);

  // Filter projects based on search or recommended
  const getFilteredProjects = () => {
    let filtered = [...projects];
    if (showRecommended) {
      // Show only open projects where user's skills match requiredSkills
      filtered = filtered.filter(p =>
        p.isOpen &&
        Array.isArray(p.requiredSkills) &&
        userSkills.some(skill => p.requiredSkills.includes(skill))
      );
    } else {
      filtered = filtered.filter(p => {
        let match = true;
        if (searchTitle && !(p.title && p.title.toLowerCase().includes(searchTitle.toLowerCase()))) match = false;
        if (searchOwner && !(p.owner && p.owner.name && p.owner.name.toLowerCase().includes(searchOwner.toLowerCase()))) match = false;
        if (searchSkills && !(Array.isArray(p.requiredSkills) && p.requiredSkills.some(sk => sk.toLowerCase().includes(searchSkills.toLowerCase())))) match = false;
        return match;
      });
    }
    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  const handleJoin = async (id) => {
    await joinProject(id, currentUserId);
    fetchProjects();
  };

  const handleToggle = async (id) => {
    await toggleProject(id);
    fetchProjects();
  };

  return (
    <div>
      <h2>Projects</h2>
      {/* Owner Approval Page Button */}
      <div style={{ marginBottom: 18 }}>
        <button onClick={() => navigate('/owner-approvals')} style={{ padding: '8px 18px', borderRadius: '6px', background: '#a1c4fd', color: '#2d3a4a', fontWeight: 600 }}>
          Manage Pending Approvals
        </button>
      </div>
      {filteredProjects.length === 0 ? <p>No projects found.</p> : (
        <ul className="project-list">
          {filteredProjects.map(p => {
            // ...existing code...
            // (rest of the project rendering logic remains unchanged)
            // ...existing code...
            const isPending = p.pendingMembers?.some(m => m._id === currentUserId);
            const isMember = p.members?.some(m => m._id === currentUserId);
            return (
              <li key={p._id} className="card">
                <strong>{p.title}</strong> — {p.description || 'No description'}
                <div>Skills: {p.requiredSkills?.join(', ') || '—'}</div>
                <div>Owner: {p.owner?.name} | Members: {p.members?.length || 0} | Status: {p.isOpen ? 'Open' : 'Closed'}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => navigate(`/projects/${p._id}`)} style={{ padding: '6px 10px', borderRadius: 6, marginRight: 8 }}>Open Room</button>
                  </div>
                {/* ...existing code... */}
                {/* Pending members list for owner, etc. */}
                {/* ...existing code... */}
                {/* Show 'Waiting for approval' for current user if pending */}
                {isPending && !isMember && (
                  <div style={{ color: '#e67e22', marginTop: 8 }}><em>Waiting for approval</em></div>
                )}
                {/* ...existing code... */}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
