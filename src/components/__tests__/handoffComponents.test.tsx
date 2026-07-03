import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '../../release';
import {AppThemeProvider} from '../../theme';
import {themeList} from '../../theme/themeRegistry';
import {ChunkRow} from '../ChunkRow';
import {LessonCard} from '../LessonCard';
import {QuizOption} from '../QuizOption';
import {WordCard} from '../WordCard';

describe('handoff UI components', () => {
  themeList.forEach(theme => {
    it(`renders WordCard, ChunkRow, QuizOption, LessonCard under "${theme.id}"`, async () => {
      await act(async () => {
        ReactTestRenderer.create(
          <FeatureFlagProvider releaseName="theme-release">
            <AppThemeProvider>
              <>
                <WordCard word="hello" meaning="xin chào" />
                <ChunkRow original="Hi" translation="Chào" />
                <QuizOption label="A" />
                <LessonCard lesson={{id: '1', title: 'T', meta: 'meta'}} />
              </>
            </AppThemeProvider>
          </FeatureFlagProvider>,
        );
      });
    });
  });
});
