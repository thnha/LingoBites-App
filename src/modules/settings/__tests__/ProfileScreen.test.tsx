import React from 'react';
import {Alert, Linking, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {AppThemeProvider} from '../../../theme';
import {ProfileScreen} from '../ProfileScreen';

const mockNavigate = jest.fn();
const mockClearAllLocalData = jest.fn();

jest.mock('../../../shared/db/LessonRepository', () => ({
  clearAllLocalData: () => mockClearAllLocalData(),
}));

jest.mock('../../../shared/api/appConfig', () => ({
  getSupportEmail: () => 'support@lingobites.app',
}));

const navigation = {
  navigate: mockNavigate,
} as unknown as React.ComponentProps<typeof ProfileScreen>['navigation'];

const route = {
  key: 'ProfileMain',
  name: 'ProfileMain',
  params: undefined,
} as React.ComponentProps<typeof ProfileScreen>['route'];

function renderProfileScreen() {
  return ReactTestRenderer.create(
    <FeatureFlagProvider>
      <AppThemeProvider>
        <ProfileScreen navigation={navigation} route={route} />
      </AppThemeProvider>
    </FeatureFlagProvider>,
  );
}

function findPressableByLabel(
  root: ReactTestRenderer.ReactTestInstance,
  label: string,
) {
  const textNode = root
    .findAllByType(Text)
    .find(node => node.props.children === label);

  let current = textNode?.parent;
  while (current && typeof current.props.onPress !== 'function') {
    current = current.parent;
  }

  return current;
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockClearAllLocalData.mockReset();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows default Beginner level (TC-022)', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = renderProfileScreen();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Beginner');
    expect(text).toContain('Chuỗi 5 ngày');
  });

  it('opens privacy detail screen (FR-SET-004)', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = renderProfileScreen();
    });

    const privacyLink = findPressableByLabel(tree!.root, 'Quyền riêng tư');

    await ReactTestRenderer.act(async () => {
      privacyLink?.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('PrivacyNote');
  });

  it('opens support mailto from help row', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = renderProfileScreen();
    });

    const supportLink = findPressableByLabel(tree!.root, 'Trợ giúp & góp ý');

    await ReactTestRenderer.act(async () => {
      supportLink?.props.onPress();
    });

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('mailto:support@lingobites.app'),
    );
  });
});
