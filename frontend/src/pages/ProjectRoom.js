import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ChatBox from '../components/ChatBox';

const ProjectRoom = ({ me, projectId: propProjectId }) => {
  const params = useParams();
  const id = propProjectId || params.id;
  const [project, setProject] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/api/projects/${id}`);
        if (!mounted) return;
        setProject(res.data);
      } catch (err) {
        console.error('ProjectRoom fetch error', err);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!project) return <div>Loading project...</div>;

  return (
    <div className="page-full">
      <div className="page-inner">
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3>Chat</h3>
            <ChatBox projectId={project._id} me={me} />
          </div>
          <div style={{ width: 320 }}>
            <h3>Project Details</h3>
            <div><strong>Owner:</strong> {project.owner?.name}</div>
            <div><strong>Members:</strong> {project.members?.length || 0}</div>
            <div><strong>Required Skills:</strong> {project.requiredSkills?.join(', ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRoom;
