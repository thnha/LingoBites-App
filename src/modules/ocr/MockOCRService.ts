import {OCR_FAILED_MESSAGE} from '../../shared/copy/userMessages';
import type {OCRImageInput, OCRTextResult} from '../../shared/api/types';

const DEFAULT_MOCK_TEXT =
  'We are offering a special discount for new customers.';

export async function extractTextWithMock(
  image: OCRImageInput,
): Promise<OCRTextResult> {
  if (image.uri.includes('no-text')) {
    return {
      ok: false,
      errorCode: 'OCR_NO_TEXT',
      message: OCR_FAILED_MESSAGE,
      retryable: true,
    };
  }

  return {
    ok: true,
    extractedText: DEFAULT_MOCK_TEXT,
    ocrRawText: DEFAULT_MOCK_TEXT,
    warnings: ['mock_ocr_provider'],
    quality: {
      text_length: DEFAULT_MOCK_TEXT.length,
      text_length_bucket: '1-100',
      line_count: 1,
      has_english_signal: true,
      low_confidence: false,
    },
  };
}
