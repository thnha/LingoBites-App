import type {FeatureKey} from '../release/feature-registry';
import {cartoonTheme} from './themes/cartoon';
import {comicTheme} from './themes/comic';
import {coreTheme} from './themes/core';
import {darkTheme} from './themes/dark';
import {defaultTheme} from './themes/default';
import {neoTheme} from './themes/neo';
import {pastelKidsTheme} from './themes/pastelKids';
import type {AppTheme} from './types';

export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  'pastel-kids': pastelKidsTheme,
  core: coreTheme,
  neo: neoTheme,
  comic: comicTheme,
  cartoon: cartoonTheme,
} satisfies Record<string, AppTheme>;

export type ThemeId = keyof typeof themes;

export const themeIds = Object.keys(themes) as ThemeId[];

export const themeList: AppTheme[] = themeIds.map(id => themes[id]);

export const defaultThemeId: ThemeId = 'pastel-kids';

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && value in themes;

export const themeReleaseFlag: Partial<Record<ThemeId, FeatureKey>> = {
  dark: 'darkTheme',
  'pastel-kids': 'pastelKidsTheme',
  core: 'coreTheme',
  neo: 'neoTheme',
  comic: 'comicTheme',
  cartoon: 'cartoonTheme',
};
