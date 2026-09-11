import {parseYouTubeVideoId} from '../youtubeApi';

const VIDEO_ID = 'dQw4w9WgXcQ';

describe('parseYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://youtu.be/dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', VIDEO_ID],
    ['https://music.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.music.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube-nocookie.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', VIDEO_ID],
  ])('parses %s', (url, expected) => {
    expect(parseYouTubeVideoId(url)).toBe(expected);
  });

  it('rejects invalid ids and hosts', () => {
    expect(parseYouTubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ')).toBe(
      null,
    );
    expect(parseYouTubeVideoId('not-a-url')).toBe(null);
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=tooshort')).toBe(
      null,
    );
  });
});
