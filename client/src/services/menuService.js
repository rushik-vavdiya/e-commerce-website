import api from './api';

// The Collections mega menu's two requests: the departments with their newest
// products, and the editable featured card. Both are cached server-side for five
// minutes, so opening the menu repeatedly costs one request per session.
export const getMenuCollections = async () => (await api.get('/menu/collections')).data;

export const getMenuFeatured = async () => (await api.get('/menu/featured')).data;

export const updateMenuFeatured = async (changes) =>
  (await api.put('/menu/featured', changes)).data;
