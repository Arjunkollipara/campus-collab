import api from './axios';

export const fetchMessages = (projectId) => api.get(`/api/projects/${projectId}/messages`);
