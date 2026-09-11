import i18n from '@/i18n';
import {getAppConfig} from '@shared/api/appConfig';
import {createRequestId} from '@shared/api/requestId';
import {
  CreateYouTubeTranscriptResponseSchema,
  validateGetYouTubeTranscriptResponse,
  type RawCue,
  type YouTubeErrorCode,
  type YouTubeTranscript,
} from '@shared/schemas/youtube-transcript-v1';

const POLL_INTERVAL_MS = 1_000;
const POLL_DEADLINE_MS = 75_000;

export type YouTubeJobProgress = {percent: number; stage: string | null};
export type YouTubeJobResult =
  | {ok: true; lesson: YouTubeTranscript}
  | {ok: false; cancelled: true}
  | {ok: false; errorCode: YouTubeErrorCode | 'NETWORK_ERROR'; message: string};

const YOUTUBE_WATCH_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);

function videoIdFromYouTubeWatchUrl(url: URL): string | null {
  if (url.pathname === '/watch') {
    return url.searchParams.get('v');
  }
  if (/^\/(shorts|embed)\//.test(url.pathname)) {
    return url.pathname.split('/')[2] ?? null;
  }
  return null;
}

export function parseYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') {
      id = url.pathname.slice(1).split('/')[0] ?? null;
    } else if (YOUTUBE_WATCH_HOSTS.has(host)) {
      id = videoIdFromYouTubeWatchUrl(url);
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function errorMessage(code: string): string {
  const normalized = code.toLowerCase();
  const key = normalized.startsWith('youtube_')
    ? `errors.youtube_${normalized.slice('youtube_'.length)}`
    : normalized.startsWith('transcript_')
    ? `errors.${normalized}`
    : `errors.${normalized}`;
  const translated = i18n.t(key);
  return translated === key ? i18n.t('errors.youtube_failed') : translated;
}

function wait(ms: number, signal?: AbortSignal): Promise<boolean> {
  return new Promise(resolve => {
    if (signal?.aborted) return resolve(false);
    const timer = setTimeout(() => resolve(true), ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve(false);
      },
      {once: true},
    );
  });
}

export async function runYouTubeJob(
  url: string,
  cues?: RawCue[],
  onProgress?: (progress: YouTubeJobProgress) => void,
  signal?: AbortSignal,
): Promise<YouTubeJobResult> {
  if (signal?.aborted) return {ok: false, cancelled: true};
  const {apiBaseUrl} = getAppConfig();
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/v1/youtube/transcripts`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': createRequestId(),
      },
      body: JSON.stringify(cues ? {url, transcript: {cues}} : {url}),
      signal,
    });
  } catch {
    return signal?.aborted
      ? {ok: false, cancelled: true}
      : {
          ok: false,
          errorCode: 'NETWORK_ERROR',
          message: i18n.t('errors.network_lost'),
        };
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: i18n.t('errors.network_lost'),
    };
  }
  const parsedCreated = CreateYouTubeTranscriptResponseSchema.safeParse(body);
  if (!response.ok || !parsedCreated.success) {
    const error =
      (body as {error?: {code?: string}})?.error?.code ?? 'YOUTUBE_FAILED';
    return {
      ok: false,
      errorCode: error as YouTubeErrorCode,
      message: errorMessage(error),
    };
  }
  onProgress?.(parsedCreated.data.progress);
  const deadline = Date.now() + POLL_DEADLINE_MS;
  while (Date.now() < deadline) {
    if (!(await wait(POLL_INTERVAL_MS, signal)))
      return {ok: false, cancelled: true};
    try {
      response = await fetch(
        `${apiBaseUrl}/v1/youtube/transcripts/${parsedCreated.data.job_id}`,
        {headers: {Accept: 'application/json'}, signal},
      );
    } catch {
      return signal?.aborted
        ? {ok: false, cancelled: true}
        : {
            ok: false,
            errorCode: 'NETWORK_ERROR',
            message: i18n.t('errors.network_lost'),
          };
    }
    try {
      body = await response.json();
    } catch {
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        message: i18n.t('errors.network_lost'),
      };
    }
    const status = validateGetYouTubeTranscriptResponse(body);
    if (!status.valid)
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        message: i18n.t('errors.youtube_failed'),
      };
    onProgress?.(status.data.progress);
    if (status.data.status === 'completed' && status.data.data)
      return {ok: true, lesson: status.data.data};
    if (status.data.status === 'failed' && status.data.error)
      return {
        ok: false,
        errorCode: status.data.error.code,
        message: errorMessage(status.data.error.code),
      };
  }
  return {
    ok: false,
    errorCode: 'NETWORK_ERROR',
    message: i18n.t('errors.youtube_timeout'),
  };
}
