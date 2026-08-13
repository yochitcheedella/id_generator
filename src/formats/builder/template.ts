// Format B — Builder ID Card Template Constants
// Canvas: 1200 × 1500 px

export const CARD_CANVAS_W = 1200;
export const CARD_CANVAS_H = 1500;

// Photo region
export const PHOTO_X = 80;
export const PHOTO_Y = 180;
export const PHOTO_W = 380;
export const PHOTO_H = 380;
export const PHOTO_RADIUS = 20; // rounded corners

// Text layout
export const TEXT_X = 530;          // left edge of text column
export const TEXT_MAX_W = 580;      // max text width

// Text vertical positions
export const BUILDER_LABEL_Y = 230;
export const NAME_Y = 330;
export const ROLE_Y = 440;
export const SECONDARY_Y = 510;

// Footer
export const FOOTER_Y = CARD_CANVAS_H - 180;

export const COLORS = {
  bgDark:     '#04101F',
  bgCard:     '#071728',
  navy:       '#0A1E38',
  coral:      '#FF4F3B',
  coralLight: '#FF7A6A',
  gold:       '#FFB340',
  goldLight:  '#FFD080',
  teal:       '#00C9B1',
  tealDark:   '#007A6A',
  white:      '#FFFFFF',
  offWhite:   '#EEF3FF',
  dim:        'rgba(255,255,255,0.08)',
  dimMed:     'rgba(255,255,255,0.18)',
} as const;

export const FONT_FAMILY = 'Inter, system-ui, -apple-system, sans-serif';
