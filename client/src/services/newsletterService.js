import api from './api';

export const subscribeToNewsletter = async (email) =>
  (await api.post('/newsletter/subscribe', { email })).data;

export const getNewsletterSubscribers = async () =>
  (await api.get('/newsletter/subscribers')).data;
