import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '../../release';
import {AppThemeProvider} from '../ThemeProvider';
import {THEME_STORAGE_KEY} from '../themeStorage';
import {useAppTheme} from '../useAppTheme';

function ThemeProbe() {
  const {themeId, setThemeId} = useAppTheme();
  return (
    <Text onPress={() => setThemeId('dark')} testID="probe">
      {themeId}
    </Text>
  );
}

async function renderWithProviders() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName="theme-release">
        <AppThemeProvider>
          <ThemeProbe />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree;
}

describe('AppThemeProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('useAppTheme throws outside the provider', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let caught: Error | undefined;

    class TestBoundary extends React.Component<
      {children: React.ReactNode},
      {error: Error | null}
    > {
      state = {error: null as Error | null};

      static getDerivedStateFromError(error: Error) {
        return {error};
      }

      render() {
        if (this.state.error) {
          caught = this.state.error;
          return null;
        }
        return this.props.children;
      }
    }

    await act(async () => {
      ReactTestRenderer.create(
        <FeatureFlagProvider>
          <TestBoundary>
            <ThemeProbe />
          </TestBoundary>
        </FeatureFlagProvider>,
      );
    });

    expect(caught?.message).toContain(
      'useAppTheme must be used within an AppThemeProvider',
    );
    consoleSpy.mockRestore();
  });

  it('defaults to pastel-kids when nothing is persisted', async () => {
    const tree = await renderWithProviders();
    expect(tree.root.findByProps({testID: 'probe'}).props.children).toBe('pastel-kids');
  });

  it('restores a valid persisted theme on mount', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const tree = await renderWithProviders();
    expect(tree.root.findByProps({testID: 'probe'}).props.children).toBe('dark');
  });

  it('falls back to pastel-kids for an unknown/removed persisted id', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'ocean-removed');
    const tree = await renderWithProviders();
    expect(tree.root.findByProps({testID: 'probe'}).props.children).toBe('pastel-kids');
  });

  it('setThemeId updates context and persists', async () => {
    const tree = await renderWithProviders();
    await act(async () => {
      tree.root.findByProps({testID: 'probe'}).props.onPress();
    });
    expect(tree.root.findByProps({testID: 'probe'}).props.children).toBe('dark');
    expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });
});
