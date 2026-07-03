import {Platform} from 'react-native';
import {createRequestId} from './requestId';
import type {AnalyzeTextResult} from '../../modules/ai-analysis/types';
import {
  AI_ANALYSIS_FAILED_MESSAGE,
  EMPTY_INPUT_MESSAGE,
  NETWORK_LOST_MESSAGE,
  TEXT_TOO_LONG_MESSAGE,
} from '../copy/userMessages';
import {validateAIOutput} from '../schemas/ai-output-v1';
import {getAppConfig} from './appConfig';
import type {
  AIAnalyzeSuccessBody,
  AnalyzeTextRequestBody,
  ApiErrorBody,
} from './types';

const DEFAULT_PROMPT_VERSION = 'lesson-analysis-v1';
const DEFAULT_LEVEL = 'Beginner';

function mapApiErrorToMessage(code: string, serverMessage?: string): string {
  switch (code) {
    case 'VALIDATION_EMPTY_TEXT':
      return EMPTY_INPUT_MESSAGE;
    case 'VALIDATION_TEXT_TOO_LONG':
      return TEXT_TOO_LONG_MESSAGE;
    case 'AI_INVALID_OUTPUT':
    case 'AI_PROVIDER_ERROR':
    case 'AI_TIMEOUT':
      return AI_ANALYSIS_FAILED_MESSAGE;
    default:
      return serverMessage?.trim() || AI_ANALYSIS_FAILED_MESSAGE;
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

function isSuccessBody(body: unknown): body is AIAnalyzeSuccessBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    (body as AIAnalyzeSuccessBody).status === 'success' &&
    'data' in body
  );
}

function buildRequestBody(
  confirmedText: string,
  sourceType: AnalyzeTextRequestBody['source_type'] = 'paste_text',
): AnalyzeTextRequestBody {
  const platform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : undefined;

  return {
    request_id: createRequestId(),
    confirmed_text: confirmedText,
    level: DEFAULT_LEVEL,
    native_language: 'Vietnamese',
    source_type: sourceType,
    prompt_version: DEFAULT_PROMPT_VERSION,
    client_context: platform ? {platform} : undefined,
  };
}

export async function analyzeTextWithApi(
  confirmedText: string,
  sourceType: AnalyzeTextRequestBody['source_type'] = 'paste_text',
): Promise<AnalyzeTextResult> {
  const {apiBaseUrl} = getAppConfig();
  const requestBody = buildRequestBody(confirmedText, sourceType);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/v1/ai/analyze`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
    const code = errorBody?.error.code ?? 'AI_PROVIDER_ERROR';
    return {
      ok: false,
      errorCode: code,
      message: mapApiErrorToMessage(code, errorBody?.error.message),
    };
  }

  if (!isSuccessBody(body)) {
    return {
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    };
  }

  const validation = validateAIOutput(body.data);
  if (!validation.valid) {
    return {
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    };
  }

  return {ok: true, lesson: validation.data};
}
