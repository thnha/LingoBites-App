declare global {
  var fetch: typeof globalThis.fetch;
  var crypto: {
    randomUUID: () => string;
  };
}
export {};