import {fontSize, gutter, typographyPresets} from '../tokens';
import type {AppTheme} from '../types';

// Ported from LingoScan standalone [data-theme="comic"]: comic-book ink. Warm
// paper, bold blue + red, near-black 3px borders, hard offset shadows, modest
// rounding.
const handoffSpacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 48};

export const comicTheme: AppTheme = {
  id: 'comic',
  name: 'Comic',
  colors: {
    background: '#fbf9f1',
    surface: '#ffffff',
    surfaceMuted: '#f5f4ec',
    surfaceLow: '#f5f4ec',
    surfaceContainer: '#f0eee6',
    surfaceHigh: '#eae8e0',
    border: '#1a1a1a',
    outline: '#1a1a1a',
    outlineVariant: '#1a1a1a',
    primary: '#004ccb',
    primaryPressed: '#003ea6',
    primaryContainer: '#2b65ec',
    onPrimaryContainer: '#f2f2ff',
    secondary: '#ae2f34',
    secondaryContainer: '#ff6b6b',
    secondarySoft: 'rgba(255,107,107,0.16)',
    onSecondaryContainer: '#6d0010',
    tertiary: '#695f00',
    tertiaryContainer: '#bdad00',
    tertiaryFixed: '#f7e542',
    tertiarySoft: 'rgba(247,229,66,0.22)',
    onTertiaryContainer: '#474000',
    accent: '#2b65ec',
    accentInk: '#ffffff',
    accentSoft: '#dbe1ff',
    danger: '#ba1a1a',
    text: {
      primary: '#1b1c17',
      secondary: '#434655',
      inverse: '#ffffff',
      muted: '#434655',
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
  radius: {sm: 8, md: 12, lg: 14, xl: 14, pill: 999},
  shadow: {
    soft: {
      shadowColor: '#1a1a1a',
      shadowOffset: {width: 2, height: 2},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    medium: {
      shadowColor: '#1a1a1a',
      shadowOffset: {width: 4, height: 4},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    strong: {
      shadowColor: '#1a1a1a',
      shadowOffset: {width: 6, height: 6},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  },
  components: {
    button: {
      primary: {background: '#2b65ec', text: '#ffffff', height: 50, radius: 12},
      secondary: {
        background: '#ffffff',
        text: '#1b1c17',
        border: '#1a1a1a',
        height: 48,
        radius: 12,
      },
    },
    card: {background: '#ffffff', radius: 12, padding: 16, shadow: 'medium'},
    input: {
      background: '#ffffff',
      text: '#1b1c17',
      placeholder: '#434655',
      border: '#1a1a1a',
      radius: 12,
    },
  },
};
