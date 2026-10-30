import api from './api';

export const getMe = async () => (await api.get('/users/me')).data;
// PATCH /users/me — the API accepts firstName, lastName, gender, birthDate and
// phone. Email is not editable here.
export const updateMe = async (profile) => (await api.patch('/users/me', profile)).data;
export const getProfilePicture = async () => (await api.get('/users/me/profile-picture')).data;
export const updateProfilePicture = async (image) => {
  const formData = new FormData();
  formData.append('image', image);
  return (await api.put('/users/me/profile-picture', formData)).data;
};
export const deleteProfilePicture = async () => (await api.delete('/users/me/profile-picture')).data;
export const deleteAccount = async () => (await api.delete('/users/me')).data;
