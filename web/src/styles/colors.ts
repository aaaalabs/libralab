/**
 * EpicWG Color System
 * A sophisticated, premium color palette that balances tech professionalism with living comfort
 * Supports both light and dark modes through CSS variables
 */

// Base color palette
const baseColors = {
  navy: {
    '50': '#F5F7F9',
    '100': '#E1E7EC',
    '200': '#C2CED6',
    '300': '#9BAEBF',
    '400': '#708599',
    '500': '#2E4555', // Our primary navy
    '600': '#243744',
    '700': '#1B2933',
    '800': '#121C22',
    '900': '#090E11',
  },
  copper: {
    '50': '#FBF6F2',
    '100': '#F5E9DE',
    '200': '#EBD3BC',
    '300': '#E1B588', // Our sand color
    '400': '#D09467', // Our primary copper
    '500': '#B87F54',
    '600': '#9A6841',
    '700': '#7D522F',
    '800': '#5F3D1D',
    '900': '#42290B',
  },
  beige: {
    '50': '#FDFCFA',
    '100': '#F9F5EE',
    '200': '#F4E8D6',
    '300': '#EBDBC3', // Our primary beige
    '400': '#D9C4A5',
    '500': '#C7AD87',
    '600': '#B5966A',
    '700': '#997B4C',
    '800': '#735C39',
    '900': '#4D3D26',
  },
  gray: {
    '50': '#F7F7F6',
    '100': '#EBEAE9',
    '200': '#D6D7D4',
    '300': '#ADB1A9',
    '400': '#979C94', // Our primary gray
    '500': '#7A7E76',
    '600': '#5D615A',
    '700': '#40443D',
    '800': '#232721',
    '900': '#121311',
  },
} as const;

// Semantic color mapping for light mode
export const lightColors = {
  // Backgrounds
  background: {
    primary: 'white',
    secondary: baseColors.beige[200],
    tertiary: baseColors.beige[100],
    elevated: 'white',
    dark: baseColors.navy[500],
  },
  // Text
  text: {
    primary: baseColors.navy[500],
    secondary: baseColors.gray[600],
    tertiary: baseColors.gray[400],
    onDark: 'white',
  },
  // Interactive
  interactive: {
    primary: baseColors.copper[400],
    primaryHover: baseColors.copper[500],
    primaryActive: baseColors.copper[600],
    secondary: baseColors.navy[500],
    secondaryHover: baseColors.navy[600],
    secondaryActive: baseColors.navy[700],
  },
  // Borders
  border: {
    light: baseColors.beige[200],
    medium: baseColors.beige[300],
    heavy: baseColors.beige[400],
  },
  // States
  state: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#2196F3',
  },
} as const;

// Semantic color mapping for dark mode
export const darkColors = {
  // Backgrounds
  background: {
    primary: baseColors.navy[800],
    secondary: baseColors.navy[700],
    tertiary: baseColors.navy[600],
    elevated: baseColors.navy[700],
    dark: baseColors.navy[500],
  },
  // Text
  text: {
    primary: baseColors.beige[100],
    secondary: baseColors.gray[300],
    tertiary: baseColors.gray[400],
    onDark: baseColors.beige[100],
  },
  // Interactive
  interactive: {
    primary: baseColors.copper[400],
    primaryHover: baseColors.copper[300],
    primaryActive: baseColors.copper[200],
    secondary: baseColors.beige[300],
    secondaryHover: baseColors.beige[200],
    secondaryActive: baseColors.beige[100],
  },
  // Borders
  border: {
    light: baseColors.navy[600],
    medium: baseColors.navy[500],
    heavy: baseColors.navy[400],
  },
  // States
  state: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#2196F3',
  },
} as const;

// CSS Variables
export const cssVariables = `
  :root {
    ${Object.entries(lightColors).flatMap(([category, values]) =>
      Object.entries(values).map(([key, value]) =>
        `--color-${category}-${key}: ${value};`
      )
    ).join('\n    ')}
  }

  .dark {
    ${Object.entries(darkColors).flatMap(([category, values]) =>
      Object.entries(values).map(([key, value]) =>
        `--color-${category}-${key}: ${value};`
      )
    ).join('\n    ')}
  }
`;

/**
 * Usage Guide:
 * 
 * 1. Import the CSS variables into your global styles:
 *    import { cssVariables } from './colors';
 * 
 * 2. Use the variables in your Tailwind classes:
 *    bg-[var(--color-background-primary)]
 *    text-[var(--color-text-primary)]
 *    border-[var(--color-border-light)]
 * 
 * 3. For interactive elements:
 *    - Primary buttons: bg-[var(--color-interactive-primary)]
 *    - Secondary buttons: bg-[var(--color-interactive-secondary)]
 *    - Hover states use the respective *Hover variables
 * 
 * 4. Dark mode is handled automatically through the .dark class
 *    which is typically controlled by next-themes
 * 
 * Example:
 * <button className="
 *   bg-[var(--color-interactive-primary)]
 *   hover:bg-[var(--color-interactive-primaryHover)]
 *   text-[var(--color-text-onDark)]
 * ">
 *   Click me
 * </button>
 */

// Export base colors for direct access if needed
export const baseColorValues = baseColors;
