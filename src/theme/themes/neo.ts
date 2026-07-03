import {fontSize, gutter, typographyPresets} from '../tokens';
import type {AppTheme} from '../types';

// Ported from LingoScan standalone [data-theme="neo"]: neo-brutalism. Cream
// paper, violet accent, hard black borders, square corners, hard offset
// shadows (no blur).
const handoffSpacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 48};

export const neoTheme: AppTheme = {
  id: 'neo',
  name: 'Neo',
  colors: {
    background: '#fdf9e9',
    surface: '#ffffff',
    surfaceMuted: '#f8f4e4',
    surfaceLow: '#f8f4e4',
    surfaceContainer: '#f2eede',
    surfaceHigh: '#ece8d9',
    border: '#000000',
    outline: '#000000',
    outlineVariant: '#000000',
    primary: '#630ed4',
    primaryPressed: '#4f0bab',
    primaryContainer: '#7c3aed',
    onPrimaryContainer: '#ede0ff',
    secondary: '#630ed4',
    secondaryContainer: '#1c1c13',
    secondarySoft: 'rgba(28,28,19,0.12)',
    onSecondaryContainer: '#ffffff',
    tertiary: '#574500',
    tertiaryContainer: '#facc15',
    tertiaryFixed: '#facc15',
    tertiarySoft: 'rgba(250,204,21,0.22)',
    onTertiaryContainer: '#231b00',
    accent: '#7c3aed',
    accentInk: '#ffffff',
    accentSoft: '#ede0ff',
    danger: '#ba1a1a',
    text: {
      primary: '#1c1c13',
      secondary: '#3a3540',
      inverse: '#ffffff',
      muted: '#3a3540',
    },
  },
  states: {disabledOpacity: 0.4, pressedOpacity: 0.9},
  typography: {
    fontFamily: {},
    size: {...fontSize},
    weight: {regular: '400', medium: '600', bold: '800'},
    presets: {...typographyPresets},
  },
  gutter,
  spacing: {...handoffSpacing},
  radius: {sm: 0, md: 0, lg: 0, xl: 0, pill: 0},
  shadow: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: {width: 3, height: 3},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: {width: 5, height: 5},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000000',
      shadowOffset: {width: 8, height: 8},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  },
  components: {
    button: {
      primary: {background: '#7c3aed', text: '#ffffff', height: 52, radius: 0},
      secondary: {
        background: '#ffffff',
        text: '#1c1c13',
        border: '#000000',
        height: 48,
        radius: 0,
      },
    },
    card: {background: '#ffffff', radius: 0, padding: 16, shadow: 'medium'},
    input: {
      background: '#ffffff',
      text: '#1c1c13',
      placeholder: '#3a3540',
      border: '#000000',
      radius: 0,
    },
  },
};
