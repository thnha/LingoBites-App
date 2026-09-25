import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  fetchLessonServerCapabilities,
  isUnifiedLessonReady,
  useLessonServerCapabilities,
} from '../lessonCapabilities';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(ok: boolean, body: unknown) {
  return {
    ok,
    json: async () => body,
  };
}

function fullCapsBody(overrides: Record<string, boolean> = {}) {
  return {
    capabilities: {
      youtube: {enabled: true},
      lessons: {
        catalog: true,
        canonical_delivery: true,
        ai_materialization: true,
        packaged_import: true,
        ...overrides,
      },
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchLessonServerCapabilities', () => {
  it('parses the full lessons capability set', async () => {
    mockFetch.mockResolvedValue(jsonResponse(true, fullCapsBody()));
    await expect(fetchLessonServerCapabilities()).resolves.toEqual({
      catalog: true,
      canonicalDelivery: true,
      aiMaterialization: true,
      packagedImport: true,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/v1/capabilities',
      expect.objectContaining({headers: {Accept: 'application/json'}}),
    );
  });

  it('resolves an old server without a lessons key to all-false', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(true, {capabilities: {youtube: {enabled: true}}}),
    );
    await expect(fetchLessonServerCapabilities()).resolves.toEqual({
      catalog: false,
      canonicalDelivery: false,
      aiMaterialization: false,
      packagedImport: false,
    });
  });

  it('fails closed on non-OK status, invalid body, and network errors', async () => {
    const allOff = {
      catalog: false,
      canonicalDelivery: false,
      aiMaterialization: false,
      packagedImport: false,
    };
    mockFetch.mockResolvedValue(jsonResponse(false, fullCapsBody()));
    await expect(fetchLessonServerCapabilities()).resolves.toEqual(allOff);

    mockFetch.mockResolvedValue(jsonResponse(true, {nope: true}));
    await expect(fetchLessonServerCapabilities()).resolves.toEqual(allOff);

    mockFetch.mockRejectedValue(new Error('network down'));
    await expect(fetchLessonServerCapabilities()).resolves.toEqual(allOff);
  });
});

describe('isUnifiedLessonReady', () => {
  const on = {
    catalog: true,
    canonicalDelivery: true,
    aiMaterialization: true,
    packagedImport: true,
  };
  const off = {
    catalog: false,
    canonicalDelivery: false,
    aiMaterialization: false,
    packagedImport: false,
  };

  it('requires the flag and catalog, delivery, and materialization', () => {
    expect(isUnifiedLessonReady({unifiedLesson: true}, on)).toBe(true);
    expect(isUnifiedLessonReady({unifiedLesson: false}, on)).toBe(false);
    expect(isUnifiedLessonReady({}, on)).toBe(false);
    expect(isUnifiedLessonReady({unifiedLesson: true}, off)).toBe(false);
    expect(
      isUnifiedLessonReady({unifiedLesson: true}, {...on, catalog: false}),
    ).toBe(false);
    expect(
      isUnifiedLessonReady(
        {unifiedLesson: true},
        {...on, aiMaterialization: false},
      ),
    ).toBe(false);
  });
});

function Probe({enabled}: {enabled: boolean}) {
  const caps = useLessonServerCapabilities(enabled);
  return <>{caps.catalog && caps.aiMaterialization ? 'on' : 'off'}</>;
}

async function renderProbe(enabled: boolean) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(<Probe enabled={enabled} />);
    await Promise.resolve();
  });
  return tree;
}

describe('useLessonServerCapabilities', () => {
  it('never probes while disabled', async () => {
    const tree = await renderProbe(false);
    expect(tree.toJSON()).toBe('off');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('resolves ready capabilities after the probe', async () => {
    mockFetch.mockResolvedValue(jsonResponse(true, fullCapsBody()));
    const tree = await renderProbe(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(tree.toJSON()).toBe('on');
  });
});
