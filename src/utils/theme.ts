export const colors = {
  bg: '#0A0A0A',
  card: '#161618',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  sectionHeader: '#8B8578',
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  success: '#10B981',
  red: '#EF4444',
  amber: '#FBBF24',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  white: '#FFFFFF',
  tabBar: '#0D0D0D',
  tabActive: 'rgba(245,158,11,0.12)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
  xxl: 48,
};

export const categoryColors: Record<string, string> = {
  streaming: '#EF4444',
  music: '#10B981',
  video: '#EF4444',
  productivity: '#3B82F6',
  security: '#6B7280',
  fitness: '#10B981',
  shopping: '#F59E0B',
  news: '#8B5CF6',
  finance: '#F59E0B',
  developer: '#3B82F6',
  gaming: '#EF4444',
  cloud: '#3B82F6',
  dating: '#EC4899',
  education: '#FBBF24',
  software: '#8B5CF6',
  entertainment: '#F59E0B',
  lifestyle: '#EC4899',
  other: '#6B7280',
};

export function getCategoryColor(category?: string): string {
  return categoryColors[category || 'other'] || '#6B7280';
}

export function getUrgencyColor(daysLeft: number): string {
  if (daysLeft <= 0) return colors.red;
  if (daysLeft <= 3) return colors.red;
  if (daysLeft <= 6) return colors.amber;
  return colors.green;
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    default: return '$';
  }
}
