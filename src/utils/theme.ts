export const colors = {
  bg: '#000000',
  card: '#1C1C1E',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  sectionHeader: '#8B8578',
  accent: '#2DD4BF',
  accentDark: '#0D9488',
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  white: '#FFFFFF',
  tabBar: '#111111',
  tabActive: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
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
  music: '#22C55E',
  video: '#EF4444',
  productivity: '#3B82F6',
  security: '#6B7280',
  fitness: '#22C55E',
  shopping: '#F59E0B',
  news: '#8B5CF6',
  finance: '#10B981',
  developer: '#3B82F6',
  gaming: '#EF4444',
  cloud: '#3B82F6',
  dating: '#EC4899',
  education: '#F59E0B',
  software: '#8B5CF6',
  other: '#6B7280',
};

export function getCategoryColor(category?: string): string {
  return categoryColors[category || 'other'] || '#6B7280';
}

export function getUrgencyColor(daysLeft: number): string {
  if (daysLeft < 2) return colors.red;
  if (daysLeft < 7) return colors.amber;
  return colors.green;
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    default: return '$';
  }
}
