// Colors - Cross-platform friendly design system
export const COLORS = {
  // Primary brand colors
  primary: '#2563EB',        // Modern blue
  primaryLight: '#3B82F6',   // Lighter blue
  primaryDark: '#1D4ED8',    // Darker blue
  
  // Secondary colors
  secondary: '#7C3AED',      // Purple
  secondaryLight: '#8B5CF6', // Light purple
  secondaryDark: '#6D28D9',  // Dark purple
  
  // Accent colors
  accent: '#F59E0B',         // Amber
  accentLight: '#FBBF24',    // Light amber
  accentDark: '#D97706',     // Dark amber
  
  // Rating colors
  ratingGold: '#FFD700',     // Gold for 5 stars
  ratingSilver: '#C0C0C0',   // Silver for 4 stars
  ratingBronze: '#CD7F32',   // Bronze for 3 stars
  ratingOrange: '#FF9800',   // Orange for 2 stars
  ratingRed: '#F44336',       // Red for 1 star
  
  // Status colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Text colors
  text: '#1F2937',           // Dark gray
  textSecondary: '#6B7280',  // Medium gray
  textLight: '#9CA3AF',      // Light gray
  textPlaceholder: '#C4C4C4', // Very light gray for placeholders
  textInverse: '#FFFFFF',    // White text
  
  // Background colors
  background: '#F9FAFB',     // Very light gray
  backgroundSecondary: '#FFFFFF', // White
  backgroundTertiary: '#F3F4F6',  // Light gray
  
  // Border colors
  border: '#E5E7EB',         // Light border
  borderLight: '#F3F4F6',    // Very light border
  borderDark: '#D1D5DB',     // Darker border
  
  // Surface colors
  surface: '#FFFFFF',        // Card background
  surfaceElevated: '#FFFFFF', // Elevated surface
  surfaceOverlay: 'rgba(0, 0, 0, 0.5)', // Overlay background
  
  // Modern UI colors
  modernBlue: '#3B82F6',     // Modern blue
  modernPurple: '#8B5CF6',   // Modern purple
  modernGreen: '#10B981',    // Modern green
  modernOrange: '#F59E0B',   // Modern orange
  modernRed: '#EF4444',      // Modern red
  
  // Gradient colors
  gradientStart: '#667eea',   // Gradient start
  gradientEnd: '#764ba2',     // Gradient end
};

// Font sizes - Cross-platform optimized
export const SIZES = {
  font: {
    xs: 12,      // Small text
    sm: 14,      // Body small
    md: 16,      // Body regular
    lg: 18,      // Body large
    xl: 20,      // Heading small
    xxl: 24,     // Heading medium
    xxxl: 28,    // Heading large
    xxxxl: 32,   // Heading extra large
  },
  spacing: {
    xs: 4,       // 4px
    sm: 8,       // 8px
    md: 16,      // 16px
    lg: 24,      // 24px
    xl: 32,      // 32px
    xxl: 40,     // 40px
    xxxl: 48,    // 48px
    xxxxl: 64,   // 64px
  },
  borderRadius: {
    none: 0,     // No radius
    sm: 4,       // Small radius
    md: 8,       // Medium radius
    lg: 12,      // Large radius
    xl: 16,      // Extra large radius
    xxl: 20,     // 2xl radius
    full: 9999,  // Fully rounded
  },
  // Component sizes
  button: {
    sm: 32,      // Small button height
    md: 44,      // Medium button height
    lg: 52,      // Large button height
  },
  input: {
    sm: 40,      // Small input height
    md: 48,      // Medium input height
    lg: 56,      // Large input height
  },
  // Icon sizes
  icon: {
    xs: 16,      // Extra small icon
    sm: 20,      // Small icon
    md: 24,      // Medium icon
    lg: 28,      // Large icon
    xl: 32,      // Extra large icon
  },
};

// Common styles - Cross-platform optimized
export const COMMON_STYLES = {
  // Shadow styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowMd: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardElevated: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Button styles
  button: {
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: SIZES.button.md,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: SIZES.button.md,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: SIZES.button.md,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: SIZES.input.md,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  
  // Text styles
  textPrimary: {
    color: COLORS.text,
    fontSize: SIZES.font.md,
  },
  textSecondary: {
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  textHeading: {
    color: COLORS.text,
    fontSize: SIZES.font.xl,
    fontWeight: '600',
  },
  textButton: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
  },
  textButtonSecondary: {
    color: COLORS.primary,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
};
