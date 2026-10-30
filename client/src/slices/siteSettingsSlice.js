import { createSlice } from '@reduxjs/toolkit';

// Storefront switches the admin turns on or off. There is no settings endpoint
// on the API yet, so the values are kept in this browser's localStorage and the
// slice is the one place that reads and writes them.
const STORAGE_KEY = 'rynova:site-settings';

// Anything missing or unreadable falls back to "off", which is the default the
// admin panel starts from.
const readSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

    return { vendorSystemEnabled: stored?.vendorSystemEnabled === true };
  } catch {
    return { vendorSystemEnabled: false };
  }
};

const persist = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ vendorSystemEnabled: state.vendorSystemEnabled }),
    );
  } catch {
    // Private mode: the switch lasts for this tab only.
  }
};

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState: readSettings(),
  reducers: {
    setVendorSystemEnabled: (state, action) => {
      state.vendorSystemEnabled = Boolean(action.payload);
      persist(state);
    },
  },
});

export const { setVendorSystemEnabled } = siteSettingsSlice.actions;

// Read by the storefront to decide whether vendor content is rendered at all.
export const selectVendorSystemEnabled = (state) =>
  state.siteSettings.vendorSystemEnabled === true;

export default siteSettingsSlice.reducer;
