import { Platform } from 'react-native';
import { createRequestId } from './requestId';
import { getAppConfig } from './appConfig';
import { NETWORK_LOST_MESSAGE, OCR_FAILED_MESSAGE } from '../copy/userMessages';
import type {
  ApiErrorBody,
  OCRImageInput,
  OCRSuccessBody,
  OCRTextResult,
} from './types';

function mapOcrErrorToMessage(code: string, serverMessage?: string): string {
  switch (code) {
    case 'OCR_NO_TEXT':
    case 'OCR_PROVIDER_ERROR':
      return OCR_FAILED_MESSAGE;
    case 'IMAGE_TOO_LARGE':
      return serverMessage?.trim() || OCR_FAILED_MESSAGE;
    default:
      return serverMessage?.trim() || OCR_FAILED_MESSAGE;
  }
}

function isFailedBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    (body as ApiErrorBody).status === 'failed'
  );
}

function isSuccessBody(body: unknown): body is OCRSuccessBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    (body as OCRSuccessBody).status === 'success' &&
    'extracted_text' in body
  );
}

export async function extractTextFromImage(
  image: OCRImageInput,
): Promise<OCRTextResult> {
  const { apiBaseUrl } = getAppConfig();
  const requestId = createRequestId();
  const platform =
    Platform.OS === 'ios'
      ? 'ios'
      : Platform.OS === 'android'
      ? 'android'
      : undefined;

  const formData = new FormData();
  formData.append('request_id', requestId);
  formData.append('source_type', image.sourceType);
  if (platform) {
    formData.append('platform', platform);
  }
  formData.append('app_version', '0.1.0');
  if (image.width) {
    formData.append('image_width', String(image.width));
  }
  if (image.height) {
    formData.append('image_height', String(image.height));
  }

  formData.append('image', {
    uri: image.uri,
    name: image.fileName ?? 'image.jpg',
    type: image.type ?? 'image/jpeg',
  } as unknown as Blob);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/v1/ocr`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    };
  }

  if (!response.ok || isFailedBody(body)) {
    const errorBody = isFailedBody(body) ? body : undefined;
    const code = errorBody?.error.code ?? 'OCR_PROVIDER_ERROR';
    return {
      ok: false,
      errorCode: code,
      message: mapOcrErrorToMessage(code, errorBody?.error.message),
      retryable: errorBody?.retryable,
    };
  }

  if (!isSuccessBody(body)) {
    return {
      ok: false,
      errorCode: 'OCR_PROVIDER_ERROR',
      message: OCR_FAILED_MESSAGE,
    };
  }

  return {
    ok: true,
    extractedText: body.extracted_text,
    ocrRawText: body.ocr_raw_text,
    warnings: body.warnings ?? [],
    quality: body.quality,
  };
}
