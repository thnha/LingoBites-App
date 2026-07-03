import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFeatureFlags} from '../release';
import {
  defaultThemeId,
  isThemeId,
  themeReleaseFlag,
  themes,
  type ThemeId,
} from './themeRegistry';
import {getSavedThemeId, saveThemeId} from './themeStorage';
import {ThemeContext} from './useAppTheme';

type Props = {children: React.ReactNode};

export function AppThemeProvider({children}: Props) {
  const {isFeatureEnabled} = useFeatureFlags();
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultThemeId);

  const isThemeAllowed = useCallback(
    (id: ThemeId) => {
      const flag = themeReleaseFlag[id];
      return flag === undefined || isFeatureEnabled(flag);
    },
    [isFeatureEnabled],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await getSavedThemeId();
      if (!active) {
        return;
      }
      if (saved !== null && isThemeId(saved) && isThemeAllowed(saved)) {
        setThemeIdState(saved);
      } else {
        setThemeIdState(defaultThemeId);
      }
    })();
    return () => {
      active = false;
    };
  }, [isThemeAllowed]);

  const setThemeId = useCallback(
    (id: ThemeId) => {
      if (!isThemeId(id) || !isThemeAllowed(id)) {
        return;
      }
      setThemeIdState(id);
      void saveThemeId(id);
    },
    [isThemeAllowed],
  );

  const value = useMemo(
    () => ({theme: themes[themeId], themeId, setThemeId}),
    [themeId, setThemeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
