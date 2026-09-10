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
    };

export async function createPracticeSetApi(
  lessonId: string,
  lessonRevision: number,
  config: PracticeConfigInput,
  idempotencyKey: string,
): Promise<CreatePracticeSetResponse> {
  const token = await getLessonToken(lessonId);
  const baseUrl = getAppConfig().apiBaseUrl;
  const url = `${baseUrl}/v1/lessons/${lessonId}/practice-sets`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
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
  const token = await getLessonToken(lessonId);
  const baseUrl = getAppConfig().apiBaseUrl;
  const url = `${baseUrl}/v1/practice-sets/${practiceSetId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
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
