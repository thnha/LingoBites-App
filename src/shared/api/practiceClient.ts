import {getAppConfig} from './appConfig';
import {getLessonToken} from '../security/lessonTokenStore';
import type {PracticeSet} from '../schemas/practice';

export type PracticeConfigInput = {
  types: ('meaning_choice' | 'cloze_choice')[];
  difficulty: string;
  question_count: number;
};

export type CreatePracticeSetResponse =
  | {
      status: 'reused';
      practiceSet: PracticeSet;
    }
  | {
      status: 'generating' | 'ready' | 'generation_failed' | 'invalidated';
      practiceSetId: string;
      pollAfterMs: number;
    }
  | {
      /** Server refused generation (HTTP 422, e.g. lesson not ready or insufficient source). Not a network problem — do not retry blindly. */
      status: 'rejected';
      code: string;
    };

/**
 * Unwraps the Keychain capability token for practice endpoints.
 * Never sends a missing/unreadable token as a header — the server would
 * answer 404 and the UI would only show a generic network error.
 */
async function lessonTokenFor(lessonId: string): Promise<string> {
  const result = await getLessonToken(lessonId);
  if (!result.ok) {
    throw new Error(
      `Failed to load lesson token: ${result.errorCode}`,
    );
  }
  if (!result.token) {
    throw new Error('Missing lesson token for practice request.');
  }
  return result.token;
}

export async function createPracticeSetApi(
  lessonId: string,
  lessonRevision: number,
  config: PracticeConfigInput,
  idempotencyKey: string,
): Promise<CreatePracticeSetResponse> {
  const token = await lessonTokenFor(lessonId);
  const baseUrl = getAppConfig().apiBaseUrl;
  const url = `${baseUrl}/v1/lessons/${lessonId}/practice-sets`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      lesson_revision: lessonRevision,
      config,
    }),
  });

  if (response.status === 200) {
    const data = await response.json();
    return {
      status: 'reused',
      practiceSet: data.practice_set,
    };
  }

  if (response.status === 202) {
    const data = await response.json();
    return {
      status: data.status,
      practiceSetId: data.practice_set_id,
      pollAfterMs: data.poll_after_ms,
    };
  }

  if (response.status === 422) {
    let code = 'UNKNOWN';
    try {
      const data = await response.json();
      if (typeof data?.error?.code === 'string') {
        code = data.error.code;
      }
    } catch {
      // Unreadable body: keep the generic code so callers still
      // distinguish refusal from a transport failure.
    }
    return {status: 'rejected', code};
  }

  throw new Error(`Failed to create practice set: ${response.status}`);
}

export type GetPracticeSetResponse =
  | {
      status: 'ready' | 'generation_failed';
      practiceSet: PracticeSet;
    }
  | {
      status: 'generating';
      practiceSetId: string;
      pollAfterMs: number;
    }
  | {
      status: 'invalidated' | 'not_found';
    };

export async function getPracticeSetApi(
  lessonId: string,
  practiceSetId: string,
): Promise<GetPracticeSetResponse> {
  const token = await lessonTokenFor(lessonId);
  const baseUrl = getAppConfig().apiBaseUrl;
  const url = `${baseUrl}/v1/practice-sets/${practiceSetId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    const data = await response.json();
    return {
      status: data.status,
      practiceSet: data,
    };
  }

  if (response.status === 202) {
    const data = await response.json();
    return {
      status: data.status,
      practiceSetId: data.practice_set_id,
      pollAfterMs: data.poll_after_ms,
    };
  }

  if (response.status === 410) {
    return {status: 'invalidated'};
  }
  if (response.status === 404) {
    return {status: 'not_found'};
  }

  throw new Error(`Failed to get practice set: ${response.status}`);
}
