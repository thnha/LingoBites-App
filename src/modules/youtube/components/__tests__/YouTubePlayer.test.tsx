import React from 'react';
import renderer from 'react-test-renderer';
import { YouTubePlayer } from '../YouTubePlayer';

// Mock react-native-youtube-iframe
jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props, ref) => <View testID="youtube-iframe" {...props} ref={ref} />);
});

describe('YouTubePlayer', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<YouTubePlayer videoId="dQw4w9WgXcQ" />).toJSON();
    expect(tree).toBeTruthy();
  });
});
