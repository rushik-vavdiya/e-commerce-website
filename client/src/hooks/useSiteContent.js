import { useSelector } from 'react-redux';

import { readPath } from '../data/content';

// Redux-backed readers for the site content. They mirror the helpers in
// src/data/content.js:
//
//   useContent('home.hero', {})       getContent('home.hero', {})
//   useContentList('home.hero.buttons')   listContent('home.hero.buttons')
//   useVisible('home.promo')          isVisible('home.promo')
//
// The difference is where the value comes from: the store, so a component
// re-renders when the content changes instead of only when the bundle reloads.
export const useContent = (path, fallback = '') => {
  const tree = useSelector((state) => state.content.content);
  const value = readPath(tree, path);

  return value === undefined ? fallback : value;
};

export const useContentList = (path) => {
  const value = useContent(path, []);

  return Array.isArray(value) ? value : [];
};

// Anything missing from sectionVisibility is visible, so a new section shows up
// by default — same rule as isVisible().
export const useVisible = (path, fallback = true) => {
  const tree = useSelector((state) => state.content.visibility);
  const value = readPath(tree, path);

  return typeof value === 'boolean' ? value : fallback;
};
