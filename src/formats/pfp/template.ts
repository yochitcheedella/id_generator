// Format A — PFP Frame Template Constants
// Canvas: 1080 × 1080 px

export const PFP_CANVAS_W = 1080;
export const PFP_CANVAS_H = 1080;

// Photo region: circular, centered
export const PFP_PHOTO_CX = 540;   // center x
export const PFP_PHOTO_CY = 470;   // center y (slightly above center)
export const PFP_PHOTO_RADIUS = 330; // radius

// Colors
export const COLORS = {
  bgDark:     '#04101F',
  bgMid:      '#061524',
  navy:       '#0A1E38',
  coral:      '#FF4F3B',
  coralLight: '#FF7A6A',
  gold:       '#FFB340',
  goldLight:  '#FFD080',
  teal:       '#00C9B1',
  white:      '#FFFFFF',
  offWhite:   '#EEF3FF',
  dim:        'rgba(255,255,255,0.12)',
} as const;

// Typography on canvas
export const FONT_FAMILY = 'Inter, system-ui, -apple-system, sans-serif';

// Branding text positions
export const BRAND_TEXT_Y = 920;
export const BRAND_SUBTITLE_Y = 960;
export const BRAND_TAGLINE_Y = 993;
