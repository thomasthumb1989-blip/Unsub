import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// ── Config ──
// Replace with your Google Cloud OAuth Client ID
const GOOGLE_CLIENT_ID = '844730517869-e4tbp99plmfu9hvsu3p25e671hpgh90h.apps.googleusercontent.com';
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_KEY = '@unsub_gmail_token';

// ── Subscription detection patterns ──
const SUBSCRIPTION_PATTERNS: { name: string; keywords: string[]; domain: string }[] = [
  { name: 'Netflix', keywords: ['netflix', 'your netflix membership'], domain: 'netflix.com' },
  { name: 'Spotify', keywords: ['spotify', 'spotify premium', 'your spotify receipt'], domain: 'spotify.com' },
  { name: 'Apple', keywords: ['apple.com/bill', 'apple subscription', 'app store receipt'], domain: 'apple.com' },
  { name: 'Amazon Prime', keywords: ['amazon prime', 'prime membership', 'prime video'], domain: 'amazon.com' },
  { name: 'Disney+', keywords: ['disney+', 'disneyplus', 'disney plus'], domain: 'disneyplus.com' },
  { name: 'YouTube Premium', keywords: ['youtube premium', 'youtube music premium', 'google youtube'], domain: 'youtube.com' },
  { name: 'HBO Max', keywords: ['hbo max', 'hbomax'], domain: 'max.com' },
  { name: 'Hulu', keywords: ['hulu', 'hulu subscription'], domain: 'hulu.com' },
  { name: 'Adobe', keywords: ['adobe', 'creative cloud', 'adobe creative'], domain: 'adobe.com' },
  { name: 'Microsoft 365', keywords: ['microsoft 365', 'office 365', 'microsoft subscription'], domain: 'microsoft.com' },
  { name: 'Google One', keywords: ['google one', 'google storage'], domain: 'google.com' },
  { name: 'iCloud', keywords: ['icloud', 'icloud+', 'apple icloud'], domain: 'apple.com' },
  { name: 'Dropbox', keywords: ['dropbox', 'dropbox plus', 'dropbox professional'], domain: 'dropbox.com' },
  { name: 'Slack', keywords: ['slack', 'slack technologies'], domain: 'slack.com' },
  { name: 'Notion', keywords: ['notion', 'notion.so'], domain: 'notion.so' },
  { name: 'Figma', keywords: ['figma'], domain: 'figma.com' },
  { name: 'Canva', keywords: ['canva', 'canva pro'], domain: 'canva.com' },
  { name: 'ChatGPT', keywords: ['openai', 'chatgpt', 'chatgpt plus'], domain: 'openai.com' },
  { name: 'Claude', keywords: ['anthropic', 'claude pro'], domain: 'anthropic.com' },
  { name: 'GitHub', keywords: ['github', 'github pro', 'github copilot'], domain: 'github.com' },
  { name: 'LinkedIn Premium', keywords: ['linkedin premium', 'linkedin learning'], domain: 'linkedin.com' },
  { name: 'NordVPN', keywords: ['nordvpn', 'nord vpn'], domain: 'nordvpn.com' },
  { name: 'ExpressVPN', keywords: ['expressvpn', 'express vpn'], domain: 'expressvpn.com' },
  { name: 'Duolingo', keywords: ['duolingo', 'duolingo plus', 'super duolingo'], domain: 'duolingo.com' },
  { name: 'Headspace', keywords: ['headspace'], domain: 'headspace.com' },
  { name: 'Calm', keywords: ['calm', 'calm premium'], domain: 'calm.com' },
  { name: 'Strava', keywords: ['strava', 'strava summit'], domain: 'strava.com' },
  { name: 'Audible', keywords: ['audible', 'audible membership'], domain: 'audible.com' },
  { name: 'Kindle Unlimited', keywords: ['kindle unlimited'], domain: 'amazon.com' },
  { name: 'Xbox Game Pass', keywords: ['xbox game pass', 'xbox live', 'microsoft xbox'], domain: 'xbox.com' },
  { name: 'PlayStation Plus', keywords: ['playstation plus', 'ps plus', 'sony playstation'], domain: 'playstation.com' },
  { name: 'Nintendo Switch Online', keywords: ['nintendo switch online', 'nintendo'], domain: 'nintendo.com' },
  { name: 'Discord Nitro', keywords: ['discord nitro', 'discord'], domain: 'discord.com' },
  { name: 'Twitch', keywords: ['twitch turbo', 'twitch subscription'], domain: 'twitch.tv' },
  { name: 'Crunchyroll', keywords: ['crunchyroll', 'crunchyroll premium'], domain: 'crunchyroll.com' },
  { name: 'Paramount+', keywords: ['paramount+', 'paramount plus'], domain: 'paramountplus.com' },
  { name: 'Peacock', keywords: ['peacock', 'peacock premium'], domain: 'peacocktv.com' },
  { name: 'Grammarly', keywords: ['grammarly', 'grammarly premium'], domain: 'grammarly.com' },
  { name: '1Password', keywords: ['1password'], domain: '1password.com' },
  { name: 'Bitwarden', keywords: ['bitwarden'], domain: 'bitwarden.com' },
  { name: 'Zoom', keywords: ['zoom', 'zoom pro', 'zoom.us'], domain: 'zoom.us' },
  { name: 'DAZN', keywords: ['dazn'], domain: 'dazn.com' },
  { name: 'Sky', keywords: ['sky sports', 'sky tv', 'sky.com'], domain: 'sky.com' },
  { name: 'NOW TV', keywords: ['now tv', 'nowtv'], domain: 'nowtv.com' },
  { name: 'Peloton', keywords: ['peloton', 'onepeloton'], domain: 'onepeloton.com' },
  { name: 'Tinder', keywords: ['tinder', 'tinder plus', 'tinder gold'], domain: 'tinder.com' },
  { name: 'Bumble', keywords: ['bumble', 'bumble premium'], domain: 'bumble.com' },
];

// Generic subscription keywords for unknown services
const GENERIC_KEYWORDS = [
  'subscription', 'recurring payment', 'renewal', 'billing', 'invoice',
  'your plan', 'membership', 'auto-renewal', 'payment receipt',
  'monthly charge', 'annual charge', 'your receipt',
];

// Price extraction patterns
const PRICE_PATTERNS = [
  /[\$\£\€](\d+\.?\d{0,2})/,
  /(\d+\.?\d{0,2})\s*(?:USD|GBP|EUR|CAD|AUD)/i,
  /(?:charged|amount|total|price|cost)[:\s]*[\$\£\€]?(\d+\.?\d{0,2})/i,
];

export type DiscoveredSubscription = {
  name: string;
  domain: string;
  amount: number | null;
  currency: string;
  emailDate: string;
  emailSubject: string;
  confidence: 'high' | 'medium' | 'low';
};

// ── Auth ──

export function getGoogleAuthRequest() {
  if (!GOOGLE_CLIENT_ID) return null;

  return AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: GMAIL_SCOPES,
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'unsub' }),
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ── Gmail API ──

async function fetchGmailMessages(accessToken: string, query: string, maxResults = 50): Promise<any[]> {
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) throw new Error(`Gmail search failed: ${searchRes.status}`);

  const searchData = await searchRes.json();
  if (!searchData.messages || searchData.messages.length === 0) return [];

  // Fetch message details in batches of 10
  const messages: any[] = [];
  const ids = searchData.messages.map((m: any) => m.id);

  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const details = await Promise.all(
      batch.map(async (id: string) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return null;
        return res.json();
      })
    );
    messages.push(...details.filter(Boolean));
  }

  return messages;
}

function extractHeader(message: any, name: string): string {
  const headers = message?.payload?.headers || [];
  const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractPrice(text: string): { amount: number; currency: string } | null {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (amount > 0 && amount < 10000) {
        let currency = 'GBP';
        if (text.includes('$')) currency = 'USD';
        if (text.includes('€')) currency = 'EUR';
        return { amount, currency };
      }
    }
  }
  return null;
}

function detectSubscription(subject: string, from: string): { name: string; domain: string; confidence: 'high' | 'medium' | 'low' } | null {
  const combined = `${subject} ${from}`.toLowerCase();

  // Check known services first (high confidence)
  for (const service of SUBSCRIPTION_PATTERNS) {
    for (const keyword of service.keywords) {
      if (combined.includes(keyword)) {
        return { name: service.name, domain: service.domain, confidence: 'high' };
      }
    }
  }

  // Check generic subscription keywords (medium confidence)
  for (const keyword of GENERIC_KEYWORDS) {
    if (combined.includes(keyword)) {
      // Extract service name from sender
      const fromMatch = from.match(/^"?([^"<]+)/);
      const senderName = fromMatch ? fromMatch[1].trim() : 'Unknown Service';
      const domainMatch = from.match(/@([a-z0-9.-]+)/i);
      const domain = domainMatch ? domainMatch[1] : '';
      return { name: senderName, domain, confidence: 'medium' };
    }
  }

  return null;
}

// ── Main scan ──

export async function scanGmailForSubscriptions(accessToken: string): Promise<DiscoveredSubscription[]> {
  // Search for subscription-related emails from last 12 months
  const query = 'newer_than:12m (subscription OR "recurring payment" OR renewal OR "your membership" OR invoice OR receipt OR billing OR "payment confirmation")';

  const messages = await fetchGmailMessages(accessToken, query, 100);
  const found = new Map<string, DiscoveredSubscription>();

  for (const msg of messages) {
    const subject = extractHeader(msg, 'Subject');
    const from = extractHeader(msg, 'From');
    const date = extractHeader(msg, 'Date');

    const detection = detectSubscription(subject, from);
    if (!detection) continue;

    // Deduplicate — keep most recent per service
    const key = detection.name.toLowerCase();
    if (found.has(key)) {
      const existing = found.get(key)!;
      if (new Date(date) > new Date(existing.emailDate)) {
        const priceInfo = extractPrice(subject);
        found.set(key, {
          ...existing,
          emailDate: date,
          emailSubject: subject,
          amount: priceInfo?.amount ?? existing.amount,
          currency: priceInfo?.currency ?? existing.currency,
        });
      }
      continue;
    }

    const priceInfo = extractPrice(subject);
    found.set(key, {
      name: detection.name,
      domain: detection.domain,
      amount: priceInfo?.amount ?? null,
      currency: priceInfo?.currency ?? 'GBP',
      emailDate: date,
      emailSubject: subject,
      confidence: detection.confidence,
    });
  }

  // Sort: high confidence first, then by date
  return Array.from(found.values()).sort((a, b) => {
    if (a.confidence !== b.confidence) {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    }
    return new Date(b.emailDate).getTime() - new Date(a.emailDate).getTime();
  });
}

export function isGmailConfigured(): boolean {
  return GOOGLE_CLIENT_ID.length > 0;
}
