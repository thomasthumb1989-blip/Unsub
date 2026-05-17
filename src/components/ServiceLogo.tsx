import { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';

const SERVICE_DOMAINS: Record<string, string> = {
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  'apple music': 'apple.com',
  'apple tv': 'apple.com',
  'apple one': 'apple.com',
  'apple icloud': 'apple.com',
  icloud: 'apple.com',
  'disney+': 'disneyplus.com',
  'disney plus': 'disneyplus.com',
  hulu: 'hulu.com',
  'amazon prime': 'amazon.com',
  'prime video': 'amazon.com',
  amazon: 'amazon.com',
  'hbo max': 'hbomax.com',
  hbo: 'hbo.com',
  max: 'max.com',
  youtube: 'youtube.com',
  'youtube premium': 'youtube.com',
  'youtube music': 'youtube.com',
  'google one': 'google.com',
  'google drive': 'google.com',
  google: 'google.com',
  microsoft: 'microsoft.com',
  'microsoft 365': 'microsoft.com',
  xbox: 'xbox.com',
  'xbox game pass': 'xbox.com',
  'game pass': 'xbox.com',
  playstation: 'playstation.com',
  'ps plus': 'playstation.com',
  'playstation plus': 'playstation.com',
  nintendo: 'nintendo.com',
  twitch: 'twitch.tv',
  crunchyroll: 'crunchyroll.com',
  paramount: 'paramountplus.com',
  'paramount+': 'paramountplus.com',
  peacock: 'peacocktv.com',
  slack: 'slack.com',
  notion: 'notion.so',
  figma: 'figma.com',
  canva: 'canva.com',
  adobe: 'adobe.com',
  'creative cloud': 'adobe.com',
  photoshop: 'adobe.com',
  dropbox: 'dropbox.com',
  chatgpt: 'openai.com',
  openai: 'openai.com',
  claude: 'anthropic.com',
  github: 'github.com',
  linkedin: 'linkedin.com',
  'linkedin premium': 'linkedin.com',
  tinder: 'tinder.com',
  bumble: 'bumble.com',
  duolingo: 'duolingo.com',
  headspace: 'headspace.com',
  calm: 'calm.com',
  peloton: 'onepeloton.com',
  strava: 'strava.com',
  audible: 'audible.com',
  kindle: 'amazon.com',
  'kindle unlimited': 'amazon.com',
  nordvpn: 'nordvpn.com',
  expressvpn: 'expressvpn.com',
  surfshark: 'surfshark.com',
  '1password': '1password.com',
  lastpass: 'lastpass.com',
  bitwarden: 'bitwarden.com',
  grammarly: 'grammarly.com',
  evernote: 'evernote.com',
  todoist: 'todoist.com',
  zoom: 'zoom.us',
  discord: 'discord.com',
  'discord nitro': 'discord.com',
  whatsapp: 'whatsapp.com',
  telegram: 'telegram.org',
  dazn: 'dazn.com',
  'sky sports': 'sky.com',
  sky: 'sky.com',
  now: 'nowtv.com',
  'now tv': 'nowtv.com',
  bt: 'bt.com',
  'bt sport': 'bt.com',
  virgin: 'virginmedia.com',
  'virgin media': 'virginmedia.com',
  gym: '',
  'pure gym': 'puregym.com',
  puregym: 'puregym.com',
  'the gym': 'thegymgroup.com',
  'david lloyd': 'davidlloyd.co.uk',
};

function getDomain(serviceName: string): string | null {
  const lower = serviceName.toLowerCase().trim();
  if (SERVICE_DOMAINS[lower]) return SERVICE_DOMAINS[lower];
  for (const [key, domain] of Object.entries(SERVICE_DOMAINS)) {
    if (lower.includes(key) || key.includes(lower)) return domain;
  }
  return null;
}

export function ServiceLogo({ name, color, size = 40 }: {
  name: string;
  color: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(name);
  const borderRadius = size * 0.25;

  if (domain && !failed) {
    return (
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius }]}>
        <Image
          source={{ uri: `https://logo.clearbit.com/${domain}` }}
          style={[styles.logo, { width: size, height: size, borderRadius }]}
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[color, `${color}99`]}
      style={[styles.fallback, { width: size, height: size, borderRadius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.letter, { fontSize: size * 0.45 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  logo: {
    resizeMode: 'contain',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
    color: colors.white,
  },
});
