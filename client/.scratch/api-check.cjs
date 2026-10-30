'use strict';
(async () => {
  const mongoose = (await import('mongoose')).default;
  const env = (await import('file:///C:/Users/rushi/Desktop/R/server/src/config/env.js')).default;
  const User = (await import('file:///C:/Users/rushi/Desktop/R/server/src/modules/user/user.model.js')).default;
  const { generateToken } = await import('file:///C:/Users/rushi/Desktop/R/server/src/utils/jwt.js');

  await mongoose.connect(env.mongoUri);
  const admin = await User.findOne({ role: 'admin' });
  await mongoose.disconnect();

  const token = generateToken(
    { id: admin._id, role: admin.role, tokenVersion: admin.tokenVersion || 0 },
    env.jwt.accessSecret,
    '10m',
  );

  const API = 'http://127.0.0.1:5000/api';
  const call = async (method, path, body) => {
    const res = await fetch(API + path, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };

  const before = await call('GET', '/home-sections/admin?page=about');
  console.log('about rows before:', before.status, before.json.data.length);

  const created = await call('POST', '/home-sections', {
    page: 'about',
    sectionName: 'delivery-note',
    heading: 'Made in small batches',
    content: 'Each piece is cut and finished in our studio.',
    order: 99,
  });
  console.log('create:', created.status, created.json.data?.sectionName ?? created.json.message);
  const id = created.json.data?._id;

  const listed = await call('GET', '/home-sections?page=about');
  console.log('public about includes new band:', listed.json.data.some((row) => row.sectionName === 'delivery-note'));

  const moved = await call('PUT', `/home-sections/${id}`, { order: 0 });
  console.log('reorder to first:', moved.status, moved.json.data?.order);

  const hidden = await call('PUT', `/home-sections/${id}`, { isActive: false });
  console.log('hide:', hidden.status, hidden.json.data?.isActive);
  const afterHide = await call('GET', '/home-sections?page=about');
  console.log('hidden band leaves the public list:', !afterHide.json.data.some((row) => row.sectionName === 'delivery-note'));

  const removed = await call('DELETE', `/home-sections/${id}`);
  console.log('delete:', removed.status);
  const after = await call('GET', '/home-sections/admin?page=about');
  console.log('about rows after:', after.json.data.length);
})();
