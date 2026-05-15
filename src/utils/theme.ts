export const colors = {
  bg: '#0F172A',
  card: '#1E293B',
  cardBorder: 'rgba(255,255,255,0.1)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#10B981',
  accentDark: '#059669',
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#10B981',
  white: '#FFFFFF',
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

export const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: 16,
  padding: 16,
  borderWidth: 0.5,
  borderColor: colors.cardBorder,
};

export const bodyText = {
  lineHeight: 24,
};

export const buttonBase = {
  minHeight: 48,
  borderRadius: 12,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

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
