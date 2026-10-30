// The hex a colour swatch is painted with.
//
// Products name their colours in words ("Teal blue", "Taupe brown") and nothing
// on the record carries a hex, so a swatch has to be resolved from the name. The
// table below is matched by keyword, longest first, so "taupe brown" paints brown
// while "taupe" on its own paints taupe. A name no keyword covers returns null
// and the caller draws a neutral swatch — the colour is then still named in text,
// rather than a wrong shade being invented for it.
const SWATCHES = {
  // Named catalogue colours, most specific first where they share a word.
  'antique gold': '#B08D57',
  'taupe brown': '#8A7259',
  'dusty rose': '#C28E8E',
  'blush pink': '#E7A6B0',
  'rose gold': '#B76E79',
  'off white': '#F6F2E9',
  'sky blue': '#8FB8DE',
  charcoal: '#3B3B3F',
  crimson: '#A3243B',
  ivory: '#F3EBDD',
  maroon: '#6E1F2A',
  burgundy: '#5C1F2B',
  wine: '#5B1B2A',
  navy: '#1F2A4A',
  plum: '#5B2A4E',
  violet: '#6C4B8E',
  purple: '#6A3B93',
  lavender: '#B9A7CF',
  lilac: '#C5B3D6',
  magenta: '#A62B7B',
  fuchsia: '#C2318A',
  mustard: '#C9A227',
  turmeric: '#D9A21B',
  ochre: '#B07D1F',
  yellow: '#E3C13B',
  emerald: '#1F6E4A',
  olive: '#5E6B3A',
  sage: '#9CA98A',
  mint: '#AFD3BE',
  teal: '#1F7A7A',
  turquoise: '#3FB6B0',
  khaki: '#A99C74',
  taupe: '#A89A8C',
  beige: '#E4D6C3',
  cream: '#F4EEDC',
  chocolate: '#4A2F26',
  coffee: '#6A4B36',
  copper: '#A9633B',
  rust: '#9B4A26',
  coral: '#E07A63',
  peach: '#F0BFA3',
  orange: '#D2701E',
  rose: '#C97C86',
  blush: '#EBB2B8',
  pink: '#DFA0AE',
  silver: '#C0C0C0',
  gold: '#C6A14A',
  brown: '#6B4B34',
  tan: '#C8A277',
  grey: '#8A8D8F',
  gray: '#8A8D8F',
  green: '#4E7A45',
  blue: '#2F5D9E',
  red: '#B32B33',
  black: '#232323',
  white: '#FAFAF7',
};

// Longest keyword first, so a more specific name always beats a generic word
// hiding inside it.
const KEYWORDS = Object.keys(SWATCHES).sort((a, b) => b.length - a.length);

export const colourSwatch = (name) => {
  const text = String(name ?? '')
    .trim()
    .toLowerCase();

  if (!text) return null;

  const keyword = KEYWORDS.find((entry) => text.includes(entry));
  return keyword ? SWATCHES[keyword] : null;
};
