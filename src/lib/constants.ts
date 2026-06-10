export const COLOR_THEMES = [
  {
    id: 'standard',
    name: '🎨 Classic GAN Stickerless',
    description: 'Cores oficiais super vibrantes com interior preto.',
    colors: { U: 0xFFEC00, D: 0xFFFFFF, F: 0x00CD38, B: 0x0062E3, L: 0xDF1A22, R: 0xFF5800, inner: 0x14161a }
  },
  {
    id: 'primary-esmerald',
    name: '💎 GAN Jade Limited',
    description: 'Tons de cap fosco pastel sobre plástico leitoso primário.',
    colors: { U: 0xFAF050, D: 0xFDFDFD, F: 0x3CF0C0, B: 0x2480FF, L: 0xFF4E65, R: 0xFFA040, inner: 0xF5F4EF }
  },
  {
    id: 'stealth-carbon',
    name: '🏎️ Stealth Carbon Elite',
    description: 'Caps pretos acetinados e internos de composto de carbono.',
    colors: { U: 0x2A2E35, D: 0x20242A, F: 0x1C1F24, B: 0x22262C, L: 0x1A1D21, R: 0x282C32, inner: 0x0C0D0F }
  }
];

export const SKINS = [
  { id: 'glossy-stickerless', name: '💎 UV-Gloss Finish', tag: 'UV Mirror Coating' },
  { id: 'honeycomb-tech', name: '🍯 Honeycomb Friction', tag: 'Alveoli Relief' },
  { id: 'carbon-fighter', name: '🧶 Carbon Fiber Satin', tag: 'Satin Twill' },
  { id: 'frost-satin', name: '❄️ Frosted Tactile Matte', tag: 'Diffused Matte' },
  { id: 'cyber-neon', name: '⚡ Cyber Glow', tag: 'Neon Luminous' }
];

export const STUDIO_PRESETS = [
  { id: 'dark-keyshot', name: '📸 Professional Dark Studio', bg: '#080a12', ambientColor: 0x1e2640, ambientIntensity: 0.2, keyColor: 0xffffff, keyIntensity: 1.5, rimColor: 0x64a6ff, rimIntensity: 1.5, fillColor: 0x2c3b5e, fillIntensity: 0.7 },
  { id: 'extreme-neon', name: '👾 Cyberpunk Diagnostics', bg: '#04020a', ambientColor: 0x1a0d30, ambientIntensity: 0.25, keyColor: 0x00ffff, keyIntensity: 2.0, rimColor: 0xff00ff, rimIntensity: 2.2, fillColor: 0x120822, fillIntensity: 0.8 },
  { id: 'warm-sunset', name: '🌅 Golden Luxe Room', bg: '#120b0b', ambientColor: 0x301515, ambientIntensity: 0.2, keyColor: 0xffaa44, keyIntensity: 1.8, rimColor: 0xffd264, rimIntensity: 2.0, fillColor: 0x4d161d, fillIntensity: 0.6 },
  { id: 'white-commercial', name: '🏢 Clean CAD Lab', bg: '#f1f5f9', ambientColor: 0xffffff, ambientIntensity: 0.7, keyColor: 0xfffcf5, keyIntensity: 1.0, rimColor: 0xd9e2ec, rimIntensity: 0.7, fillColor: 0xbcccdc, fillIntensity: 0.5 }
];

export const CORE_MATERIALS = [
  { id: 'titanium-gold', name: '👑 Solid Titanium Gold', color: 0xffca28, metalness: 0.9, roughness: 0.1 },
  { id: 'primary-white', name: '❄️ Frosted Pearl Nylon', color: 0xededed, metalness: 0.1, roughness: 0.45 },
  { id: 'classic-black', name: '🔥 Stealth Carbon Composite', color: 0x222222, metalness: 0.5, roughness: 0.7 },
  { id: 'transparent-cyan', name: '💧 Aqua Glass', color: 0x06b6d4, metalness: 0.3, roughness: 0.1 }
];
