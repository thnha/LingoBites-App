import glyphmap from 'react-native-vector-icons/glyphmaps/MaterialIcons.json';

/**
 * Handoff icon names used by MaterialIcon / IconButton.
 * After adding a name here, run: `npm run icons:subset` then `npm run assets:link`.
 */

/** Handoff Material Symbols names used in the app (snake_case). */
export const HANDOFF_ICONS = [
  'add_photo_alternate',
  'arrow_back',
  'article',
  'auto_awesome',
  'auto_stories',
  'bolt',
  'bookmark',
  'bookmark_add',
  'chevron_left',
  'chevron_right',
  'circle',
  'close',
  'content_paste',
  'delete',
  'description',
  'document_scanner',
  'edit',
  'emoji_events',
  'fitness_center',
  'flag',
  'format_quote',
  'function',
  'help',
  'history_edu',
  'home',
  'info',
  'language',
  'lightbulb',
  'local_fire_department',
  'menu_book',
  'mic',
  'notifications',
  'person',
  'photo_camera',
  'play_circle',
  'psychology',
  'restaurant_menu',
  'rule',
  'schedule',
  'school',
  'search',
  'sell',
  'settings',
  'share',
  'shield',
  'smartphone',
  'style',
  'subtitles',
  'tips_and_updates',
  'translate',
  'upload_file',
  'visibility',
  'volume_up',
] as const;

export type HandoffIconName = (typeof HANDOFF_ICONS)[number];

/**
 * Handoff names that differ from MaterialIcons kebab-case auto-mapping.
 * Most icons only need `name.replace(/_/g, '-')`.
 */
const ICON_ALIASES: Partial<Record<HandoffIconName, string>> = {
  add_photo_alternate: 'add-photo-alternate',
  arrow_back: 'arrow-back',
  auto_stories: 'auto-stories',
  bookmark_add: 'bookmark-add',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  content_paste: 'content-paste',
  document_scanner: 'document-scanner',
  emoji_events: 'emoji-events',
  fitness_center: 'fitness-center',
  format_quote: 'format-quote',
  history_edu: 'history-edu',
  local_fire_department: 'local-fire-department',
  menu_book: 'menu-book',
  photo_camera: 'photo-camera',
  play_circle: 'play-circle',
  restaurant_menu: 'restaurant-menu',
  tips_and_updates: 'tips-and-updates',
  upload_file: 'upload-file',
  volume_up: 'volume-up',
};

/** Handoff names with no MaterialIcons glyph — map to the closest match. */
const ICON_FALLBACKS: Partial<Record<HandoffIconName, string>> = {
  function: 'functions',
};

export function resolveHandoffIconName(name: HandoffIconName): string {
  return ICON_FALLBACKS[name] ?? ICON_ALIASES[name] ?? name.replace(/_/g, '-');
}

export function isValidMaterialIconGlyph(glyph: string): boolean {
  return Object.prototype.hasOwnProperty.call(glyphmap, glyph);
}
