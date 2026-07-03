import {OCR_FAILED_MESSAGE} from '../../copy/userMessages';
import {extractTextFromImage} from '../ocrClient';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('extractTextFromImage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns extracted text on success envelope', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        request_id: '00000000-0000-0000-0000-000000000001',
        status: 'success',
        provider: 'mock',
        ocr_raw_text: 'Hello world',
        extracted_text: 'Hello world',
        quality: {
          text_length: 11,
          text_length_bucket: '1-100',
          line_count: 1,
          has_english_signal: true,
          low_confidence: false,
        },
        warnings: [],
      }),
    });

    const result = await extractTextFromImage({
      uri: 'file:///sample.jpg',
      sourceType: 'gallery',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.extractedText).toBe('Hello world');
    }

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/v1/ocr',
      expect.objectContaining({method: 'POST'}),
    );
  });

  it('returns friendly error for OCR_NO_TEXT', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        request_id: '00000000-0000-0000-0000-000000000002',
        status: 'failed',
        error: {
          code: 'OCR_NO_TEXT',
          message: 'No readable text was detected.',
        },
        retryable: true,
      }),
    });

    const result = await extractTextFromImage({
      uri: 'file:///blank.jpg',
      sourceType: 'camera',
    });

    expect(result).toEqual({
      ok: false,
      errorCode: 'OCR_NO_TEXT',
      message: OCR_FAILED_MESSAGE,
      retryable: true,
    });
  });
});
