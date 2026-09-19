export interface ChatBackgroundOption {
  id: string;
  name: string;
  description: string;
  previewClass: string;
  containerStyle: React.CSSProperties;
}

// 1. Visible study & coding doodles
const DOODLE_LIGHT_SVG = `data:image/svg+xml;utf8,<svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(109,40,217,0.22)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 20 L45 20 M15 28 L40 28 M15 36 L35 36 M10 12 L50 12 L50 48 L10 48 Z"/><path d="M85 15 L105 35 L80 60 L65 65 L70 50 Z M95 25 L85 35"/><path d="M120 18 L128 26 L120 34 M132 18 L124 34"/><path d="M25 80 C25 72 37 72 37 80 C37 85 33 88 31 92 L31 95 M31 99 L31 100 M27 95 L35 95"/><ellipse cx="90" cy="90" rx="20" ry="8" transform="rotate(30 90 90)"/><ellipse cx="90" cy="90" rx="20" ry="8" transform="rotate(-30 90 90)"/><circle cx="90" cy="90" r="3" fill="rgba(109,40,217,0.22)"/><path d="M55 110 L65 110 M60 105 L60 115 M115 115 L125 125 M125 115 L115 125"/></svg>`;
const DOODLE_DARK_SVG = `data:image/svg+xml;utf8,<svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(192,132,252,0.28)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 20 L45 20 M15 28 L40 28 M15 36 L35 36 M10 12 L50 12 L50 48 L10 48 Z"/><path d="M85 15 L105 35 L80 60 L65 65 L70 50 Z M95 25 L85 35"/><path d="M120 18 L128 26 L120 34 M132 18 L124 34"/><path d="M25 80 C25 72 37 72 37 80 C37 85 33 88 31 92 L31 95 M31 99 L31 100 M27 95 L35 95"/><ellipse cx="90" cy="90" rx="20" ry="8" transform="rotate(30 90 90)"/><ellipse cx="90" cy="90" rx="20" ry="8" transform="rotate(-30 90 90)"/><circle cx="90" cy="90" r="3" fill="rgba(192,132,252,0.28)"/><path d="M55 110 L65 110 M60 105 L60 115 M115 115 L125 125 M125 115 L115 125"/></svg>`;

// 2. Cosmic Constellation stars
const STARS_LIGHT_SVG = `data:image/svg+xml;utf8,<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25 15 Q25 25 15 25 Q25 25 25 35 Q25 25 35 25 Q25 25 25 15" fill="rgba(99,102,241,0.30)"/><circle cx="65" cy="20" r="1.5" fill="rgba(139,92,246,0.28)"/><circle cx="100" cy="35" r="2" fill="rgba(99,102,241,0.35)"/><circle cx="85" cy="60" r="1.5" fill="rgba(139,92,246,0.25)"/><circle cx="30" cy="75" r="2" fill="rgba(99,102,241,0.30)"/><line x1="65" y1="20" x2="100" y2="35" stroke="rgba(99,102,241,0.20)" stroke-dasharray="2 2"/><line x1="100" y1="35" x2="85" y2="60" stroke="rgba(99,102,241,0.20)" stroke-dasharray="2 2"/><path d="M80 85 Q80 95 70 95 Q80 95 80 105 Q80 95 90 95 Q80 95 80 85" fill="rgba(99,102,241,0.30)"/></svg>`;
const STARS_DARK_SVG = `data:image/svg+xml;utf8,<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M25 15 Q25 25 15 25 Q25 25 25 35 Q25 25 35 25 Q25 25 25 15" fill="rgba(147,197,253,0.55)"/><circle cx="65" cy="20" r="1.5" fill="rgba(192,132,252,0.45)"/><circle cx="100" cy="35" r="2" fill="rgba(147,197,253,0.50)"/><circle cx="85" cy="60" r="1.5" fill="rgba(192,132,252,0.40)"/><circle cx="30" cy="75" r="2" fill="rgba(147,197,253,0.45)"/><line x1="65" y1="20" x2="100" y2="35" stroke="rgba(147,197,253,0.25)" stroke-dasharray="2 2"/><line x1="100" y1="35" x2="85" y2="60" stroke="rgba(147,197,253,0.25)" stroke-dasharray="2 2"/><path d="M80 85 Q80 95 70 95 Q80 95 80 105 Q80 95 90 95 Q80 95 80 85" fill="rgba(147,197,253,0.55)"/></svg>`;

// 3. 3D Isometric Geometric Cubes
const ISO_LIGHT_SVG = `data:image/svg+xml;utf8,<svg width="50" height="86.6" viewBox="0 0 50 86.6" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(100,116,139,0.18)" stroke-width="1"><path d="M25 0 L50 14.4 L50 43.3 L25 28.9 Z M25 0 L0 14.4 L0 43.3 L25 28.9 Z M25 28.9 L50 43.3 L25 57.7 L0 43.3 Z"/><path d="M25 57.7 L50 72.2 L50 101 L25 86.6 Z M25 57.7 L0 72.2 L0 101 L25 86.6 Z M25 86.6 L50 101 L25 115.5 L0 101 Z"/></svg>`;
const ISO_DARK_SVG = `data:image/svg+xml;utf8,<svg width="50" height="86.6" viewBox="0 0 50 86.6" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(148,163,184,0.22)" stroke-width="1"><path d="M25 0 L50 14.4 L50 43.3 L25 28.9 Z M25 0 L0 14.4 L0 43.3 L25 28.9 Z M25 28.9 L50 43.3 L25 57.7 L0 43.3 Z"/><path d="M25 57.7 L50 72.2 L50 101 L25 86.6 Z M25 57.7 L0 72.2 L0 101 L25 86.6 Z M25 86.6 L50 101 L25 115.5 L0 101 Z"/></svg>`;

export const CHAT_BACKGROUNDS: ChatBackgroundOption[] = [
  {
    id: 'minimal',
    name: 'Default Canvas',
    description: 'Clean distraction-free workspace',
    previewClass: 'bg-[#F4F0F8] dark:bg-[#101014]',
    containerStyle: {
      backgroundColor: '#F4F0F8',
    },
  },
  {
    id: 'doodle',
    name: 'Study Doodles',
    description: 'Notes, atom, pencil & code brackets',
    previewClass: 'bg-[#F5F0FA] dark:bg-[#0f0d17]',
    containerStyle: {
      backgroundColor: '#F5F0FA',
      backgroundImage: `url("${DOODLE_LIGHT_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '150px 150px',
    },
  },
  {
    id: 'grid',
    name: 'Drafting Blueprint',
    description: 'Technical engineering grid lines',
    previewClass: 'bg-[#EEF4FF] dark:bg-[#080f1e]',
    containerStyle: {
      backgroundColor: '#EEF4FF',
      backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.22) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(59, 130, 246, 0.22) 1.5px, transparent 1.5px), linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)`,
      backgroundSize: '48px 48px, 48px 48px, 12px 12px, 12px 12px',
    },
  },
  {
    id: 'constellation',
    name: 'Starlight Sky',
    description: 'Night sky stars & constellations',
    previewClass: 'bg-[#FAF5FF] dark:bg-[#080816]',
    containerStyle: {
      backgroundColor: '#FAF5FF',
      backgroundImage: `url("${STARS_LIGHT_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '120px 120px',
    },
  },
  {
    id: 'dots',
    name: 'Dot Matrix',
    description: 'Minimalist bullet journal pattern',
    previewClass: 'bg-[#F9F5FD] dark:bg-[#12121c]',
    containerStyle: {
      backgroundColor: '#F9F5FD',
      backgroundImage: `radial-gradient(circle, rgba(124, 58, 237, 0.30) 1.5px, transparent 1.5px)`,
      backgroundSize: '22px 22px',
    },
  },
  {
    id: 'zinc',
    name: '3D Isometric',
    description: 'Geometric architectural cubes',
    previewClass: 'bg-[#F1F5F9] dark:bg-[#0d1117]',
    containerStyle: {
      backgroundColor: '#F1F5F9',
      backgroundImage: `url("${ISO_LIGHT_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '50px 86.6px',
    },
  },
  {
    id: 'ivory',
    name: 'Warm Sunset',
    description: 'Relaxing amber & rose ambient glow',
    previewClass: 'bg-gradient-to-br from-amber-100 to-rose-100 dark:from-stone-900 dark:to-neutral-900',
    containerStyle: {
      backgroundImage: 'linear-gradient(135deg, #FFF1EB 0%, #FEE2E2 45%, #F5EEF8 100%)',
    },
  },
  {
    id: 'terminal',
    name: 'Matrix Terminal',
    description: 'Cyberpunk emerald green code grid',
    previewClass: 'bg-[#F0FDF4] dark:bg-[#050f08]',
    containerStyle: {
      backgroundColor: '#F0FDF4',
      backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.18) 1px, transparent 1px)`,
      backgroundSize: '24px 24px, 24px 24px',
    },
  },
];

export function getThemedBackgroundStyle(id: string, isDark: boolean): React.CSSProperties {
  if (!isDark) {
    const bg = CHAT_BACKGROUNDS.find((b) => b.id === id) || CHAT_BACKGROUNDS[0];
    return bg.containerStyle;
  }

  // Dark Mode Styles — each distinctly stylized
  switch (id) {
    case 'minimal':
      return { backgroundColor: '#101014' };
    case 'doodle':
      return {
        backgroundColor: '#0f0d17',
        backgroundImage: `url("${DOODLE_DARK_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px',
      };
    case 'grid':
      return {
        backgroundColor: '#080f1e',
        backgroundImage: `linear-gradient(rgba(96, 165, 250, 0.25) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(96, 165, 250, 0.25) 1.5px, transparent 1.5px), linear-gradient(rgba(96, 165, 250, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.08) 1px, transparent 1px)`,
        backgroundSize: '48px 48px, 48px 48px, 12px 12px, 12px 12px',
      };
    case 'constellation':
      return {
        backgroundColor: '#080816',
        backgroundImage: `radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.22), transparent 45%), radial-gradient(circle at 15% 85%, rgba(56, 189, 248, 0.16), transparent 45%), url("${STARS_DARK_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto, auto, 120px 120px',
      };
    case 'dots':
      return {
        backgroundColor: '#12121c',
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.32) 1.5px, transparent 1.5px)`,
        backgroundSize: '22px 22px',
      };
    case 'zinc':
      return {
        backgroundColor: '#0d1117',
        backgroundImage: `url("${ISO_DARK_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '50px 86.6px',
      };
    case 'ivory':
      return {
        backgroundColor: '#140f12',
        backgroundImage: `radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.22), transparent 45%), radial-gradient(circle at 15% 85%, rgba(244, 63, 94, 0.16), transparent 45%), linear-gradient(135deg, #1c1012 0%, #150f19 50%, #0d0f17 100%)`,
      };
    case 'terminal':
      return {
        backgroundColor: '#050f08',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12), transparent 60%), linear-gradient(rgba(52, 211, 153, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(52, 211, 153, 0.25) 1px, transparent 1px)`,
        backgroundSize: 'auto, 24px 24px, 24px 24px',
      };
    default:
      return { backgroundColor: '#101014' };
  }
}
