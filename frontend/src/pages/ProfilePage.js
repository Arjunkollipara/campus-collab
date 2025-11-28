import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import ProfileView from "../components/ProfileView";
import { getProfileByUserId } from "../api/profileApi";

function isProfileComplete(profile) {
  return profile && profile.bio && profile.bio.trim() !== "" && profile.skills && profile.skills.length > 0;
}

const ProfilePage = ({ me, onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const res = await getProfileByUserId(me._id);
        setProfile(res.data);
        setEditing(!isProfileComplete(res.data));
      } catch (err) {
        // store a readable error for the debug panel
        const msg = err?.response?.data?.message || err?.message || 'Failed to load profile';
        setProfileError(msg);
        try { console.warn('Profile fetch error', err); } catch {}
        setProfile(null);
        setEditing(true);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [me]);

  const handleProfileSaved = (newProfile) => {
    setProfile(newProfile);
    setEditing(false);
    // If profile is now complete, refresh user info in App.js
    if (isProfileComplete(newProfile) && onProfileUpdated) {
      onProfileUpdated();
      navigate("/projects");
    }
  };

  if (editing) {
    return (
      <div className="page-full">
        <div className="page-inner">
          <div style={{ textAlign: "center", marginTop: 40 }} className="stagger">
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h2 style={{ color: "#2d3a4a" }}>Please fill in your profile details</h2>
            <p style={{ color: "#4a5a6a", marginBottom: 24 }}>
              To access all features, complete your profile with your bio and skills. This helps us recommend the best projects for you!
            </p>
            <ProfileForm me={me} profile={profile} onProfileSaved={handleProfileSaved} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full">
      <div className="page-inner">
        <div className="profile-page-bg hero-content">
          {/* Animated background shapes */}
          <div className="profile-bg-shapes page-floating-shape shape-ani">
            <div className="profile-bg-shape1" />
            <div className="profile-bg-shape2" />
            <div className="profile-bg-shape3" />
          </div>
          <div className="profile-card-anim stagger">
            <div className="profile-card-left">
              {/* Debug / status panel - temporary, helps identify why fields are empty */}
              <div style={{ textAlign: 'left', width: '100%', padding: 12, borderRadius: 10, background: 'linear-gradient(90deg, rgba(0,0,0,0.04), rgba(255,255,255,0.02))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Profile status</strong>
                  <small style={{ color: 'var(--color-text-muted)' }}>{loadingProfile ? 'Loading...' : (profileError ? 'Error' : 'Loaded')}</small>
                </div>
                {profileError && <div style={{ color: '#ff6b6b', marginTop: 8 }}>Error: {profileError}</div>}
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <div><strong>me</strong>: <code style={{ wordBreak: 'break-word' }}>{me ? me._id : 'null'}</code></div>
                  <div style={{ marginTop:6 }}><strong>profile</strong>: {loadingProfile ? '...' : (profile ? <span style={{ color: 'var(--color-accent)' }}>present</span> : <span style={{ color: 'var(--color-text-muted)' }}>missing</span>)}</div>
                </div>
              </div>
            </div>

            <div className="profile-card-right">
              {/* ProfileView and buttons go here */}
              <ProfileView profile={profile} user={me} />
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <button className="profile-btn-anim" onClick={() => setEditing(true)}>Edit Profile</button>
                <button className="profile-btn-anim" onClick={() => navigate("/projects")}>Go to Projects</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;