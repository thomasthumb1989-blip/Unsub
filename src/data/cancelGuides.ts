export interface CancelGuide {
  steps: string[];
  url?: string;
  note?: string;
}

const guides: Record<string, CancelGuide> = {
  netflix: {
    steps: [
      'Open Netflix app or go to netflix.com',
      'Tap your profile icon > Account',
      'Tap "Cancel Membership"',
      'Confirm cancellation',
    ],
    url: 'https://www.netflix.com/cancelplan',
    note: 'You can still watch until your billing period ends.',
  },
  spotify: {
    steps: [
      'Go to spotify.com/account (can\'t cancel in app)',
      'Click "Your plan"',
      'Click "Cancel Premium"',
      'Follow the prompts to confirm',
    ],
    url: 'https://www.spotify.com/account/subscription/',
    note: 'Must cancel via website, not the app.',
  },
  'apple music': {
    steps: [
      'Open Settings on your iPhone',
      'Tap your name > Subscriptions',
      'Tap Apple Music',
      'Tap "Cancel Subscription"',
    ],
    note: 'Also works for Apple TV+, Apple One, iCloud+.',
  },
  'apple tv': {
    steps: [
      'Open Settings on your iPhone',
      'Tap your name > Subscriptions',
      'Tap Apple TV+',
      'Tap "Cancel Subscription"',
    ],
  },
  'apple one': {
    steps: [
      'Open Settings on your iPhone',
      'Tap your name > Subscriptions',
      'Tap Apple One',
      'Tap "Cancel Subscription"',
    ],
  },
  icloud: {
    steps: [
      'Open Settings > Tap your name',
      'Tap iCloud > Manage Storage',
      'Tap "Change Storage Plan"',
      'Select "Downgrade" to free tier',
    ],
  },
  'disney+': {
    steps: [
      'Open Disney+ app',
      'Tap your profile > Account',
      'Tap your subscription',
      'Tap "Cancel Subscription"',
    ],
    url: 'https://www.disneyplus.com/account/subscription',
  },
  'amazon prime': {
    steps: [
      'Go to amazon.co.uk/prime',
      'Click "Manage Membership"',
      'Click "End Membership"',
      'Confirm on the next screens',
    ],
    url: 'https://www.amazon.co.uk/mc/pipelines',
    note: 'You may get offered a discount to stay.',
  },
  hulu: {
    steps: [
      'Go to hulu.com/account',
      'Click "Cancel"',
      'Select a reason and confirm',
    ],
    url: 'https://secure.hulu.com/account',
  },
  'youtube premium': {
    steps: [
      'Open YouTube app > Tap profile',
      'Tap "Paid memberships"',
      'Tap YouTube Premium > Continue to cancel',
      'Confirm cancellation',
    ],
    url: 'https://www.youtube.com/paid_memberships',
  },
  'xbox game pass': {
    steps: [
      'Go to account.microsoft.com/services',
      'Find Xbox Game Pass',
      'Click "Manage" > "Cancel"',
      'Follow the prompts',
    ],
    url: 'https://account.microsoft.com/services',
  },
  'playstation plus': {
    steps: [
      'Go to Settings > Account Management',
      'Select "Subscription" > PS Plus',
      'Select "Turn Off Auto-Renew"',
      'Confirm',
    ],
  },
  chatgpt: {
    steps: [
      'Go to chat.openai.com',
      'Click your profile > My Plan',
      'Click "Manage my subscription"',
      'Click "Cancel plan"',
    ],
    url: 'https://chat.openai.com/',
  },
  'github copilot': {
    steps: [
      'Go to github.com/settings/billing',
      'Under Copilot, click "Cancel"',
      'Confirm cancellation',
    ],
    url: 'https://github.com/settings/copilot',
  },
  adobe: {
    steps: [
      'Go to account.adobe.com/plans',
      'Click "Manage plan"',
      'Click "Cancel your plan"',
      'Follow cancellation flow (may have early termination fee)',
    ],
    url: 'https://account.adobe.com/plans',
    note: 'Annual plans may have an early cancellation fee.',
  },
  nordvpn: {
    steps: [
      'Log in at my.nordaccount.com',
      'Go to "Billing" section',
      'Click "Cancel automatic payments"',
      'Confirm',
    ],
    url: 'https://my.nordaccount.com/billing/',
  },
  'express vpn': {
    steps: [
      'Log in at expressvpn.com/subscriptions',
      'Click "Manage Settings"',
      'Toggle off auto-renewal',
      'Confirm cancellation',
    ],
  },
  duolingo: {
    steps: [
      'Open Duolingo app > Settings',
      'Tap "Manage subscription" (redirects to app store)',
      'Cancel through App Store or Google Play',
    ],
    note: 'Subscriptions bought in-app must be cancelled via your app store.',
  },
  headspace: {
    steps: [
      'Open Headspace > Profile > Settings',
      'Tap "Manage subscription"',
      'Cancel via your app store',
    ],
  },
  calm: {
    steps: [
      'Open Calm > Profile > Settings',
      'Tap "Manage Subscription"',
      'Cancel via your app store',
    ],
  },
  audible: {
    steps: [
      'Go to audible.co.uk/account',
      'Click "Cancel membership"',
      'Follow the prompts (may offer pause or discount)',
    ],
    url: 'https://www.audible.co.uk/account/overview',
    note: 'You keep credits and purchased books after cancelling.',
  },
  notion: {
    steps: [
      'Open Notion > Settings & Members',
      'Go to "Plans" or "Billing"',
      'Click "Downgrade" to free plan',
    ],
  },
  canva: {
    steps: [
      'Go to canva.com/settings/billing',
      'Click "Cancel subscription"',
      'Follow prompts to confirm',
    ],
    url: 'https://www.canva.com/settings/billing',
  },
  grammarly: {
    steps: [
      'Go to grammarly.com/account/subscription',
      'Click "Cancel Subscription"',
      'Confirm cancellation',
    ],
    url: 'https://account.grammarly.com/subscription',
  },
  'discord nitro': {
    steps: [
      'Open Discord > User Settings',
      'Go to "Subscriptions"',
      'Click "Cancel" on Nitro',
      'Confirm',
    ],
  },
  linkedin: {
    steps: [
      'Go to linkedin.com/mypreferences/d/manage-subscription',
      'Click "Cancel subscription"',
      'Follow the prompts',
    ],
    url: 'https://www.linkedin.com/mypreferences/d/manage-subscription',
  },
  tinder: {
    steps: [
      'Open phone Settings > Subscriptions (iOS)',
      'Or Google Play > Payments & subscriptions (Android)',
      'Find Tinder and cancel',
    ],
    note: 'Cancel through your app store, not in the Tinder app.',
  },
  bumble: {
    steps: [
      'Cancel through your app store (Settings > Subscriptions)',
      'Not through the Bumble app directly',
    ],
  },
  dazn: {
    steps: [
      'Go to dazn.com > My Account',
      'Click on your subscription',
      'Click "Cancel"',
      'Confirm',
    ],
    url: 'https://www.dazn.com/account',
  },
  sky: {
    steps: [
      'Log in to sky.com/myaccount',
      'Go to "My package"',
      'Select what you want to cancel',
      'Call or chat with Sky to confirm (often required)',
    ],
    note: 'Sky often requires a phone call or live chat to fully cancel.',
  },
  'now tv': {
    steps: [
      'Go to nowtv.com/account',
      'Click "Manage" on your pass',
      'Click "Cancel auto-renew"',
    ],
  },
  strava: {
    steps: [
      'Open Strava > Settings',
      'Tap "Subscription" > Manage',
      'Cancel via your app store',
    ],
  },
  peloton: {
    steps: [
      'Go to members.onepeloton.com',
      'Click "Subscriptions"',
      'Click "Cancel Subscription"',
      'Confirm',
    ],
  },
};

export function getAllCancelGuides(): { name: string; guide: CancelGuide }[] {
  return Object.entries(guides).map(([name, guide]) => ({
    name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    guide,
  }));
}

export function getCancelGuide(serviceName: string): CancelGuide | null {
  const lower = serviceName.toLowerCase().trim();
  if (guides[lower]) return guides[lower];
  for (const [key, guide] of Object.entries(guides)) {
    if (lower.includes(key) || key.includes(lower)) return guide;
  }
  return null;
}
