import React, { useState } from "react";
import { getMe } from "../api/authApi";
import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";


function ProjectsPage({ me, onUserRefresh }) {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [searchSkills, setSearchSkills] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showRecommended, setShowRecommended] = useState(false);

  const handleSearch = () => {
    setSearchTrigger(searchTrigger + 1);
    setShowRecommended(false);
  };

  const handleRecommended = () => {
    setShowRecommended(true);
    setSearchTrigger(searchTrigger + 1);
  };

  return (
    <div className="page-full">
      <div className="page-inner">
        <div className="hero-content stagger">
          <h2 className="hero-title">Projects</h2>
          <p className="hero-subtitle">Explore, join, or create projects tailored to your skills.</p>
          <ProjectForm onCreated={async () => {
            // After first project creation, refresh user to pull new badge
            try {
              const updated = await getMe();
              localStorage.setItem('me', JSON.stringify(updated));
              onUserRefresh && onUserRefresh();
            } catch {}
          }} />

          {/* Search Block */}
          <div style={{ margin: "32px 0", padding: "16px", background: "linear-gradient(90deg,#ffffff08,#00000004)", borderRadius: "12px" }}>
            <h3 style={{ margin: 0 }}>Search Projects</h3>
            <div style={{ marginBottom: 10, display: "flex", gap: "18px", flexWrap: 'wrap', marginTop: 12 }}>
              <input
                type="text"
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                placeholder="Title"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "180px" }}
              />
              <input
                type="text"
                value={searchOwner}
                onChange={e => setSearchOwner(e.target.value)}
                placeholder="Owner Name"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "180px" }}
              />
              <input
                type="text"
                value={searchSkills}
                onChange={e => setSearchSkills(e.target.value)}
                placeholder="Skills Required"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "180px" }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSearch} style={{ padding: "8px 18px", borderRadius: "6px", background: "#a1c4fd", color: "#2d3a4a", fontWeight: 600 }}>Search</button>
              <button onClick={handleRecommended} style={{ marginLeft: 18, padding: "8px 18px", borderRadius: "6px", background: "#fbc2eb", color: "#2d3a4a", fontWeight: 600 }}>Show Recommended</button>
            </div>
          </div>

          {/* Project List with search/filter props */}
          <ProjectList
            currentUserId={me._id}
            searchTitle={searchTitle}
            searchOwner={searchOwner}
            searchSkills={searchSkills}
            searchTrigger={searchTrigger}
            showRecommended={showRecommended}
            userSkills={me.skills}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
