const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename, { showBackground = true, padding = 0.15 } = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  if (showBackground) {
    // Dark rounded background
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, size, size);

    // Subtle radial gradient overlay
    const gradient = ctx.createRadialGradient(size / 2, size * 0.3, 0, size / 2, size / 2, size * 0.7);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  // Letter "U" with amber gradient effect
  const fontSize = size * (1 - padding * 2) * 0.65;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Amber gradient for the letter
  const letterGradient = ctx.createLinearGradient(size * 0.3, size * 0.2, size * 0.7, size * 0.8);
  letterGradient.addColorStop(0, '#FBBF24');
  letterGradient.addColorStop(0.5, '#F59E0B');
  letterGradient.addColorStop(1, '#D97706');
  ctx.fillStyle = letterGradient;
  ctx.fillText('U', size / 2, size / 2 + fontSize * 0.03);

  // Small dot accent below
  const dotRadius = size * 0.025;
  const dotY = size / 2 + fontSize * 0.45;
  ctx.beginPath();
  ctx.arc(size / 2, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'assets', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${filename} (${size}x${size})`);
}

function generateAdaptiveIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background (Android adds its own)
  ctx.clearRect(0, 0, size, size);

  // Letter "U" centered with more padding for adaptive safe zone
  const fontSize = size * 0.4;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letterGradient = ctx.createLinearGradient(size * 0.3, size * 0.2, size * 0.7, size * 0.8);
  letterGradient.addColorStop(0, '#FBBF24');
  letterGradient.addColorStop(0.5, '#F59E0B');
  letterGradient.addColorStop(1, '#D97706');
  ctx.fillStyle = letterGradient;
  ctx.fillText('U', size / 2, size / 2 + fontSize * 0.03);

  // Dot accent
  const dotRadius = size * 0.018;
  const dotY = size / 2 + fontSize * 0.45;
  ctx.beginPath();
  ctx.arc(size / 2, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'assets', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${filename} (${size}x${size})`);
}

function generateSplash(width, height, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow
  const gradient = ctx.createRadialGradient(width / 2, height * 0.4, 0, width / 2, height / 2, Math.min(width, height) * 0.5);
  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // "U" logo
  const fontSize = Math.min(width, height) * 0.15;
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letterGradient = ctx.createLinearGradient(width * 0.4, height * 0.35, width * 0.6, height * 0.55);
  letterGradient.addColorStop(0, '#FBBF24');
  letterGradient.addColorStop(0.5, '#F59E0B');
  letterGradient.addColorStop(1, '#D97706');
  ctx.fillStyle = letterGradient;
  ctx.fillText('U', width / 2, height * 0.45);

  // Dot
  const dotRadius = fontSize * 0.04;
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.45 + fontSize * 0.45, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();

  // "Unsub" text below
  const textSize = fontSize * 0.25;
  ctx.font = `800 ${textSize}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('Unsub', width / 2, height * 0.45 + fontSize * 0.7);

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'assets', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${filename} (${width}x${height})`);
}

// Generate all icons
generateIcon(1024, 'icon.png');
generateAdaptiveIcon(1024, 'adaptive-icon.png');
generateIcon(48, 'favicon.png', { padding: 0.1 });
generateSplash(200, 200, 'splash-icon.png');

console.log('\nAll icons generated!');
