// Vivoria — dark royal blue × orchid magenta palette
// bg: deep navy · primary: orchid · accents: cyan, gold, emerald
export const C = {
  // Backgrounds
  bg:      '#060d24',   // deepest royal blue-black
  s1:      '#0d1638',   // surface 1
  s2:      '#131f4e',   // surface 2
  s3:      '#1a2860',   // surface 3 / dim separator
  // Borders
  border:  '#0d1638',
  border2: '#1a2860',
  // Brand accents
  orchid:  '#d946a8',   // PRIMARY — magenta orchid
  gold:    '#c9a840',   // DNA gold
  cyan:    '#22d3ee',   // glow ring cyan
  pink:    '#f472b6',   // sparkle pink
  amber:   '#f59e0b',   // warmth / alarms
  rose:    '#f43f5e',   // critical / danger
  purple:  '#9333ea',   // deep violet
  blue:    '#4a80e8',   // royal blue accent
  emerald: '#10b981',   // health green
  orange:  '#f97316',   // warm orange
  teal:    '#14b8a6',   // teal accent
  // Text
  text:    '#eef0ff',   // blue-tinted white
  muted:   '#7882b8',   // muted periwinkle
  dim:     '#2e3a72',   // dim blue-violet
};

export const DOT = {
  orchid:  C.orchid,
  gold:    C.gold,
  cyan:    C.cyan,
  pink:    C.pink,
  amber:   C.amber,
  rose:    C.rose,
  purple:  C.purple,
  emerald: C.emerald,
  orange:  C.orange,
};

export const TAG_BG = {
  orchid:  'rgba(217,70,168,0.12)',
  gold:    'rgba(201,168,64,0.12)',
  cyan:    'rgba(34,211,238,0.12)',
  pink:    'rgba(244,114,182,0.12)',
  amber:   'rgba(245,158,11,0.12)',
  rose:    'rgba(244,63,94,0.12)',
  purple:  'rgba(147,51,234,0.12)',
  emerald: 'rgba(16,185,129,0.12)',
  orange:  'rgba(249,115,22,0.12)',
};

export const GRAD = {
  orchid:  ['#d946a8', '#9333ea'],   // PRIMARY brand gradient
  gold:    ['#c9a840', '#a87e28'],   // DNA gold
  cyan:    ['#22d3ee', '#0891b2'],   // glow ring
  emerald: ['#10b981', '#059669'],   // health green
  orange:  ['#f97316', '#ea580c'],   // warm orange
  amber:   ['#f59e0b', '#d97706'],   // amber warm
  blue:    ['#4a80e8', '#2563eb'],   // royal blue
  rose:    ['#f43f5e', '#e11d48'],   // danger red
  dark:    ['#0d1638', '#060d24'],   // dark bg gradient
  card:    ['#131f4e', '#0d1638'],   // card surface gradient
  royal:   ['#1244b8', '#0a2980'],   // icon royal blue
  hero:    ['#1a1060', '#060d24'],   // hero section deep purple→navy
  vivoria: ['#d946a8', '#4a80e8'],   // brand diagonal
};
