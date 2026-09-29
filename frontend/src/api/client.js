const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (username, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getCitizen: (id) => request(`/citizens/${id}`),
  getCitizenApplications: (id) => request(`/citizens/${id}/applications`),
  createApplication: (citizen_id, scheme_name) =>
    request('/applications', { method: 'POST', body: JSON.stringify({ citizen_id, scheme_name }) }),
  getApplication: (id) => request(`/applications/${id}`),
  submitConsent: (id, granted, purposes) =>
    request(`/applications/${id}/consent`, { method: 'POST', body: JSON.stringify({ granted, purposes }) }),
  runVerification: (id) => request(`/applications/${id}/verify`, { method: 'POST' }),
  getTimeline: (id) => request(`/applications/${id}/timeline`),
  officerDashboard: () => request('/officer/applications'),
  officerReviews: () => request('/officer/reviews'),
  getReview: (id) => request(`/officer/reviews/${id}`),
  approveReview: (id, officer) =>
    request(`/officer/reviews/${id}/approve`, { method: 'POST', body: JSON.stringify({ officer }) }),
  rejectReview: (id, officer) =>
    request(`/officer/reviews/${id}/reject`, { method: 'POST', body: JSON.stringify({ officer }) }),
  audit: () => request('/audit'),
};
