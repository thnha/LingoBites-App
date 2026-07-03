import {extractText} from '../OCRService';

jest.mock('../../../shared/api/appConfig', () => ({
  getAppConfig: () => ({
    apiBaseUrl: 'http://localhost:3001',
    useMockAi: true,
    useMockOcr: true,
  }),
}));

jest.mock('../../analytics', () => ({
  trackEvent: jest.fn(),
  getTextLengthBucket: () => '101-500',
}));

describe('OCRService', () => {
  it('uses mock OCR path when USE_MOCK_OCR is true', async () => {
    const result = await extractText({
      uri: 'file:///sample.jpg',
      sourceType: 'camera',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.extractedText.length).toBeGreaterThan(0);
    }
  });

  it('returns OCR_NO_TEXT for mock no-text marker', async () => {
    const result = await extractText({
      uri: 'file:///no-text.jpg',
      sourceType: 'gallery',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorCode).toBe('OCR_NO_TEXT');
    }
  });
});
