const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const ICONS_DIR = path.join(ASSETS_DIR, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

// ── Color themes ──
const COLOR_THEMES = {
  amber:  { gradient: ['#FBBF24', '#F59E0B', '#D97706'], glow: 'rgba(245,158,11,0.08)', dot: '#F59E0B' },
  blue:   { gradient: ['#60A5FA', '#3B82F6', '#2563EB'], glow: 'rgba(59,130,246,0.08)',  dot: '#3B82F6' },
  red:    { gradient: ['#F87171', '#EF4444', '#DC2626'], glow: 'rgba(239,68,68,0.08)',   dot: '#EF4444' },
  green:  { gradient: ['#34D399', '#10B981', '#059669'], glow: 'rgba(16,185,129,0.08)',  dot: '#10B981' },
  purple: { gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'], glow: 'rgba(139,92,246,0.08)', dot: '#8B5CF6' },
  pink:   { gradient: ['#F472B6', '#EC4899', '#DB2777'], glow: 'rgba(236,72,153,0.08)', dot: '#EC4899' },
};

// ── Background themes ──
const BG_THEMES = {
  dark:  { bg: '#0A0A0A', textAlpha: 0.6 },
  light: { bg: '#F5F5F7', textAlpha: 0.4 },
};

// ── Icon styles ──

// Style 1: Lettermark "U" with dot (original)
function drawLettermark(ctx, size, colorTheme) {
  const fontSize = size * 0.45;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createLinearGradient(size * 0.3, size * 0.2, size * 0.7, size * 0.8);
  grad.addColorStop(0, colorTheme.gradient[0]);
  grad.addColorStop(0.5, colorTheme.gradient[1]);
  grad.addColorStop(1, colorTheme.gradient[2]);
  ctx.fillStyle = grad;
  ctx.fillText('U', size / 2, size / 2);

  // Dot accent
  const dotR = size * 0.025;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 + fontSize * 0.45, dotR, 0, Math.PI * 2);
  ctx.fillStyle = colorTheme.dot;
  ctx.fill();
}

// Style 2: Minimal — just the letter, no dot, thinner weight
function drawMinimal(ctx, size, colorTheme) {
  const fontSize = size * 0.5;
  ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colorTheme.gradient[1];
  ctx.fillText('U', size / 2, size / 2);
}

// Style 3: Circle badge — letter inside a colored circle
function drawBadge(ctx, size, colorTheme) {
  const circleR = size * 0.32;
  const grad = ctx.createRadialGradient(size / 2, size * 0.45, 0, size / 2, size / 2, circleR);
  grad.addColorStop(0, colorTheme.gradient[0]);
  grad.addColorStop(1, colorTheme.gradient[2]);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, circleR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  const fontSize = size * 0.35;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('U', size / 2, size / 2 + fontSize * 0.02);
}

// Style 4: Outline — letter with a ring border
function drawOutline(ctx, size, colorTheme) {
  const ringR = size * 0.34;
  const lineW = size * 0.025;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = colorTheme.gradient[1];
  ctx.lineWidth = lineW;
  ctx.stroke();

  const fontSize = size * 0.35;
  ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createLinearGradient(size * 0.3, size * 0.3, size * 0.7, size * 0.7);
  grad.addColorStop(0, colorTheme.gradient[0]);
  grad.addColorStop(1, colorTheme.gradient[2]);
  ctx.fillStyle = grad;
  ctx.fillText('U', size / 2, size / 2);
}

const STYLES = {
  lettermark: drawLettermark,
  minimal: drawMinimal,
  badge: drawBadge,
  outline: drawOutline,
};

// ── Generator ──

function generateVariantIcon(size, filename, { bgTheme, colorTheme, styleFn }) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgTheme.bg;
  ctx.fillRect(0, 0, size, size);

  // Subtle glow
  const glow = ctx.createRadialGradient(size / 2, size * 0.3, 0, size / 2, size / 2, size * 0.7);
  glow.addColorStop(0, colorTheme.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Draw the icon style
  styleFn(ctx, size, colorTheme);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ICONS_DIR, filename), buffer);
  console.log(`  ${filename}`);
}

// ── Generate all variants ──

console.log('Generating icon variants...\n');

const variants = [];

// Generate key combinations (not all permutations — curated set)
const ICON_CONFIGS = [
  // Default (original amber lettermark)
  { name: 'Default',       style: 'lettermark', color: 'amber',  bg: 'dark' },
  // Color variants (lettermark style, dark bg)
  { name: 'Ocean',         style: 'lettermark', color: 'blue',   bg: 'dark' },
  { name: 'Rose',          style: 'lettermark', color: 'red',    bg: 'dark' },
  { name: 'Mint',          style: 'lettermark', color: 'green',  bg: 'dark' },
  { name: 'Violet',        style: 'lettermark', color: 'purple', bg: 'dark' },
  // Style variants (amber color, dark bg)
  { name: 'Minimal',       style: 'minimal',    color: 'amber',  bg: 'dark' },
  { name: 'Badge',         style: 'badge',      color: 'amber',  bg: 'dark' },
  { name: 'Outline',       style: 'outline',    color: 'amber',  bg: 'dark' },
  // Light background variants
  { name: 'Light',         style: 'lettermark', color: 'amber',  bg: 'light' },
  { name: 'Light Badge',   style: 'badge',      color: 'blue',   bg: 'light' },
];

for (const config of ICON_CONFIGS) {
  const filename = `icon-${config.style}-${config.color}-${config.bg}.png`;
  generateVariantIcon(1024, filename, {
    bgTheme: BG_THEMES[config.bg],
    colorTheme: COLOR_THEMES[config.color],
    styleFn: STYLES[config.style],
  });
  variants.push({ ...config, filename });
}

// ── Also regenerate the default icons ──

console.log('\nGenerating default app icons...');

function generateDefaultIcon(size, filename, opts = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (opts.showBackground !== false) {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, size, size);

    const gradient = ctx.createRadialGradient(size / 2, size * 0.3, 0, size / 2, size / 2, size * 0.7);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const padding = opts.padding || 0.15;
  const fontSize = size * (1 - padding * 2) * 0.65;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letterGradient = ctx.createLinearGradient(size * 0.3, size * 0.2, size * 0.7, size * 0.8);
  letterGradient.addColorStop(0, '#FBBF24');
  letterGradient.addColorStop(0.5, '#F59E0B');
  letterGradient.addColorStop(1, '#D97706');
  ctx.fillStyle = letterGradient;
  ctx.fillText('U', size / 2, size / 2 + fontSize * 0.03);

  const dotRadius = size * 0.025;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 + fontSize * 0.45, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, filename), buffer);
  console.log(`  ${filename} (${size}x${size})`);
}

generateDefaultIcon(1024, 'icon.png');
generateDefaultIcon(48, 'favicon.png', { padding: 0.1 });

// Adaptive icon (transparent bg)
const adaptiveCanvas = createCanvas(1024, 1024);
const actx = adaptiveCanvas.getContext('2d');
actx.clearRect(0, 0, 1024, 1024);
const afontSize = 1024 * 0.4;
actx.font = `900 ${afontSize}px "Segoe UI", Arial, sans-serif`;
actx.textAlign = 'center';
actx.textBaseline = 'middle';
const aGrad = actx.createLinearGradient(1024 * 0.3, 1024 * 0.2, 1024 * 0.7, 1024 * 0.8);
aGrad.addColorStop(0, '#FBBF24');
aGrad.addColorStop(0.5, '#F59E0B');
aGrad.addColorStop(1, '#D97706');
actx.fillStyle = aGrad;
actx.fillText('U', 512, 512);
actx.beginPath();
actx.arc(512, 512 + afontSize * 0.45, 1024 * 0.018, 0, Math.PI * 2);
actx.fillStyle = '#F59E0B';
actx.fill();
fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), adaptiveCanvas.toBuffer('image/png'));
console.log('  adaptive-icon.png (1024x1024)');

// Splash icon
const splashSize = 200;
const splashCanvas = createCanvas(splashSize, splashSize);
const sctx = splashCanvas.getContext('2d');
sctx.fillStyle = '#0A0A0A';
sctx.fillRect(0, 0, splashSize, splashSize);
const sfontSize = splashSize * 0.45;
sctx.font = `900 ${sfontSize}px "Segoe UI", Arial, sans-serif`;
sctx.textAlign = 'center';
sctx.textBaseline = 'middle';
const sGrad = sctx.createLinearGradient(splashSize * 0.3, splashSize * 0.2, splashSize * 0.7, splashSize * 0.8);
sGrad.addColorStop(0, '#FBBF24');
sGrad.addColorStop(0.5, '#F59E0B');
sGrad.addColorStop(1, '#D97706');
sctx.fillStyle = sGrad;
sctx.fillText('U', splashSize / 2, splashSize / 2);
fs.writeFileSync(path.join(ASSETS_DIR, 'splash-icon.png'), splashCanvas.toBuffer('image/png'));
console.log('  splash-icon.png (200x200)');

console.log(`\nDone! Generated ${variants.length} icon variants + 4 default icons.`);
