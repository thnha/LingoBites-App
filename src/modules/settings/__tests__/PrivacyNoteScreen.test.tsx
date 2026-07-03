import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {AppThemeProvider} from '../../../theme';
import {PrivacyNoteScreen} from '../PrivacyNoteScreen';
import {PRIVACY_NOTE_BODY} from '../privacyCopy';

describe('PrivacyNoteScreen', () => {
  it('shows canonical in-app privacy note copy', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <PrivacyNoteScreen />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain(PRIVACY_NOTE_BODY);
    expect(text).toContain('Quyền riêng tư');
  });
});
