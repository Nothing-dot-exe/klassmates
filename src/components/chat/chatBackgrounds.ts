export interface ChatBackgroundOption {
  id: string;
  name: string;
  description: string;
  previewClass: string;
  containerStyle: React.CSSProperties;
}

// Crisp subtle classroom & coding doodle SVG data URI for light canvas
const DOODLE_LIGHT_SVG = `data:image/svg+xml;utf8,<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(0,0,0,0.05)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 25 L35 25 M15 32 L30 32 M10 15 L40 15 L40 42 L10 42 Z"/><path d="M68 18 L76 10 L84 18 L76 26 Z M76 26 L76 34"/><path d="M96 16 L104 24 L96 32"/><path d="M112 16 L104 24 L112 32"/><path d="M18 70 C18 64 28 64 28 70 C28 74 24 76 23 79 L23 81 M23 86 L23 87"/><path d="M60 62 L74 62 L74 86 L60 86 Z M64 70 L70 70 M64 76 L70 76"/><path d="M94 65 C94 58 108 58 108 65 C108 72 98 75 98 75 L98 80"/><path d="M22 104 L34 104 M28 98 L28 110"/><path d="M72 102 C82 96 90 106 100 100"/></svg>`;
const DOODLE_DARK_SVG = `data:image/svg+xml;utf8,<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="rgba(255,255,255,0.04)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 25 L35 25 M15 32 L30 32 M10 15 L40 15 L40 42 L10 42 Z"/><path d="M68 18 L76 10 L84 18 L76 26 Z M76 26 L76 34"/><path d="M96 16 L104 24 L96 32"/><path d="M112 16 L104 24 L112 32"/><path d="M18 70 C18 64 28 64 28 70 C28 74 24 76 23 79 L23 81 M23 86 L23 87"/><path d="M60 62 L74 62 L74 86 L60 86 Z M64 70 L70 70 M64 76 L70 76"/><path d="M94 65 C94 58 108 58 108 65 C108 72 98 75 98 75 L98 80"/><path d="M22 104 L34 104 M28 98 L28 110"/><path d="M72 102 C82 96 90 106 100 100"/></svg>`;

export const CHAT_BACKGROUNDS: ChatBackgroundOption[] = [
  {
    id: 'minimal',
    name: 'Default Canvas',
    description: 'Crisp distraction-free workspace (Pure White in Day, VS Code #1e1e1e in Dark)',
    previewClass: 'from-zinc-100 to-zinc-900 border border-zinc-400',
    containerStyle: {
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'doodle',
    name: 'Notebook Doodles',
    description: 'Delicate study notes, geometry & code icons',
    previewClass: 'from-zinc-100 to-zinc-800 border border-zinc-400',
    containerStyle: {
      backgroundColor: '#fafafa',
      backgroundImage: `url("${DOODLE_LIGHT_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '160px 160px',
    },
  },
  {
    id: 'grid',
    name: 'Drafting Grid',
    description: 'Technical grid blueprint for organized discussions',
    previewClass: 'from-zinc-200 to-zinc-800 border border-zinc-400',
    containerStyle: {
      backgroundColor: '#fafafa',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
      backgroundSize: '24px 24px, 24px 24px',
    },
  },
  {
    id: 'dots',
    name: 'Dot Matrix',
    description: 'Minimalist bullet journal pattern for focus',
    previewClass: 'from-zinc-100 to-zinc-700 border border-zinc-400',
    containerStyle: {
      backgroundColor: '#ffffff',
      backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'ivory',
    name: 'Warm Tone',
    description: 'Soft, relaxing tone easy on the eyes',
    previewClass: 'from-amber-100 to-stone-800 border border-zinc-300',
    containerStyle: {
      backgroundColor: '#fcfbfa',
    },
  },
  {
    id: 'zinc',
    name: 'VS Code Editor Solid',
    description: 'Pure neutral tone matching editor panels',
    previewClass: 'from-zinc-200 to-zinc-900 border border-zinc-400',
    containerStyle: {
      backgroundColor: '#f4f4f5',
    },
  },
];

export function getThemedBackgroundStyle(id: string, isDark: boolean): React.CSSProperties {
  if (!isDark) {
    const bg = CHAT_BACKGROUNDS.find((b) => b.id === id) || CHAT_BACKGROUNDS[0];
    return bg.containerStyle;
  }

  // Obsidian Night Mode styles
  switch (id) {
    case 'minimal':
      return { backgroundColor: '#0B0E17' };
    case 'doodle':
      return {
        backgroundColor: '#0B0E17',
        backgroundImage: `url("${DOODLE_DARK_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '160px 160px',
      };
    case 'grid':
      return {
        backgroundColor: '#0B0E17',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)`,
        backgroundSize: '24px 24px, 24px 24px',
      };
    case 'dots':
      return {
        backgroundColor: '#0B0E17',
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    case 'ivory':
      return { backgroundColor: '#0B0E17' };
    case 'zinc':
      return { backgroundColor: '#121826' };
    default:
      return { backgroundColor: '#0B0E17' };
  }
}
