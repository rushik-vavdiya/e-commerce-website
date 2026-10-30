// Helpers for the department lists the storefront shows. Only live rows from
// GET /api/categories are used, so an empty catalog simply shows nothing.
export const isActiveTopLevel = (category) =>
  (category?.level === 0 || category?.level === '0') &&
  category?.status === 'active';

// The top-level departments, used by the shop page's department filter.
export const topLevelCategories = (categories = []) =>
  categories.filter(isActiveTopLevel);
