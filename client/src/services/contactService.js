import api from './api';

// POST /api/contact — the storefront contact form. The server stores the
// message and emails the studio; nothing is sent from the browser directly.
export const sendContactMessage = async (message) =>
  (await api.post('/contact', message)).data;

// GET /api/contact — admin only. `params` accepts { page, limit }.
export const getContactMessages = async (params = {}) =>
  (await api.get('/contact', { params })).data;
