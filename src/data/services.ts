export type ServiceInfo = {
  name: string;
  icon: string;
  trialDays: number;
  chargeAmount: number;
  cancelUrl: string;
};

export const services: ServiceInfo[] = [
  { name: 'Netflix', icon: '🎬', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://www.netflix.com/cancelplan' },
  { name: 'Spotify', icon: '🎵', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://www.spotify.com/account/subscription/' },
  { name: 'Amazon Prime', icon: '📦', trialDays: 30, chargeAmount: 8.99, cancelUrl: 'https://www.amazon.co.uk/gp/primecentral' },
  { name: 'Disney+', icon: '🏰', trialDays: 7, chargeAmount: 7.99, cancelUrl: 'https://www.disneyplus.com/account' },
  { name: 'YouTube Premium', icon: '▶️', trialDays: 30, chargeAmount: 12.99, cancelUrl: 'https://www.youtube.com/paid_memberships' },
  { name: 'Apple TV+', icon: '🍎', trialDays: 7, chargeAmount: 8.99, cancelUrl: 'https://support.apple.com/en-gb/HT202039' },
  { name: 'Apple Music', icon: '🎶', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://support.apple.com/en-gb/HT202039' },
  { name: 'HBO Max', icon: '🎭', trialDays: 7, chargeAmount: 9.99, cancelUrl: 'https://www.hbomax.com/settings/subscription' },
  { name: 'Hulu', icon: '📺', trialDays: 30, chargeAmount: 7.99, cancelUrl: 'https://secure.hulu.com/account' },
  { name: 'Paramount+', icon: '⛰️', trialDays: 7, chargeAmount: 6.99, cancelUrl: 'https://www.paramountplus.com/account/' },
  { name: 'Peacock', icon: '🦚', trialDays: 7, chargeAmount: 5.99, cancelUrl: 'https://www.peacocktv.com/account' },
  { name: 'Audible', icon: '🎧', trialDays: 30, chargeAmount: 7.99, cancelUrl: 'https://www.audible.co.uk/account/cancel-membership' },
  { name: 'Kindle Unlimited', icon: '📚', trialDays: 30, chargeAmount: 9.99, cancelUrl: 'https://www.amazon.co.uk/kindle-dbs/ku/ku-central' },
  { name: 'Adobe Creative Cloud', icon: '🎨', trialDays: 7, chargeAmount: 54.99, cancelUrl: 'https://account.adobe.com/plans' },
  { name: 'Canva Pro', icon: '🖼️', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://www.canva.com/settings/billing' },
  { name: 'Figma', icon: '✏️', trialDays: 30, chargeAmount: 12.00, cancelUrl: 'https://www.figma.com/settings' },
  { name: 'ChatGPT Plus', icon: '🤖', trialDays: 7, chargeAmount: 20.00, cancelUrl: 'https://chat.openai.com/settings/subscription' },
  { name: 'Claude Pro', icon: '🧠', trialDays: 7, chargeAmount: 20.00, cancelUrl: 'https://claude.ai/settings' },
  { name: 'Notion', icon: '📝', trialDays: 7, chargeAmount: 8.00, cancelUrl: 'https://www.notion.so/my-account' },
  { name: 'Grammarly', icon: '📖', trialDays: 7, chargeAmount: 12.00, cancelUrl: 'https://account.grammarly.com/subscription' },
  { name: 'NordVPN', icon: '🔒', trialDays: 30, chargeAmount: 11.99, cancelUrl: 'https://my.nordaccount.com/dashboard/nordvpn/' },
  { name: 'ExpressVPN', icon: '🛡️', trialDays: 7, chargeAmount: 12.95, cancelUrl: 'https://www.expressvpn.com/subscriptions' },
  { name: 'Headspace', icon: '🧘', trialDays: 7, chargeAmount: 9.99, cancelUrl: 'https://www.headspace.com/settings/subscription' },
  { name: 'Calm', icon: '🌊', trialDays: 7, chargeAmount: 12.99, cancelUrl: 'https://www.calm.com/account' },
  { name: 'Duolingo Plus', icon: '🦉', trialDays: 14, chargeAmount: 6.99, cancelUrl: 'https://www.duolingo.com/settings/account' },
  { name: 'Strava', icon: '🏃', trialDays: 30, chargeAmount: 6.99, cancelUrl: 'https://www.strava.com/settings/subscription' },
  { name: 'Peloton', icon: '🚲', trialDays: 30, chargeAmount: 12.99, cancelUrl: 'https://members.onepeloton.com/settings/subscription' },
  { name: 'Tinder Gold', icon: '🔥', trialDays: 7, chargeAmount: 14.99, cancelUrl: 'https://tinder.com/settings' },
  { name: 'Bumble Premium', icon: '🐝', trialDays: 7, chargeAmount: 16.99, cancelUrl: 'https://bumble.com/settings' },
  { name: 'LinkedIn Premium', icon: '💼', trialDays: 30, chargeAmount: 29.99, cancelUrl: 'https://www.linkedin.com/mypreferences/d/manage-subscription' },
  { name: 'Dropbox Plus', icon: '💧', trialDays: 30, chargeAmount: 9.99, cancelUrl: 'https://www.dropbox.com/account/plan' },
  { name: 'Google One', icon: '☁️', trialDays: 30, chargeAmount: 1.99, cancelUrl: 'https://one.google.com/settings' },
  { name: 'iCloud+', icon: '🌐', trialDays: 30, chargeAmount: 0.99, cancelUrl: 'https://support.apple.com/en-gb/HT201318' },
  { name: 'Microsoft 365', icon: '💻', trialDays: 30, chargeAmount: 5.99, cancelUrl: 'https://account.microsoft.com/services/' },
  { name: 'Skillshare', icon: '🎓', trialDays: 7, chargeAmount: 13.99, cancelUrl: 'https://www.skillshare.com/settings/payments' },
  { name: 'MasterClass', icon: '🏆', trialDays: 7, chargeAmount: 10.00, cancelUrl: 'https://www.masterclass.com/account' },
  { name: 'Coursera Plus', icon: '🎓', trialDays: 7, chargeAmount: 49.00, cancelUrl: 'https://www.coursera.org/account-settings' },
  { name: 'Crunchyroll', icon: '🍥', trialDays: 14, chargeAmount: 4.99, cancelUrl: 'https://www.crunchyroll.com/account/membership' },
  { name: 'Twitch Turbo', icon: '🎮', trialDays: 7, chargeAmount: 8.99, cancelUrl: 'https://www.twitch.tv/subscriptions' },
  { name: 'Xbox Game Pass', icon: '🎮', trialDays: 14, chargeAmount: 10.99, cancelUrl: 'https://account.microsoft.com/services/' },
  { name: 'PlayStation Plus', icon: '🎯', trialDays: 7, chargeAmount: 6.99, cancelUrl: 'https://store.playstation.com/subscriptions/' },
  { name: 'Nintendo Online', icon: '🍄', trialDays: 7, chargeAmount: 3.49, cancelUrl: 'https://accounts.nintendo.com' },
  { name: 'Evernote', icon: '🐘', trialDays: 14, chargeAmount: 7.99, cancelUrl: 'https://www.evernote.com/Settings.action' },
  { name: 'Todoist Pro', icon: '✅', trialDays: 7, chargeAmount: 4.00, cancelUrl: 'https://todoist.com/app/settings/subscription' },
  { name: '1Password', icon: '🔑', trialDays: 14, chargeAmount: 2.99, cancelUrl: 'https://my.1password.com/settings/billing' },
  { name: 'LastPass', icon: '🔐', trialDays: 30, chargeAmount: 3.00, cancelUrl: 'https://lastpass.com/account.php' },
  { name: 'Dashlane', icon: '🔏', trialDays: 30, chargeAmount: 3.33, cancelUrl: 'https://app.dashlane.com/account/subscriptions' },
  { name: 'Deezer', icon: '🎵', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://www.deezer.com/account/subscription' },
  { name: 'Tidal', icon: '🌊', trialDays: 30, chargeAmount: 10.99, cancelUrl: 'https://account.tidal.com/subscription' },
  { name: 'Scribd', icon: '📜', trialDays: 30, chargeAmount: 11.99, cancelUrl: 'https://www.scribd.com/account-settings/subscription' },
  { name: 'Medium', icon: '✍️', trialDays: 7, chargeAmount: 5.00, cancelUrl: 'https://medium.com/me/settings' },
  { name: 'The Athletic', icon: '⚽', trialDays: 7, chargeAmount: 9.99, cancelUrl: 'https://theathletic.com/settings/your-plan' },
  { name: 'Blinkist', icon: '📗', trialDays: 7, chargeAmount: 6.67, cancelUrl: 'https://www.blinkist.com/app/settings/account' },
  { name: 'Surfshark', icon: '🦈', trialDays: 7, chargeAmount: 2.49, cancelUrl: 'https://my.surfshark.com/subscription' },
  { name: 'CuriosityStream', icon: '🔬', trialDays: 7, chargeAmount: 2.99, cancelUrl: 'https://curiositystream.com/settings' },
  { name: 'Nebula', icon: '🌌', trialDays: 7, chargeAmount: 5.00, cancelUrl: 'https://nebula.tv/account' },
  { name: 'Mubi', icon: '🎥', trialDays: 7, chargeAmount: 9.99, cancelUrl: 'https://mubi.com/account' },
  { name: 'BritBox', icon: '🇬🇧', trialDays: 7, chargeAmount: 5.99, cancelUrl: 'https://www.britbox.com/account' },
  { name: 'NOW TV', icon: '📡', trialDays: 7, chargeAmount: 9.99, cancelUrl: 'https://www.nowtv.com/account' },
  { name: 'Shudder', icon: '👻', trialDays: 7, chargeAmount: 4.99, cancelUrl: 'https://www.shudder.com/account' },
];

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
