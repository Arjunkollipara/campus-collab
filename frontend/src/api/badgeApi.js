import api from './axios';

export const fetchBadges = () => api.get('/api/badges').then(r => r.data);
export const awardBadge = (userId, code) => api.post(`/api/badges/award/${userId}`, { code }).then(r => r.data);
export const updateSelectedBadges = (selected) => api.patch('/api/badges/selected', { selected }).then(r => r.data);
export const createBadge = (payload) => api.post('/api/badges', payload).then(r => r.data);
export const updateBadge = (code, payload) => api.put(`/api/badges/${code}`, payload).then(r => r.data);
export const deleteBadge = (code) => api.delete(`/api/badges/${code}`).then(r => r.data);
export const bulkAward = (payload) => api.post('/api/badges/award/bulk', payload).then(r => r.data);
