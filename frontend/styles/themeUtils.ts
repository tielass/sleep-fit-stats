/**
 * Utility functions for working with app theme colors
 */

// Get CSS variable value
export const getCssVariable = (variableName: string): string => {
  if (typeof window === 'undefined') return '';

  // Remove 'var(' and ')' if they are included
  const cleanVariableName = variableName.replace(/var\(|\)/g, '');

  // Ensure variable name starts with --
  const cssVarName = cleanVariableName.startsWith('--')
    ? cleanVariableName
    : `--${cleanVariableName}`;

  return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
};

// Set CSS variable value
export const setCssVariable = (variableName: string, value: string): void => {
  if (typeof window === 'undefined') return;

  // Remove 'var(' and ')' if they are included
  const cleanVariableName = variableName.replace(/var\(|\)/g, '');

  // Ensure variable name starts with --
  const cssVarName = cleanVariableName.startsWith('--')
    ? cleanVariableName
    : `--${cleanVariableName}`;

  document.documentElement.style.setProperty(cssVarName, value);
};

// Theme color constants
export const THEME_COLORS = {
  // Core colors
  NIGHT_BLUE: 'var(--night-blue)',
  ACTIVE_GREEN: 'var(--active-green)',
  SLATE_BLUE: 'var(--slate-blue)',
  DEEP_SLATE: 'var(--deep-slate)',
  ALERT_RED: 'var(--alert-red)',
  FOREST_GREEN: 'var(--forest-green)',
  LIGHT_TEXT: 'var(--light-text)',
  MUTED_TEXT: 'var(--muted-text)',

  // Contextual colors
  SLEEP_PRIMARY: 'var(--sleep-primary)',
  SLEEP_SECONDARY: 'var(--sleep-secondary)',
  FITNESS_PRIMARY: 'var(--fitness-primary)',
  FITNESS_ACCENT: 'var(--fitness-accent)',
  BACKGROUND_PRIMARY: 'var(--background-primary)',
  BACKGROUND_SECONDARY: 'var(--background-secondary)',
  TEXT_PRIMARY: 'var(--text-primary)',
  TEXT_SECONDARY: 'var(--text-secondary)',
};

// Get theme color for different metrics
export const getMetricColor = (metricType: string, value: number) => {
  switch (metricType) {
    case 'sleepQuality':
      // Green for good sleep quality, red for poor
      if (value >= 80) return THEME_COLORS.FOREST_GREEN;
      if (value <= 40) return THEME_COLORS.ALERT_RED;
      return THEME_COLORS.SLATE_BLUE;

    case 'heartRate':
      // Red for high heart rate, green for normal
      if (value > 100) return THEME_COLORS.ALERT_RED;
      if (value < 60) return THEME_COLORS.SLATE_BLUE;
      return THEME_COLORS.FOREST_GREEN;

    case 'stepGoal':
      // Green if reached goal, red if far from goal
      if (value >= 100) return THEME_COLORS.FOREST_GREEN;
      if (value <= 50) return THEME_COLORS.ALERT_RED;
      return THEME_COLORS.ACTIVE_GREEN;

    default:
      return THEME_COLORS.SLATE_BLUE;
  }
};
