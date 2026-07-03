import type {RadiusScale, SixStep} from './types';

export const spacing: SixStep = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32};

export const radius: RadiusScale = {sm: 6, md: 8, lg: 12, xl: 20, pill: 999};

export const fontSize: SixStep = {xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 30};

export const fontWeight = {
  regular: '400',
  medium: '600',
  bold: '800',
} as const;

export const typographyPresets = {
  display: {fontSize: 32, lineHeight: 38, fontWeight: '700' as const},
  h1: {fontSize: 28, lineHeight: 34, fontWeight: '700' as const},
  h2: {fontSize: 22, lineHeight: 28, fontWeight: '600' as const},
  h3: {fontSize: 18, lineHeight: 24, fontWeight: '600' as const},
  bodyLg: {fontSize: 18, lineHeight: 28, fontWeight: '500' as const},
  body: {fontSize: 16, lineHeight: 24, fontWeight: '500' as const},
  label: {fontSize: 14, lineHeight: 18, fontWeight: '600' as const},
  caption: {fontSize: 12, lineHeight: 16, fontWeight: '600' as const},
};

export const gutter = 16;
