import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {HomeScreen} from '../HomeScreen';

function navigation(tabNavigate = jest.fn()) {
  return {navigate: jest.fn(), getParent: () => ({navigate: tabNavigate})};
}

async function renderHome(nav = navigation()) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName="situation-learning-release">
        <AppThemeProvider>
          <HomeScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

describe('HomeScreen Option C', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('renders the four full-card shortcuts and the coming-soon banner', async () => {
    const tree = await renderHome();
    expect(
      tree.root.findAll(node => node.props.testID === 'home-shortcut-review')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-shortcut-speaking')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-shortcut-quick')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-shortcut-library')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({
        children: 'Học từ ảnh hoặc văn bản · Sắp ra mắt',
      }).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({children: 'Chụp ảnh học ngay'}).length,
    ).toBe(0);
  });

  it('routes shortcut actions to their existing destinations', async () => {
    const tabNavigate = jest.fn();
    const nav = navigation(tabNavigate);
    const tree = await renderHome(nav);
    await act(async () =>
      tree.root
        .findAll(node => node.props.testID === 'home-shortcut-review')
        .find(node => typeof node.props.onPress === 'function')
        ?.props.onPress(),
    );
    expect(nav.navigate).toHaveBeenCalledWith('DailyReview');
    await act(async () =>
      tree.root
        .findAll(node => node.props.testID === 'home-shortcut-speaking')
        .find(node => typeof node.props.onPress === 'function')
        ?.props.onPress(),
    );
    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'SpeakingRoom',
    });
    await act(async () =>
      tree.root
        .findAll(node => node.props.testID === 'home-shortcut-library')
        .find(node => typeof node.props.onPress === 'function')
        ?.props.onPress(),
    );
    expect(tabNavigate).toHaveBeenCalledWith('Lessons');
  });
});
