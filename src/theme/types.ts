import type {ViewStyle} from 'react-native';

export type FontWeight = '400' | '500' | '600' | '700' | '800';

export type TypographyPreset = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
};

export type ColorScale = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceLow: string;
  surfaceContainer: string;
  surfaceHigh: string;
  border: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  primaryPressed: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  secondarySoft: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  tertiaryFixed: string;
  tertiarySoft: string;
  onTertiaryContainer: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  danger: string;
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    muted: string;
  };
};

export type SixStep = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type RadiusScale = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
};

export type ShadowScale = {
  soft: ViewStyle;
  medium: ViewStyle;
  strong: ViewStyle;
};

export type AppTheme = {
  id: string;
  name: string;
  colors: ColorScale;
  states: {disabledOpacity: number; pressedOpacity: number};
  typography: {
    fontFamily: {primary?: string; display?: string};
    size: SixStep;
    weight: {regular: '400'; medium: '600'; bold: FontWeight};
    presets: {
      display: TypographyPreset;
      h1: TypographyPreset;
      h2: TypographyPreset;
      h3: TypographyPreset;
      bodyLg: TypographyPreset;
      body: TypographyPreset;
      label: TypographyPreset;
      caption: TypographyPreset;
    };
  };
  gutter: number;
  spacing: SixStep;
  radius: RadiusScale;
  shadow: ShadowScale;
  components: {
    button: {
      primary: {background: string; text: string; height: number; radius: number};
      secondary: {
        background: string;
        text: string;
        border: string;
        height: number;
        radius: number;
      };
    };
    card: {
      background: string;
      radius: number;
      padding: number;
      shadow: keyof ShadowScale;
    };
    input: {
      background: string;
      text: string;
      placeholder: string;
      border: string;
      radius: number;
    };
  };
};
