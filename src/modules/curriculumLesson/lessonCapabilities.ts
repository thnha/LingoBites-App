/**
 * Unified-lesson server capability probe: `GET /v1/capabilities`.
 *
 * Mirrors the Server `CapabilitiesResponseSchema` from LingoBites-Server
 * `src/app/controller/capabilities.ts` (TASK-003/005). The `lessons`
 * section is optional so an old server (no `lessons` key at all) still
 * parses and resolves every capability to `false` — new-app/old-server
 * keeps unified mode off. Fail-closed like `fetchYouTubeCapability`:
 * any network, parse, or config problem resolves to all-`false`.
 */
import {authenticatedFetch} from '@shared/api/authenticatedFetch';
import {getAppConfig} from '@shared/api/appConfig';
import {useEffect, useState} from 'react';
import {z} from 'zod';

export const LessonServerCapabilitiesSchema = z.object({
  capabilities: z.object({
    lessons: z
      .object({
        catalog: z.boolean(),
        canonical_delivery: z.boolean(),
        ai_materialization: z.boolean(),
        packaged_import: z.boolean(),
      })
      .optional(),
  }),
});

export type LessonServerCapabilities = {
  catalog: boolean;
  canonicalDelivery: boolean;
  aiMaterialization: boolean;
  packagedImport: boolean;
};

const ALL_OFF: LessonServerCapabilities = {
  catalog: false,
  canonicalDelivery: false,
  aiMaterialization: false,
  packagedImport: false,
};

export async function fetchLessonServerCapabilities(
  signal?: AbortSignal,
): Promise<LessonServerCapabilities> {
  try {
    const {apiBaseUrl} = getAppConfig();
    const response = await authenticatedFetch(`${apiBaseUrl}/v1/capabilities`, {
      headers: {Accept: 'application/json'},
      signal,
    });
    if (!response.ok) return ALL_OFF;
    const body: unknown = await response.json();
    const parsed = LessonServerCapabilitiesSchema.safeParse(body);
    if (!parsed.success || !parsed.data.capabilities.lessons) return ALL_OFF;
    const lessons = parsed.data.capabilities.lessons;
    return {
      catalog: lessons.catalog,
      canonicalDelivery: lessons.canonical_delivery,
      aiMaterialization: lessons.ai_materialization,
      packagedImport: lessons.packaged_import,
    };
  } catch {
    return ALL_OFF;
  }
}

export type UnifiedLessonReleaseFlags = {
  unifiedLesson?: boolean;
};

/**
 * Unified mode is available only when the release flag AND the server
 * capabilities agree. The probe runs only when `enabled` (i.e. the flag
 * is on), so flag-off builds and tests never send the request.
 */
export function useLessonServerCapabilities(
  enabled: boolean,
): LessonServerCapabilities {
  const [capabilities, setCapabilities] =
    useState<LessonServerCapabilities>(ALL_OFF);
  useEffect(() => {
    if (!enabled) {
      setCapabilities(ALL_OFF);
      return;
    }
    const controller = new AbortController();
    void fetchLessonServerCapabilities(controller.signal).then(value => {
      if (!controller.signal.aborted) {
        setCapabilities(value);
      }
    });
    return () => controller.abort();
  }, [enabled]);
  return capabilities;
}

/**
 * Release gate for the unified lesson experience. Old servers (or an
 * unreachable backend) resolve capabilities to all-`false`, keeping
 * unified mode off and the app on its legacy flows.
 */
export function isUnifiedLessonReady(
  flags: UnifiedLessonReleaseFlags,
  capabilities: LessonServerCapabilities,
): boolean {
  return (
    flags.unifiedLesson === true &&
    capabilities.catalog &&
    capabilities.canonicalDelivery &&
    capabilities.aiMaterialization
  );
}
