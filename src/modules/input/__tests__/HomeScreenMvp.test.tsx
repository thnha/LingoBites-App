import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider, type ReleaseConfigName} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {HomeScreen} from '../HomeScreen';

const MVP = 'lingobites-mvp';
const STANDARD = 'situation-learning-release';

function navigation(tabNavigate = jest.fn()) {
  return {
    navigate: jest.fn(),
    getParent: () => ({navigate: tabNavigate}),
  };
}

function textContents(root: ReactTestRenderer.ReactTestInstance): string[] {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter(child => typeof child === 'string');
}

async function renderHome(
  nav = navigation(),
  releaseName: ReleaseConfigName = STANDARD,
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName={releaseName}>
        <AppThemeProvider>
          <HomeScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

describe('HomeScreen legacy ingestion CTAs', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows capture/upload/paste CTAs in standard mode', async () => {
    const tree = await renderHome();

    expect(
      tree.root.findAllByProps({testID: 'mvp-no-content-card'}),
    ).toHaveLength(0);
    const texts = textContents(tree.root);
    expect(texts).toContain('Chụp ảnh học ngay');
    expect(texts).toContain('Upload ảnh');
    expect(texts).toContain('Dán text');
  });

  it('hides capture/upload/paste CTAs and shows the MVP content card in MVP mode', async () => {
    const tree = await renderHome(navigation(), MVP);

    expect(
      tree.root.findAll(node => node.props.testID === 'mvp-no-content-card')
        .length,
    ).toBeGreaterThan(0);
    const texts = textContents(tree.root);
    expect(texts).not.toContain('Chụp ảnh học ngay');
    expect(texts).not.toContain('Upload ảnh');
    expect(texts).not.toContain('Dán text');
    expect(texts).toContain('Ôn tập với nội dung đã lưu');
    expect(texts).toContain(
      'Bản dùng thử này ôn tập từ các bài học và thẻ ghi nhớ đã được lưu sẵn trên thiết bị của bạn. Mở tab Bài học để chọn nội dung đã lưu.',
    );
  });

  it('explains that the MVP reviews already-saved lessons when no lessons exist', async () => {
    const tree = await renderHome(navigation(), MVP);

    const texts = textContents(tree.root);
    expect(texts).toContain(
      'Chưa có bài học được lưu trên máy. Bản dùng thử này ôn tập dựa trên bài học và thẻ đã được lưu sẵn.',
    );
  });

  it('does not advertise OCR/paste tips in MVP mode', async () => {
    const tree = await renderHome(navigation(), MVP);

    expect(textContents(tree.root)).not.toContain(
      'Mẹo: chụp text rõ, đủ sáng để OCR chính xác hơn.',
    );
  });

  it('opens the Lessons tab from the MVP content card', async () => {
    const tabNavigate = jest.fn();
    const nav = navigation(tabNavigate);
    const tree = await renderHome(nav, MVP);

    const openLessons = tree.root.findAllByProps({
      testID: 'mvp-open-lessons',
    })[0];
    expect(openLessons).toBeTruthy();

    await act(async () => {
      openLessons?.props.onPress();
    });

    expect(tabNavigate).toHaveBeenCalledWith('Lessons');
    expect(nav.navigate).not.toHaveBeenCalledWith('ImageCapture');
    expect(nav.navigate).not.toHaveBeenCalledWith('PasteText');
  });
});
