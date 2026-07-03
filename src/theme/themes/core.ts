import {fontSize, gutter, typographyPresets} from '../tokens';
import type {AppTheme} from '../types';

// Ported from LingoScan standalone [data-theme="core"]: clean blue, cool
// off-white surfaces, soft blurred shadows, generously rounded corners.
const handoffSpacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 48};

export const coreTheme: AppTheme = {
  id: 'core',
  name: 'Core',
  colors: {
    background: '#f9f9ff',
    surface: '#ffffff',
    surfaceMuted: '#f0f3ff',
    surfaceLow: '#f0f3ff',
    surfaceContainer: '#e7eefe',
    surfaceHigh: '#e2e8f8',
    border: '#c2c6d6',
    outline: '#727785',
    outlineVariant: '#c2c6d6',
    primary: '#0058be',
    primaryPressed: '#00489c',
    primaryContainer: '#2170e4',
    onPrimaryContainer: '#fefcff',
    secondary: '#0058be',
    secondaryContainer: '#10b981',
    secondarySoft: 'rgba(16,185,129,0.16)',
    onSecondaryContainer: '#063d2c',
    tertiary: '#765700',
    tertiaryContainer: '#956e00',
    tertiaryFixed: '#fbbf24',
    tertiarySoft: 'rgba(251,191,36,0.22)',
    onTertiaryContainer: '#5c4300',
    accent: '#2170e4',
    accentInk: '#ffffff',
    accentSoft: 'rgba(33,112,228,0.12)',
    danger: '#ba1a1a',
    text: {
      primary: '#151c27',
      secondary: '#424754',
      inverse: '#ffffff',
      muted: '#727785',
    },
  },
  states: {disabledOpacity: 0.38, pressedOpacity: 0.85},
  typography: {
    fontFamily: {},
    size: {...fontSize},
    weight: {regular: '400', medium: '600', bold: '700'},
    presets: {...typographyPresets},
  },
  gutter,
  spacing: {...handoffSpacing},
  radius: {sm: 10, md: 14, lg: 16, xl: 20, pill: 999},
  shadow: {
    soft: {
      shadowColor: '#141c32',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 2,
    },
    medium: {
      shadowColor: '#141c32',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.09,
      shadowRadius: 26,
      elevation: 4,
    },
    strong: {
      shadowColor: '#2170e4',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.24,
      shadowRadius: 22,
      elevation: 6,
    },
  },
  components: {
    button: {
      primary: {background: '#2170e4', text: '#ffffff', height: 52, radius: 16},
      secondary: {
        background: 'transparent',
        text: '#0058be',
        border: '#c2c6d6',
        height: 48,
        radius: 16,
      },
    },
    card: {background: '#ffffff', radius: 16, padding: 16, shadow: 'soft'},
    input: {
      background: '#ffffff',
      text: '#151c27',
      placeholder: '#727785',
      border: '#c2c6d6',
      radius: 14,
    },
  },
};
