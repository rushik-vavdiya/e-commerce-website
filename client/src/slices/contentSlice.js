import { createSlice } from '@reduxjs/toolkit';

import sectionVisibility from '../data/sectionVisibility.json';
import siteContent from '../data/siteContent.json';

// The site's wording, images and section switches, held in the store.
//
// The two JSON files are the starting state: they are imported once here, so a
// component reads the same values whether they came from the file or from a later
// `setContentBranch` (an admin save, or an API payload) without importing either
// file itself.
const contentSlice = createSlice({
  name: 'content',
  initialState: {
    content: siteContent,
    visibility: sectionVisibility,
  },
  reducers: {
    // Replace one branch of the tree: setContentBranch({ path: 'home.hero',
    // value: {...} }) leaves every other branch alone. No path replaces the whole
    // tree, which is what a full content fetch would send.
    setContentBranch: (state, action) => {
      const { path, value } = action.payload ?? {};

      if (!path) {
        state.content = value ?? state.content;
        return;
      }

      const keys = String(path).split('.');
      let branch = state.content;

      for (const key of keys.slice(0, -1)) {
        if (!branch[key] || typeof branch[key] !== 'object') branch[key] = {};
        branch = branch[key];
      }

      branch[keys[keys.length - 1]] = value;
    },

    // Switch one section on or off, e.g. { path: 'home.promo', value: false }.
    setVisibilityFlag: (state, action) => {
      const { path, value } = action.payload ?? {};
      if (!path) return;

      const keys = String(path).split('.');
      let branch = state.visibility;

      for (const key of keys.slice(0, -1)) {
        if (!branch[key] || typeof branch[key] !== 'object') branch[key] = {};
        branch = branch[key];
      }

      branch[keys[keys.length - 1]] = Boolean(value);
    },
  },
});

export const { setContentBranch, setVisibilityFlag } = contentSlice.actions;
export default contentSlice.reducer;
