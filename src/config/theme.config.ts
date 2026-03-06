/**
 * Centralized Theme Configuration
 * YouTube Dark Mode inspired with educational app colors
 */

export const COLORS = {
  // Background colors - YouTube Dark Mode inspired
  background: {
    primary: '#0f0f0f',    // Main background (YouTube dark gray)
    secondary: '#1f1f1f',  // Secondary background (slightly lighter)
    tertiary: '#272727',   // Tertiary background (cards, elevated)
    elevated: '#3f3f3f',   // Elevated surfaces
  },
  // Text colors
  text: {
    primary: '#ffffff',    // Primary text (white)
    secondary: '#aaaaaa',  // Secondary text (lighter gray)
    tertiary: '#717171',   // Tertiary text (medium gray)
    disabled: '#525252',   // Disabled text
  },
  // Border colors
  border: {
    primary: '#3f3f3f',    // Primary borders
    secondary: '#272727',  // Secondary borders
    subtle: '#1f1f1f',     // Subtle borders
  },
  // Accent colors - Educational theme
  accent: {
    primary: '#8b5cf6',    // Purple - primary actions (study, learn)
    secondary: '#3b82f6',  // Blue - secondary actions
    success: '#10b981',    // Green - success/completion
    error: '#ef4444',      // Red - errors
    warning: '#f59e0b',    // Orange - warnings
    info: '#06b6d4',       // Cyan - info
  },
  // Interactive states
  interactive: {
    hover: '#525252',      // Hover state
    active: '#717171',     // Active/pressed state
    disabled: '#272727',   // Disabled state
  },
  // Subject-specific colors
  physics: {
    DEFAULT: '#3b82f6',    // Blue
    light: '#60a5fa',
  },
  chemistry: {
    DEFAULT: '#10b981',    // Green
    light: '#34d399',
  },
  biology: {
    DEFAULT: '#ec4899',    // Pink
    light: '#f472b6',
  },
  // Overlay colors (with opacity)
  overlay: {
    dark: 'rgba(0, 0, 0, 0.8)',
    medium: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

// Subject color mapping
export const SUBJECT_COLORS = {
  Physics: COLORS.physics,
  Chemistry: COLORS.chemistry,
  Biology: COLORS.biology,
} as const;

// Status color mapping
export const STATUS_COLORS = {
  completed: COLORS.accent.success,
  unlocked: COLORS.accent.primary,
  locked: COLORS.text.disabled,
  in_progress: COLORS.accent.warning,
  active: COLORS.accent.primary,
  paused: COLORS.accent.warning,
  archived: COLORS.text.disabled,
} as const;

// Task type colors
export const TASK_TYPE_COLORS = {
  study: COLORS.accent.primary,
  practice: COLORS.accent.success,
  review: COLORS.accent.info,
  quiz: COLORS.accent.warning,
} as const;

// Difficulty colors
export const DIFFICULTY_COLORS = {
  easy: COLORS.accent.success,
  medium: COLORS.accent.warning,
  hard: COLORS.accent.error,
} as const;

// Common Tailwind class patterns for YouTube-inspired dark mode
export const THEME_CLASSES = {
  // Screens
  screen: 'flex-1 bg-background-primary',
  
  // Cards
  card: 'bg-background-secondary rounded-xl p-4 border border-border-subtle',
  cardLarge: 'bg-background-secondary rounded-2xl p-6 border border-border-subtle',
  cardElevated: 'bg-background-tertiary rounded-xl p-4 border border-border-secondary',
  cardGradient: 'bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl p-6',
  
  // Buttons
  buttonPrimary: 'bg-accent-primary rounded-xl p-4 items-center active:bg-accent-primary/80',
  buttonSecondary: 'bg-accent-secondary rounded-xl p-4 items-center active:bg-accent-secondary/80',
  buttonSuccess: 'bg-accent-success rounded-xl p-4 items-center active:bg-accent-success/80',
  buttonOutline: 'bg-transparent border border-border-primary rounded-xl p-4 items-center active:bg-interactive-hover',
  buttonGhost: 'bg-transparent rounded-xl p-4 items-center active:bg-interactive-hover',
  
  // Text
  heading1: 'text-2xl font-bold text-text-primary',
  heading2: 'text-xl font-bold text-text-primary',
  heading3: 'text-lg font-semibold text-text-primary',
  body: 'text-base text-text-secondary',
  bodySmall: 'text-sm text-text-secondary',
  caption: 'text-xs text-text-tertiary',
  muted: 'text-text-disabled',
  
  // Status badges
  badgeSuccess: 'bg-accent-success/20 px-3 py-1 rounded-full border border-accent-success/30',
  badgeWarning: 'bg-accent-warning/20 px-3 py-1 rounded-full border border-accent-warning/30',
  badgeError: 'bg-accent-error/20 px-3 py-1 rounded-full border border-accent-error/30',
  badgeInfo: 'bg-accent-info/20 px-3 py-1 rounded-full border border-accent-info/30',
  badgePrimary: 'bg-accent-primary/20 px-3 py-1 rounded-full border border-accent-primary/30',
  
  // Progress bars
  progressBar: 'h-2 bg-background-tertiary rounded-full overflow-hidden',
  progressBarLarge: 'h-3 bg-background-tertiary rounded-full overflow-hidden',
  progressFill: 'h-full bg-accent-primary rounded-full',
  
  // Icons containers
  iconCircle: 'w-10 h-10 rounded-full items-center justify-center',
  iconCircleLarge: 'w-12 h-12 rounded-full items-center justify-center',
  
  // Spacing
  section: 'px-4 py-6',
  sectionLarge: 'px-6 py-8',
  gap: 'gap-3',
  gapLarge: 'gap-4',
  
  // Dividers
  divider: 'border-b border-border-subtle',
  dividerStrong: 'border-b border-border-primary',
} as const;

// Shadow configurations (for React Native)
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  accent: {
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Common spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius values
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Helper function to get subject color
export const getSubjectColor = (subject: 'Physics' | 'Chemistry' | 'Biology') => {
  return SUBJECT_COLORS[subject];
};

// Helper function to get status color
export const getStatusColor = (status: keyof typeof STATUS_COLORS) => {
  return STATUS_COLORS[status] || COLORS.text.disabled;
};

// Helper function to get task type color
export const getTaskTypeColor = (taskType: keyof typeof TASK_TYPE_COLORS) => {
  return TASK_TYPE_COLORS[taskType] || COLORS.text.disabled;
};

// Helper function to get difficulty color
export const getDifficultyColor = (difficulty: keyof typeof DIFFICULTY_COLORS) => {
  return DIFFICULTY_COLORS[difficulty] || COLORS.text.disabled;
};

// Helper function to get score-based color
export const getScoreColor = (score: number) => {
  if (score >= 80) return COLORS.accent.success;
  if (score >= 60) return COLORS.accent.primary;
  if (score >= 40) return COLORS.accent.warning;
  return COLORS.accent.error;
};

// Gradient combinations for dark mode
export const GRADIENTS = {
  primary: 'from-accent-primary to-accent-secondary',
  success: 'from-accent-success to-chemistry',
  physics: 'from-physics to-accent-secondary',
  chemistry: 'from-chemistry to-accent-success',
  biology: 'from-biology to-accent-primary',
  subtle: 'from-background-secondary to-background-tertiary',
} as const;
