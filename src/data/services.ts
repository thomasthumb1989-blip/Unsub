import servicesData from './services.json';

export type ServiceInfo = {
  id: string;
  name: string;
  icon: string;
  trialDays: number;
  chargeAmount: number;
  cancelUrl: string;
  category: string;
};

const categoryIcons: Record<string, string> = {
  streaming: '🎬',
  productivity: '💻',
  security: '🔒',
  fitness: '💪',
  shopping: '🛒',
  news: '📰',
  finance: '💳',
  developer: '👨‍💻',
  gaming: '🎮',
  cloud: '☁️',
  dating: '💕',
  education: '🎓',
  other: '📱',
};

export const services: ServiceInfo[] = servicesData.map((s) => ({
  id: s.id,
  name: s.name,
  icon: categoryIcons[s.category] || '📱',
  trialDays: s.typical_trial_days,
  chargeAmount: s.charge_gbp,
  cancelUrl: s.cancel_url,
  category: s.category,
}));

export function findService(name: string): ServiceInfo | undefined {
  return services.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
}

export function searchServices(query: string): ServiceInfo[] {
  if (!query) return services.slice(0, 30);
  const q = query.toLowerCase();
  return services.filter((s) => s.name.toLowerCase().includes(q));
}

export function getServicesByCategory(category: string): ServiceInfo[] {
  return services.filter((s) => s.category === category);
}

export const categories = [
  'streaming', 'productivity', 'security', 'fitness', 'shopping',
  'news', 'finance', 'developer', 'gaming', 'cloud', 'dating',
  'education', 'other',
];
